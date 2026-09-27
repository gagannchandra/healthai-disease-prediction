# Medicine Recommendation System Dataset (supplementary disease information)

Profiles (description, diet, medication, precautions, workout) for the 41 diseases
in `../disease_dataset.csv` / `../Training.csv`.

- **Source:** https://www.kaggle.com/datasets/noorsaeed/medicine-recommendation-system-dataset
- **Author:** Noor Saeed
- **License:** Apache License 2.0
- **Version:** 1 (published 2024-01-10), downloaded 2026-09-27 via the Kaggle public API
- **Provenance check:** the `Training.csv` in this dataset is identical in content to `../Training.csv`,
  so it is the original publisher of the project's 41-disease data.

The CSV files here are unmodified copies of the originals:

| File | Bytes | SHA-256 |
|---|---|---|
| description.csv | 4017 | 92479f16248a50e8d8728ebc020ce2a7c3254bea4cf9b1959344e88f2eacde7b |
| diets.csv | 4671 | 60dcd99af04627bcc9bddd1cf95298cc2df3af3c664ad89ce6be534821cb3cad |
| medications.csv | 4643 | ed20a9860e8b28dfe68a93e73315f8fac30f8275a204039f1c56d5eb43e8ce75 |
| precautions_df.csv | 3644 | 1c861595a43c106e5b5da035a0b480fd9c56008230a684f824db8ae1a16614db |
| workout_df.csv | 20266 | 6de044b92e572a74e0b4974981a7c144d3e4b87dd6b945f562925cb07289a1bd |

## Known defects (corrected in `backend/build_disease_info.py`, not in these files)

- **`medications.csv` is misaligned by one row** from "Chicken pox" to "(vertigo) Paroymsal Positional
  Vertigo": each row holds the list for the *next* disease (e.g. hemorrhoids lists heart-attack drugs,
  vertigo lists isotretinoin). The build script re-maps each disease to its correct source row.
- Chicken pox's own medication list is lost in the shift, so no medications are shown for it.
- The re-aligned Hypothyroidism row mixes in anti-thyroid treatments; only Levothyroxine is kept.
- Dengue: "Pain relievers" is replaced with "Paracetamol (avoid aspirin/NSAIDs)" per WHO dengue guidance,
  because NSAIDs increase bleeding risk; "Antiviral drugs" is dropped (there is no antiviral treatment for dengue).
- Paralysis (brain hemorrhage): "Blood thinners" and "Clot-dissolving medications" are removed; both are
  contraindicated in hemorrhagic stroke.
- Minor spelling mistakes in `precautions_df.csv` are corrected at build time.

Where a disease is also covered by the project's main supplementary files (`../description.csv` etc.),
those take precedence and this dataset is not used for it.
