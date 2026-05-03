# HealthAI — Symptom-Based Disease Prediction System

[![GitHub repo](https://img.shields.io/badge/repo-healthai--disease--prediction-blue?logo=github)](https://github.com/gagannchandra/healthai-disease-prediction)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green)

> A B.Tech Final Year Project (AI Specialization) — an end-to-end, full-stack ML application that predicts potential diseases from user-reported symptoms using a three-model ensemble (Decision Tree · Random Forest · Naive Bayes), returns top-3 ranked diagnoses with confidence scores, and recommends the appropriate medical specialist — all through a responsive React interface with voice-input support.

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
- Uses a soft-voting ensemble across three heterogeneous classifiers to improve robustness over any single model.
- Achieves **87.84% ensemble accuracy** across **141 disease classes** and **343 symptom features** on a dataset of 102,238 samples.

---

## Live Demo & Screenshots

> _Add your deployment URL and screenshot images here once deployed._

| Page | Description |
|---|---|
| Home | Hero landing page with quick-start CTA |
| Predict | Searchable symptom selector with voice input |
| Results | Top-3 diagnoses, confidence bar chart, doctor recommendation, disease profile |
| History | Past predictions saved locally per user |
| Chatbot | Rule-based health assistant for quick queries |

---

## Key Features

| Feature | Details |
|---|---|
| **Ensemble Prediction** | Soft-voting across Decision Tree, Random Forest, and Naive Bayes; averaged probability scores surface the top-3 most likely diseases |
| **Confidence Scoring** | Each prediction carries a confidence percentage derived from averaged model probabilities |
| **Voice Input** | Web Speech API integration — speak symptoms directly into the browser |
| **Doctor Recommendation** | Deterministic mapping of predicted disease → medical specialist (e.g. Cardiologist, Neurologist) with links to Apollo 24/7 and Practo |
| **Comprehensive Disease Profile** | Per-disease description, recommended diet, medications, safety precautions, and workout suggestions, loaded from structured CSV datasets and a pre-built JSON knowledge base |
| **Model Comparison Chart** | Recharts bar chart comparing individual model confidence scores for the top-3 predictions |
| **AI Health Chatbot** | Rule-based chatbot for common health queries (fever, headache, stomach pain, etc.) |
| **Prediction History** | Predictions persisted to localStorage per logged-in user for session-aware history tracking |
| **Auth Flow** | Client-side login/register stored in localStorage (prototype-level auth for educational use) |
| **Responsive UI** | Built with Tailwind CSS + React 19; mobile-first layout |

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| API Framework | FastAPI 0.110+ with Uvicorn ASGI server |
| ML Library | Scikit-learn 1.4+ (Decision Tree, Random Forest, Naive Bayes) |
| Boosting | XGBoost 3.2 (XGBClassifier / XGBRFClassifier with custom wrapper) |
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
| Charts | Recharts 3 |
| Icons | Lucide React |

---

## ML Model Performance

### Comprehensive Metrics (102,238-sample dataset)

| Metric | Decision Tree | Random Forest | Naive Bayes | **Ensemble** |
|---|---|---|---|---|
| Training Accuracy | 95.93% | 82.36% | 89.42% | — |
| **Testing Accuracy** | **86.62%** | **81.09%** | **87.89%** | **87.84%** |
| Precision | 87.64% | 67.51% | 82.81% | — |
| Recall | 87.86% | 69.73% | 81.56% | — |
| F1-Score | 87.69% | 66.68% | 81.30% | — |
| Training Time | 108.5 s | 54.7 s | 0.63 s | — |
| Inference Time | 0.070 ms | 0.066 ms | 0.188 ms | — |
| Memory Usage | 55.72 MB | 25.85 MB | 0.77 MB | — |
| Confidence Score | 95.42% | 93.37% | 94.70% | — |

**API Performance:** 5.32 ms average response time · ~187 requests/sec per core

**Dataset split:** 80% train / 20% test · Random state: 42

> Naive Bayes achieves 100% accuracy on the legacy 42-sample test split (Training.csv / Testing.csv) due to the small, clean nature of that subset. Comprehensive metrics above reflect the full 102,238-sample evaluation.

---

## Dataset

| Property | Value |
|---|---|
| Total Samples | 102,238 rows |
| Disease Classes | 141 |
| Symptom Features | 343 binary symptom columns |
| Samples per Disease | min 150 · mean 725 · max 1,219 |
| Sources | `disease_dataset.csv` + `Diseases_and_Symptoms_dataset.csv` merged and cleaned |

**Supplementary CSVs loaded at inference time:**

- `description.csv` — Plain-language disease descriptions
- `medications.csv` — Common medications per disease
- `diets.csv` — Recommended dietary guidance
- `precautions.csv` — Safety precautions
- `workout.csv` — Exercise recommendations

---

## Project Structure

```
healthai-disease-prediction/
├── backend/
│   ├── app.py                  # FastAPI application & REST endpoints
│   ├── disease_logic.py        # Doctor mapping, disease details loader, chatbot logic
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
│   │   └── workout.csv
│   └── models/
│       ├── dt_model.joblib         # Serialised Decision Tree
│       ├── rf_model.joblib         # Serialised Random Forest
│       ├── nb_model.joblib         # Serialised Naive Bayes
│       ├── symptoms_list.joblib    # Ordered list of 343 symptom feature names
│       ├── diseases_list.joblib    # List of 141 disease class labels
│       ├── disease_info.json       # Pre-built knowledge base (description, diet, meds, etc.)
│       ├── model_metrics.txt       # Quick metrics report (legacy test split)
│       └── comprehensive_metrics.txt  # Full metrics report (102K-sample evaluation)
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx        # Landing page
    │   │   ├── Predict.jsx     # Symptom selector with voice input
    │   │   ├── Results.jsx     # Prediction results, charts, disease profile
    │   │   ├── History.jsx     # Past predictions
    │   │   ├── Auth.jsx        # Login/Register
    │   │   └── About.jsx       # Project info
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   └── Chatbot.jsx     # Floating health assistant chatbot
    │   └── utils/
    │       └── api.js          # Axios API client
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

Returns the full list of 343 supported symptoms.

**Response:**
```json
{
  "symptoms": [
    { "id": "itching", "name": "Itching" },
    { "id": "skin_rash", "name": "Skin Rash" },
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
  "top_3": [
    { "disease": "Fungal Infection", "confidence": 94.7 },
    { "disease": "Psoriasis",        "confidence": 3.1  },
    { "disease": "Impetigo",         "confidence": 1.2  }
  ],
  "model_predictions": {
    "Decision Tree": "Fungal Infection",
    "Random Forest": "Fungal Infection",
    "Naive Bayes":   "Fungal Infection"
  },
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
        ├─► Build 343-dimensional binary input vector
        │
        ├─► Run Decision Tree  ──┐
        ├─► Run Random Forest  ──┤──► Soft vote (average predict_proba)
        └─► Run Naive Bayes    ──┘
                                 │
                                 ▼
                    Rank classes by average probability
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
           • Primary diagnosis card
           • Confidence bar chart (Recharts)
           • Model comparison table
           • Doctor recommendation + links
           • Comprehensive disease profile
```

---

## Disclaimer

HealthAI is built for educational purposes as part of a B.Tech Final Year Project (AI specialization) at Pranveer Singh Institute of Technology, Kanpur (AKTU). Predictions generated by the machine learning models are **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified and licensed healthcare provider for an accurate clinical assessment.
