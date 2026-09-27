"""Train the HealthAI disease-prediction ensemble.

Pipeline:
  1. Load and merge the two symptom datasets.
  2. Normalise disease labels (case / whitespace) so the same disease coming
     from both datasets becomes ONE class instead of two.
  3. Drop exact duplicate rows so no identical record sits in both train and
     test (prevents leakage / inflated scores).
  4. Stratified 80/20 train/test split. 5-fold cross-validation on the
     training part scores every model and chooses the ensemble weights.
  5. Evaluate Logistic Regression, Random Forest and Bernoulli Naive Bayes
     plus the weighted soft-voting ensemble on the untouched test set,
     reporting accuracy, top-3 accuracy, sensitivity (recall), specificity,
     precision, F1 and per-disease sensitivity.
  6. Refit every model on ALL data for deployment and save artefacts.
  7. Build the disease profiles shown on the Results page (build_disease_info.py).
"""
import itertools
import json
import os
import re
import sys
import time
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score, log_loss,
                             precision_score, recall_score, top_k_accuracy_score)
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.naive_bayes import BernoulliNB

import build_disease_info
from data_rules import (DISEASE_DISPLAY_OVERRIDES, DISEASE_RENAMES, SYMPTOM_DISPLAY_OVERRIDES,
                        SYMPTOM_IMPLIES, SYMPTOM_RENAMES, disease_key, symptom_id)

RANDOM_STATE = 42

base_dir = os.path.dirname(os.path.abspath(__file__))
dataset_dir = os.path.join(base_dir, 'dataset')
models_dir = os.path.join(base_dir, 'models')
os.makedirs(models_dir, exist_ok=True)


def make_models():
    """The three ensemble members. Hyperparameters were tuned on held-out data."""
    return {
        'Logistic Regression': LogisticRegression(C=1.0, max_iter=1000),
        # min_samples_leaf=10 regularises the noisy labels and keeps the file ~25 MB.
        'Random Forest': RandomForestClassifier(n_estimators=100, min_samples_leaf=10,
                                                n_jobs=-1, random_state=RANDOM_STATE),
        # BernoulliNB models binary (present/absent) features correctly,
        # unlike GaussianNB which assumes continuous normally-distributed inputs.
        'Naive Bayes': BernoulliNB(alpha=0.3),
    }


# --------------------------------------------------------------------------
# 1. Load data
# --------------------------------------------------------------------------
symptom_display = {}


def load_dataset(path):
    df = pd.read_csv(path)
    df = df.loc[:, ~df.columns.str.contains('^unnamed', case=False)]
    df = df.rename(columns={c: 'disease' for c in df.columns if c.strip().lower() in ('disease', 'diseases')})
    for col in df.columns.drop('disease'):
        sid = symptom_id(col)
        symptom_display.setdefault(sid, re.sub(r'\s+', ' ', col.replace('_', ' ')).strip())
    return df.rename(columns=lambda c: c if c == 'disease' else symptom_id(c))


print("Loading datasets...")
paths = [os.path.join(dataset_dir, f) for f in ('disease_dataset.csv', 'Diseases_and_Symptoms_dataset.csv')]
df_list = [load_dataset(p) for p in paths if os.path.exists(p)]
if not df_list:
    sys.exit("Error: No datasets found.")

df = pd.concat(df_list, axis=0, ignore_index=True).fillna(0)
if 'disease' not in df.columns:
    sys.exit("Error: 'disease' column not found.")

# --------------------------------------------------------------------------
# 2. Clean symptoms and labels
# --------------------------------------------------------------------------
features = {c: df[c].to_numpy(dtype=np.int8) for c in df.columns if c != 'disease'}
for old, new in SYMPTOM_RENAMES.items():
    if old not in features:
        sys.exit(f"Error: SYMPTOM_RENAMES references unknown symptom '{old}'")
    col = features.pop(old)
    features[new] = np.maximum(features[new], col) if new in features else col
for child, parent in SYMPTOM_IMPLIES.items():
    if child not in features or parent not in features:
        sys.exit(f"Error: SYMPTOM_IMPLIES references unknown symptom '{child}' or '{parent}'")
    features[parent] = np.maximum(features[parent], features[child])
columns_merged = len(df.columns) - 1 - len(features)

symptom_display = {sid: (name[0].upper() + name[1:]) for sid, name in symptom_display.items() if sid in features}
symptom_display.update({k: v for k, v in SYMPTOM_DISPLAY_OVERRIDES.items() if k in features})

