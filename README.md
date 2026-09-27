# HealthAI — Symptom-Based Disease Prediction System

[![GitHub repo](https://img.shields.io/badge/repo-healthai--disease--prediction-blue?logo=github)](https://github.com/gagannchandra/healthai-disease-prediction)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green)

> A B.Tech Final Year Project (AI Specialization) — an end-to-end, full-stack ML application that predicts potential diseases from user-reported symptoms using a three-model ensemble (Logistic Regression · Random Forest · Bernoulli Naive Bayes), returns top-3 ranked diagnoses with confidence scores, and recommends the appropriate medical specialist — all through a responsive React interface with voice-input support.

---

## Table of Contents 

1. [Project Overview](#project-overview)
2. [Live Demo & Screenshots](#live-demo--screenshots)
3. [Key Features](#key-features)
4. [Tech Stack](#tech-stack)
5. [ML Model Performance](#ml-model-performance)
6. [Dataset](#dataset)
7. [Project Structure](#project-structure)
8. [Setup & Installation](#setup--installation)
9. [API Reference](#api-reference)
10. [How It Works](#how-it-works)
11. [Disclaimer](#disclaimer) 

---

## Project Overview

HealthAI is a B.Tech Final Year capstone project (AI specialization) that combines supervised machine learning with a production-style full-stack architecture. A user selects symptoms from a searchable list (or speaks them aloud), and the backend ensemble model identifies the most probable disease, returns a ranked shortlist of three candidates, and surfaces actionable clinical context — recommended specialist, medications, diet, precautions, and workout advice — sourced from structured medical datasets.

**Why this project matters:**
- Demonstrates end-to-end ML pipeline design: data collection → cleaning → training → serialisation → REST API → UI.
- Uses a weighted soft-voting ensemble across three heterogeneous classifiers; the weights are chosen by 5-fold cross-validation.
- Achieves **89.32% top-1 accuracy**, **98.46% top-3 accuracy** and **90.27% macro sensitivity** across **131 disease classes** and **324 cleaned symptom features** (101,326 de-duplicated samples).

---

## Live Demo 

> Link : https://healthai.gaganchandra.in

| Page | Description |
|---|---|
| Home | Hero landing page with quick-start CTA |
| Predict | Fuzzy symptom search (typos and synonyms), keyboard navigation, common-symptom shortcuts, voice input |
| Results | Top-3 conditions with confidence, urgent-care warnings, specialist links, disease profile, model agreement, print/PDF |
| History | Past predictions saved locally per user |
| Chatbot | Rule-based health assistant for quick queries |

---

## Key Features

| Feature | Details |
|---|---|
| **Ensemble Prediction** | Weighted soft-voting across Logistic Regression, Random Forest, and Bernoulli Naive Bayes; blended probability scores surface the top-3 most likely diseases |
| **Confidence Scoring** | Each prediction carries a confidence percentage derived from averaged model probabilities |
| **Smart Symptom Search** | Fuse.js fuzzy matching over names and merged synonyms ("diarrhoea", "breathlessness" still work), full keyboard support |
| **Voice Input** | Web Speech API integration — speak symptoms directly into the browser |
| **Urgent-Care Warnings** | Conditions such as heart attack, brain hemorrhage or sepsis trigger an emergency banner; urgent alternatives in the top 3 are flagged too |
| **Doctor Recommendation** | Deterministic mapping of predicted disease → medical specialist (e.g. Cardiologist, Neurologist) with links to Apollo 24/7 and Practo |
| **Comprehensive Disease Profile** | Per-disease description, recommended diet, medications, safety precautions, and workout suggestions, loaded from structured CSV datasets and a pre-built JSON knowledge base |
| **Confidence & Model Agreement** | Top-3 confidence bars with a high/moderate/low match label, a low-confidence explanation, and how many models agree |
| **AI Health Chatbot** | Rule-based chatbot for common health queries (fever, headache, stomach pain, etc.) |
| **Prediction History** | Last 50 checks persisted to localStorage per user, with per-entry delete |
| **Auth Flow** | Client-side login/register in localStorage with SHA-256-hashed passwords (prototype-level auth for educational use) |
| **Responsive, Accessible UI** | Tailwind CSS + React 19; mobile navigation menu, ARIA labels, visible keyboard focus |

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| API Framework | FastAPI 0.110+ with Uvicorn ASGI server |
| ML Library | Scikit-learn 1.4+ (Logistic Regression, Random Forest, Bernoulli Naive Bayes) |
| Serialisation | Joblib |
| Data Processing | Pandas 2.2, NumPy 1.26 |
| Validation | Pydantic v2 |
| CORS | FastAPI CORSMiddleware |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Search | Fuse.js 7 (fuzzy symptom search) |
| Icons | Lucide React |

---

## ML Model Performance

### Test-Set Metrics (20,266 held-out samples, macro-averaged over 131 diseases)

| Metric | Logistic Regression | Random Forest | Naive Bayes | **Ensemble** |
|---|---|---|---|---|
| **Accuracy** | 89.25% | 87.65% | 88.99% | **89.32%** |
| **Top-3 Accuracy** | 98.43% | 97.75% | 98.45% | **98.46%** |
| **Sensitivity (Recall)** | 90.18% | 85.68% | 89.75% | **90.27%** |
| Specificity | 99.92% | 99.90% | 99.92% | 99.92% |
| Precision | 90.37% | 88.54% | 89.18% | 90.42% |
| F1-Score | 90.09% | 86.39% | 89.24% | 90.14% |
| Log Loss | 0.231 | 0.655 | 0.206 | 0.217 |
| 5-fold CV Accuracy | 89.28% ± 0.19% | 88.01% ± 0.30% | 89.30% ± 0.22% | 89.40% (out-of-fold) |
| Ensemble Weight | 0.67 | 0.00 | 0.33 | — |

- **Sensitivity** = TP / (TP + FN): the share of patients *with* a disease that the model identifies.
- **Specificity** = TN / (TN + FP): the share of patients *without* a disease that the model correctly rules out.
- **Top-3 accuracy**: the true disease appears among the three suggestions shown to the user.
- Ensemble weights are chosen on 5-fold out-of-fold predictions over the training split. Random Forest receives zero weight but is still shown as a second opinion on the Results page.
- 85 / 131 diseases have sensitivity ≥ 90%. The weakest classes are clinically similar pairs that symptoms alone cannot separate (e.g. infectious vs non-infectious gastroenteritis, gallstone vs cholecystitis, skin polyp vs skin pigmentation disorder); the full per-disease breakdown is in `backend/models/comprehensive_metrics.txt` and `metrics.json`.

### What changed from v1 (87.84% → 89.32% accuracy)

| Problem in v1 | Fix |
|---|---|
| The same disease from the two source datasets was treated as two classes (e.g. `Allergy` vs `allergy`, `Pneumonia` vs `pneumonia`), plus trailing-space labels like `"Diabetes "` | Labels are normalised, merging 141 → 133 classes |
| 908 exact duplicate rows could land in both train and test, inflating scores | Duplicates removed before the split; split is stratified |
| Gaussian Naive Bayes assumes continuous, normally distributed inputs, but symptoms are binary | Replaced with Bernoulli Naive Bayes |
| "Decision Tree" / "Random Forest" were actually XGBoost wrappers (a 58 MB boosted model and a shallow XGBRF at 81%) | Replaced with Logistic Regression (best single model) and a regularised scikit-learn Random Forest; model files shrank from ~85 MB to ~28 MB |
| Training evaluated a hard majority vote while the API used a soft vote | Training and API both use the same weighted soft vote |
| The two datasets name the same symptom differently (`diarrhoea`/`diarrhea`, `breathlessness`/`shortness of breath`, `runny_nose`/`coryza`, …), so a symptom reached only one dataset's diseases. On test patients who use the other dataset's wording, accuracy was only **70%** | 19 duplicate/synonym columns merged and 22 specific → general links added (e.g. `high_fever` also sets `fever`); accuracy on those patients rises to **90%** (standard test accuracy on the same rows: 89.31% → 89.25%) |
| Misspelt disease names (`Peptic ulcer diseae`, `Osteoarthristis`, `Paroymsal … Vertigo`) and the same disease split across datasets (`Dimorphic hemmorhoids(piles)` / `hemorrhoids`, `Bronchial Asthma` / `asthma`) | Names fixed and classes merged (133 → 131); Hemorrhoids and Asthma now also get a full disease profile |
| 92 of 133 diseases had no specialist mapping and defaulted to "General Physician" | Every disease maps to a specialist |
| Only accuracy/precision/recall reported | Adds top-3 accuracy, specificity, per-disease sensitivity, confusion pairs, log loss and cross-validation |

---

## Dataset

| Property | Value |
|---|---|
| Total Samples | 101,326 rows (after removing 912 exact duplicates from 102,238) |
| Disease Classes | 131 |
| Symptom Features | 324 binary symptom columns (343 before merging duplicates/synonyms) |
| Samples per Disease | min 100 · mean 774 · max 1,357 |
| Sources | `disease_dataset.csv` (41 diseases) + `Diseases_and_Symptoms_dataset.csv` (100 diseases) |

**Data quality notes**

- `disease_dataset.csv` is an augmented version of the classic 41-disease Kaggle data (`Training.csv`, kept for reference but not used for training). About 35% of each disease's symptoms are dropped per row and ~16% of the listed symptoms are off-profile. This mimics real patients, who rarely report every symptom. The original `Training.csv` has only 304 unique rows, so it is too small and clean to give a meaningful test score.
- `Diseases_and_Symptoms_dataset.csv` carries inherent label noise: identical symptom sets appear under different diseases, capping achievable accuracy at roughly 95% even on training data.
- Cleaning rules live in `backend/data_rules.py` (`SYMPTOM_RENAMES`, `SYMPTOM_IMPLIES`, `DISEASE_RENAMES`) and are saved to `model_config.json`. The API applies the same rules, so legacy symptom IDs such as `diarrhoea` keep working.

**Disease profiles (description, medications, diet, precautions, workout)** are built by `backend/build_disease_info.py` into `models/disease_info.json`, and every one of the 131 diseases has a profile:

- `dataset/{description,medications,diets,precautions,workout}.csv` cover the 100 diseases of `Diseases_and_Symptoms_dataset.csv`.
- `dataset/medicine_recommendation/` covers the 41 diseases of `disease_dataset.csv`. It holds unmodified copies from the [Medicine Recommendation System Dataset](https://www.kaggle.com/datasets/noorsaeed/medicine-recommendation-system-dataset) (Noor Saeed, Apache 2.0), the original publisher of this project's 41-disease data. Its `medications.csv` is shifted by one row for 21 diseases (e.g. hemorrhoids listed heart-attack drugs); the build script re-aligns it and removes unsafe entries. See `SOURCE.md` there for checksums and every correction.

---

## Project Structure

```
healthai-disease-prediction/
├── backend/
│   ├── app.py                  # FastAPI application & REST endpoints
│   ├── disease_logic.py        # Doctor mapping, disease details loader, chatbot logic
│   ├── data_rules.py           # Data-cleaning rules (symptom synonyms, disease name fixes)
│   ├── build_disease_info.py   # Builds disease_info.json from the supplementary datasets
│   ├── train.py                # Full ML training pipeline (data loading → training → serialisation)
│   ├── requirements.txt        # Python dependencies
│   ├── dataset/
│   │   ├── disease_dataset.csv
│   │   ├── Diseases_and_Symptoms_dataset.csv
│   │   ├── Training.csv / Testing.csv
│   │   ├── description.csv
│   │   ├── medications.csv
│   │   ├── diets.csv
│   │   ├── precautions.csv
│   │   ├── workout.csv
│   │   └── medicine_recommendation/  # Profiles for the 41 dataset-A diseases (see SOURCE.md)
│   └── models/
│       ├── lr_model.joblib         # Serialised Logistic Regression
│       ├── rf_model.joblib         # Serialised Random Forest
│       ├── nb_model.joblib         # Serialised Bernoulli Naive Bayes
│       ├── model_config.json       # Model files, ensemble weights, display names, cleaning rules
│       ├── symptoms_list.joblib    # Ordered list of 324 symptom feature names
│       ├── diseases_list.joblib    # List of 131 disease class labels
│       ├── disease_info.json       # Pre-built knowledge base (description, diet, meds, etc.)
│       ├── metrics.json            # Machine-readable metrics incl. per-disease sensitivity
│       └── comprehensive_metrics.txt  # Full metrics report
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx        # Landing page
    │   │   ├── Predict.jsx     # Symptom selector with voice input
    │   │   ├── Results.jsx     # Prediction results, urgent warnings, disease profile
    │   │   ├── History.jsx     # Past predictions
    │   │   ├── Auth.jsx        # Login/Register
    │   │   ├── About.jsx       # Project info
    │   │   └── NotFound.jsx    # 404 page
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   └── Chatbot.jsx     # Floating health assistant chatbot
    │   ├── hooks/
    │   │   └── useDocumentTitle.js
    │   └── utils/
    │       ├── api.js          # Axios API client
    │       └── storage.js      # Safe localStorage helpers (user, history)
    ├── package.json
    └── vite.config.js
```

---

## Setup & Installation

### Prerequisites

- Python 3.9+
- Node.js 16+
- npm

```bash
git clone https://github.com/gagannchandra/healthai-disease-prediction.git
cd healthai-disease-prediction
```

### 1 — Backend

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Re-train models — pre-trained .joblib files are already included
# Only needed if you modify the dataset or add new diseases/symptoms
python train.py

# Start the FastAPI server
python app.py
# → Runs at http://localhost:8000
```

### 2 — Frontend

```bash
cd frontend

# Install NPM dependencies
npm install

# Start the Vite dev server
npm run dev
# → Runs at http://localhost:5173
```

Open `http://localhost:5173` in your browser. Make sure the backend is running first.

---

## API Reference

Base URL: `http://localhost:8000`

### `GET /api/symptoms`

Returns the full list of 324 supported symptoms, sorted by display name.

**Response:**
```json
{
  "symptoms": [
    { "id": "abdominal_pain", "name": "Abdominal pain", "aliases": [] },
    { "id": "coryza", "name": "Runny nose (coryza)", "aliases": ["runny nose"] },
    ...
  ]
}
```

---

### `POST /api/predict`

Accepts a list of symptom IDs and returns ranked disease predictions with doctor recommendation and disease profile.

**Request:**
```json
{
  "symptoms": ["itching", "skin_rash", "nodal_skin_eruptions"]
}
```

**Response:**
```json
{
  "final_prediction": "Fungal Infection",
  "confidence": 94.7,
  "urgent": false,
  "top_3": [
    { "disease": "Fungal Infection", "confidence": 94.7, "urgent": false },
    { "disease": "Psoriasis",        "confidence": 3.1,  "urgent": false },
    { "disease": "Impetigo",         "confidence": 1.2,  "urgent": false }
  ],
  "model_predictions": {
    "Logistic Regression": "Fungal Infection",
    "Random Forest":       "Fungal Infection",
    "Naive Bayes":         "Fungal Infection"
  },
  "unrecognized_symptoms": [],
  "doctor_recommendation": {
    "specialist": "Dermatologist",
    "reason": "Treats skin, hair, and nail conditions."
  },
  "disease_details": {
    "description": "...",
    "medications": [...],
    "diets": [...],
    "precautions": [...],
    "workouts": [...]
  }
}
```

---

### `POST /api/chat`

Simple rule-based chatbot endpoint.

**Request:**
```json
{ "message": "I have a fever" }
```

**Response:**
```json
{ "reply": "Fever is often a sign of an infection. Rest and drink plenty of fluids..." }
```

---

## How It Works

```
User selects symptoms
        │
        ▼
FastAPI /api/predict
        │
        ├─► Resolve symptom aliases + implied symptoms
        ├─► Build 324-dimensional binary input vector
        │
        ├─► Run Logistic Regression ──┐
        ├─► Run Random Forest       ──┤──► Weighted soft vote (predict_proba)
        └─► Run Naive Bayes         ──┘
                                      │
                                      ▼
                    Rank classes by blended probability
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
              Top-3 diseases          Doctor mapping
              + confidence %          (disease → specialist)
                    │
                    ▼
           disease_info.json lookup
           (description, diet, meds,
            precautions, workouts)
                    │
                    ▼
             Return JSON response
                    │
                    ▼
           React Results page renders:
           • Urgent-care banner (if needed)
           • Primary result + confidence band
           • Top-3 confidence bars
           • Model agreement
           • Doctor recommendation + links
           • Comprehensive disease profile
```

---

## Disclaimer

HealthAI is built for educational purposes as part of a B.Tech Final Year Project (AI specialization) at Pranveer Singh Institute of Technology, Kanpur (AKTU). Predictions generated by the machine learning models are **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified and licensed healthcare provider for an accurate clinical assessment.