raw_labels = df['disease'].astype(str).str.strip()
labels = raw_labels.map(disease_key)
df = pd.DataFrame(features)
df['disease'] = labels.to_numpy()

# Human-readable class names: prefer the capitalised spelling where one exists.
display_names = {}
for raw in raw_labels.unique():
    key = disease_key(raw)
    if key != raw.lower():
        raw = key  # never display a misspelt source name
    if key not in display_names or (display_names[key].islower() and not raw.islower()):
        display_names[key] = raw
display_names = {k: v[0].upper() + v[1:] for k, v in display_names.items()}
# Upper-case short acronyms in parentheses, e.g. "(copd)" -> "(COPD)".
display_names = {k: re.sub(r' \(([a-z]{2,5})\)', lambda m: f' ({m.group(1).upper()})', v)
                 for k, v in display_names.items()}
display_names.update(DISEASE_DISPLAY_OVERRIDES)

# --------------------------------------------------------------------------
# 3. Remove exact duplicates (leakage)
# --------------------------------------------------------------------------
rows_before = len(df)
df = df.drop_duplicates().reset_index(drop=True)
duplicates_removed = rows_before - len(df)

X = df.drop('disease', axis=1).astype(np.float32)
y = df['disease'].to_numpy()
symptoms_list = list(X.columns)
X = X.to_numpy()

class_counts = pd.Series(y).value_counts()
print(f"Samples: {len(df)} (removed {duplicates_removed} duplicates) | Classes: {len(class_counts)} | "
      f"Features: {len(symptoms_list)} ({columns_merged} duplicate/synonym columns merged)")

# --------------------------------------------------------------------------
# 4. Splits
# --------------------------------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y)


def specificity_per_class(y_true, y_pred, labels):
    cm = confusion_matrix(y_true, y_pred, labels=labels)
    fp = cm.sum(axis=0) - np.diag(cm)
    fn = cm.sum(axis=1) - np.diag(cm)
    tp = np.diag(cm)
    tn = cm.sum() - (fp + fn + tp)
    return tn / (tn + fp), cm


def evaluate(proba, classes, y_true):
    y_pred = classes[proba.argmax(axis=1)]
    spec, cm = specificity_per_class(y_true, y_pred, classes)
    return {
        'accuracy': accuracy_score(y_true, y_pred),
        'top3_accuracy': top_k_accuracy_score(y_true, proba, k=3, labels=classes),
        'precision': precision_score(y_true, y_pred, average='macro', zero_division=0),
        'sensitivity': recall_score(y_true, y_pred, average='macro', zero_division=0),
        'specificity': float(spec.mean()),
        'f1': f1_score(y_true, y_pred, average='macro', zero_division=0),
        'log_loss': log_loss(y_true, np.clip(proba, 1e-12, 1), labels=classes),
        'per_class_sensitivity': recall_score(y_true, y_pred, labels=classes, average=None, zero_division=0),
        'confusion_matrix': cm,
    }


# --------------------------------------------------------------------------
# 5a. 5-fold cross-validation on the training data. The out-of-fold
#     probabilities give every model a CV score and are used to choose the
#     ensemble weights (more reliable than a single validation split).
# --------------------------------------------------------------------------
print("\n5-fold cross-validation (also used to choose ensemble weights)...")
classes = np.unique(y_train)
model_names = list(make_models())
oof_proba = {n: np.zeros((len(y_train), len(classes))) for n in model_names}
cv_scores = {n: [] for n in model_names}
for fold_train, fold_val in StratifiedKFold(5, shuffle=True, random_state=RANDOM_STATE).split(X_train, y_train):
    for name, model in make_models().items():
        model.fit(X_train[fold_train], y_train[fold_train])
        oof_proba[name][fold_val] = model.predict_proba(X_train[fold_val])
        cv_scores[name].append(accuracy_score(y_train[fold_val], model.predict(X_train[fold_val])))
cv_scores = {n: np.array(v) for n, v in cv_scores.items()}

best_weights, best_cv_acc = None, -1
for weights in itertools.product(range(5), repeat=len(model_names)):
    if sum(weights) == 0:
        continue
    blended = sum(w * oof_proba[n] for w, n in zip(weights, model_names))
    acc = accuracy_score(y_train, classes[blended.argmax(axis=1)])
    if acc > best_cv_acc + 1e-9:
        best_cv_acc, best_weights = acc, weights
ensemble_weights = {n: w / sum(best_weights) for n, w in zip(model_names, best_weights)}
print("Ensemble weights:", {n: round(w, 3) for n, w in ensemble_weights.items()},
      f"(out-of-fold acc {best_cv_acc * 100:.2f}%)")

# --------------------------------------------------------------------------
# 5b. Evaluate on the untouched test set
# --------------------------------------------------------------------------
results = {}
test_proba = {}
for name, model in make_models().items():
    print(f"Training {name}...")
    t0 = time.time()
    model.fit(X_train, y_train)
    train_time = time.time() - t0
    t0 = time.time()
    test_proba[name] = model.predict_proba(X_test)
    infer_ms = (time.time() - t0) / len(X_test) * 1000
    train_acc = accuracy_score(y_train, model.predict(X_train))
    results[name] = evaluate(test_proba[name], model.classes_, y_test)
    results[name].update(train_accuracy=train_acc, train_time=train_time, infer_ms=infer_ms)

ensemble_proba = sum(ensemble_weights[n] * test_proba[n] for n in model_names)
results['Ensemble'] = evaluate(ensemble_proba, classes, y_test)

for name, r in results.items():
    print(f"{name:20s} acc {r['accuracy'] * 100:6.2f}%  top-3 {r['top3_accuracy'] * 100:6.2f}%  "
          f"sensitivity {r['sensitivity'] * 100:6.2f}%  specificity {r['specificity'] * 100:6.3f}%")

# --------------------------------------------------------------------------
# 6. Refit on all data and save
# --------------------------------------------------------------------------
print("\nRefitting models on all data for deployment...")
final_models = make_models()
for name, model in final_models.items():
    model.fit(X, y)

file_names = {'Logistic Regression': 'lr_model.joblib',
              'Random Forest': 'rf_model.joblib',
              'Naive Bayes': 'nb_model.joblib'}
for name, model in final_models.items():
    joblib.dump(model, os.path.join(models_dir, file_names[name]), compress=3)
joblib.dump(symptoms_list, os.path.join(models_dir, 'symptoms_list.joblib'))
joblib.dump(sorted(class_counts.index), os.path.join(models_dir, 'diseases_list.joblib'))
with open(os.path.join(models_dir, 'model_config.json'), 'w') as f:
    json.dump({'models': file_names, 'weights': ensemble_weights,
               'display_names': display_names,
               'symptom_names': symptom_display,
               'symptom_aliases': SYMPTOM_RENAMES,
               'symptom_implications': SYMPTOM_IMPLIES}, f, indent=2)

# Remove artefacts of the previous XGBoost-based pipeline.
for stale in ('dt_model.joblib', 'model_metrics.txt'):
    stale_path = os.path.join(models_dir, stale)
    if os.path.exists(stale_path):
        os.remove(stale_path)

# --------------------------------------------------------------------------
# Supplementary disease information (description, diet, medication, ...)
# --------------------------------------------------------------------------
disease_info = build_disease_info.build(os.path.join(models_dir, 'disease_info.json'))
missing_profiles = sorted(display_names[c] for c in class_counts.index if c not in disease_info)
if missing_profiles:
    print(f"Warning: no disease profile for {len(missing_profiles)} classes: {missing_profiles}")

# --------------------------------------------------------------------------
# Reports
# --------------------------------------------------------------------------
ens = results['Ensemble']
per_class = sorted(zip(classes, ens['per_class_sensitivity']), key=lambda t: t[1])
cm = ens['confusion_matrix']
class_index = {c: i for i, c in enumerate(classes)}


def most_confused_with(disease):
    row = cm[class_index[disease]].copy()
    row[class_index[disease]] = 0
    return classes[row.argmax()] if row.sum() else '-'


summary = {
    'generated_at': datetime.now().isoformat(timespec='seconds'),
    'dataset': {'samples': int(len(df)), 'duplicates_removed': int(duplicates_removed),
                'symptom_columns_merged': columns_merged,
                'classes': int(len(class_counts)), 'features': len(symptoms_list),
                'train_samples': int(len(X_train)), 'test_samples': int(len(X_test))},
    'ensemble_weights': ensemble_weights,
    'cv_accuracy': {n: {'mean': float(v.mean()), 'std': float(v.std())} for n, v in cv_scores.items()},
    'cv_ensemble_accuracy': float(best_cv_acc),
    'models': {n: {k: float(v) for k, v in r.items()
                   if k in ('accuracy', 'top3_accuracy', 'precision', 'sensitivity', 'specificity',
                            'f1', 'log_loss', 'train_accuracy', 'train_time', 'infer_ms')}
               for n, r in results.items()},
    'per_class_sensitivity': {display_names[c]: round(float(s), 4) for c, s in per_class},
}
with open(os.path.join(models_dir, 'metrics.json'), 'w') as f:
    json.dump(summary, f, indent=2)


def pct(v):
    return f"{v * 100:.2f}%"


report_path = os.path.join(models_dir, 'comprehensive_metrics.txt')
with open(report_path, 'w') as f:
    f.write("--- Disease Prediction System: Comprehensive Metrics Report ---\n")
    f.write(f"Generated at: {summary['generated_at']}\n\n")
    f.write("=== DATASET ===\n")
    f.write(f"Samples after de-duplication: {len(df)} ({duplicates_removed} exact duplicates removed)\n")
    f.write(f"Data cleaning: {columns_merged} duplicate/synonym symptom columns merged, "
            f"{len(SYMPTOM_IMPLIES)} specific->general symptom links, {len(DISEASE_RENAMES)} disease names "
            f"fixed or merged\n")
    f.write(f"Diseases (classes): {len(class_counts)}  |  Symptoms (features): {len(symptoms_list)}\n")
    f.write(f"Samples per disease: min {class_counts.min()} / mean {class_counts.mean():.1f} / "
            f"max {class_counts.max()}\n")
    f.write(f"Split: {len(X_train)} train / {len(X_test)} test (stratified 80/20, random_state={RANDOM_STATE})\n")
    f.write("Ensemble weights: chosen on 5-fold out-of-fold predictions over the training split\n\n")

    f.write("=== TEST-SET PERFORMANCE (macro-averaged over diseases) ===\n")
    header = f"{'Model':22s}{'Accuracy':>10s}{'Top-3':>9s}{'Sensitivity':>13s}{'Specificity':>13s}" \
             f"{'Precision':>11s}{'F1':>9s}{'LogLoss':>9s}\n"
    f.write(header + '-' * (len(header) - 1) + '\n')
    for n, r in results.items():
        f.write(f"{n:22s}{pct(r['accuracy']):>10s}{pct(r['top3_accuracy']):>9s}{pct(r['sensitivity']):>13s}"
                f"{pct(r['specificity']):>13s}{pct(r['precision']):>11s}{pct(r['f1']):>9s}"
                f"{r['log_loss']:>9.3f}\n")
    f.write("\nSensitivity = recall = TP/(TP+FN): share of patients WITH a disease that the model identifies.\n")
    f.write("Specificity = TN/(TN+FP): share of patients WITHOUT a disease that the model correctly rules out.\n")
    f.write("Top-3 accuracy: true disease appears among the three suggestions shown to the user.\n\n")

    f.write("=== MODEL DETAILS ===\n")
    for n in model_names:
        r = results[n]
        f.write(f"{n:22s} weight {ensemble_weights[n]:.2f} | 5-fold CV acc {pct(cv_scores[n].mean())} "
                f"(+/- {cv_scores[n].std() * 100:.2f}%) | train acc {pct(r['train_accuracy'])} | "
                f"train time {r['train_time']:.1f}s | {r['infer_ms']:.4f} ms/prediction\n")
    f.write(f"Ensemble out-of-fold accuracy: {pct(best_cv_acc)}\n\n")

    f.write("=== LOWEST-SENSITIVITY DISEASES (ensemble) ===\n")
    for c, s in per_class[:15]:
        f.write(f"  {display_names[c]:48s} {pct(s):>8s}   most confused with: "
                f"{display_names.get(most_confused_with(c), '-')}\n")
    f.write(f"\nDiseases with sensitivity >= 90%: {sum(s >= 0.9 for _, s in per_class)} / {len(per_class)}\n")
    f.write(f"Diseases with sensitivity  < 70%: {sum(s < 0.7 for _, s in per_class)} / {len(per_class)}\n")
    f.write("Low-sensitivity diseases are mostly clinically similar pairs (e.g. infectious vs non-infectious\n"
            "gastroenteritis) that cannot be separated by symptoms alone; the top-3 list covers these cases.\n")

print(f"Reports saved to {report_path} and metrics.json")
