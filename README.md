# Mental Health Score Predictor

A machine learning web application that predicts a mental health score from student-related factors such as social media usage, sleep patterns, academic habits, physical activity, and perceived stress.

The project combines a trained machine learning model with a FastAPI backend and a web-based frontend to demonstrate an end-to-end ML deployment workflow.

## Live Demo

- **Web Application:** https://mental-health-score-predictor-1-idwp.onrender.com
- **API Documentation:** https://mental-health-score-predictor-kxq7.onrender.com/docs

## Overview

Mental health and well-being can be influenced by several lifestyle and behavioral factors. This project explores how machine learning can use selected student-related inputs to estimate a mental health score.

Users can enter their information through a web interface and receive a model-generated prediction from the deployed API.

**Note:** This is an educational machine learning project, not a clinical assessment tool. Predictions should not be used to diagnose mental health conditions or replace professional advice.

## Features

- Predicts a mental health score using a trained Random Forest Regressor.
- Accepts demographic, academic, lifestyle, and social media usage inputs.
- Provides an interactive web interface with input validation.
- Exposes a REST API built with FastAPI.
- Returns predictions as JSON.
- Includes a visual score display.
- Deploys the frontend and backend separately using Render.

## Input Features

The application accepts the following inputs:

| Category | Features |
|---|---|
| Demographic | Age, gender, country |
| Academic | Academic level, study hours |
| Social media | Most-used platform, purpose of use, average daily usage hours, daily unlocks |
| Lifestyle | Sleep hours per night, physical activity hours |
| Behavioral | Perceived stress level |

The backend also derives a grouped-country feature before passing the input to the model.

## Technology Stack

| Component | Technology |
|---|---|
| Programming language | Python |
| Data processing | Pandas |
| Machine learning | Scikit-learn |
| Model serialization | Joblib |
| Backend | FastAPI |
| API validation | Pydantic |
| Frontend | HTML, CSS, JavaScript |
| Version control | Git and GitHub |
| Deployment | Render |

## System Architecture

The application follows this workflow:

1. A user enters information in the frontend.
2. JavaScript validates and collects the form data.
3. The frontend sends a POST request to the FastAPI `/predict` endpoint.
4. FastAPI validates the request using a Pydantic model.
5. The backend prepares the input data and loads the saved machine learning model.
6. The model generates a prediction.
7. The API returns the predicted score as JSON.
8. The frontend displays the result.

```text
User
  |
  v
HTML / CSS / JavaScript
  |
  | POST /predict
  v
FastAPI Backend
  |
  v
Input Validation
  |
  v
Feature Preparation
  |
  v
Random Forest Regressor
  |
  v
Predicted Score (JSON)
  |
  v
Frontend Result Display
```

## API Usage

### Endpoint

`POST /predict`

### Example Request

```json
{
  "age": 21,
  "gender": "Male",
  "country": "India",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Entertainment",
  "avg_daily_usage_hours": 4.5,
  "daily_unlocks": 60,
  "study_hours": 5.0,
  "physical_activity_hours": 1.0,
  "sleep_hours_per_night": 7.0,
  "stress_level": "Medium"
}
```

### Example Response

```json
{
  "predicted_mental_health_score": 6.47
}
```

The response above illustrates the API response format. The predicted value depends on the submitted inputs.

You can interact with the deployed API using the Swagger documentation linked above.

## Run Locally

### Prerequisites

- Python
- Git
- pip

### 1. Clone the repository

```bash
git clone https://github.com/aryanpati31/mental-health-score-predictor.git
cd mental-health-score-predictor
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the backend

```bash
uvicorn main:app --reload
```

The API should be available at:

`http://127.0.0.1:8000`

Open the interactive API documentation at:

`http://127.0.0.1:8000/docs`

### 5. Run the frontend

Open the `frontend` directory and serve its static files using a local development server, such as the Live Server extension in VS Code.

The frontend JavaScript currently uses the deployed backend URL. For local testing, configure it to use `http://127.0.0.1:8000` instead.

## Repository Structure

```text
mental-health-score-predictor/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── main.py
├── Mental_Health_Model.pkl
├── requirements.txt
└── .python-version
```

The saved model artifact is included in the repository. The dataset and training notebook are not currently listed in the repository root.

## Future Improvements

- Add a reproducible model-training pipeline.
- Document the dataset source and preprocessing steps.
- Evaluate performance on a held-out test set.
- Compare the Random Forest model against appropriate baseline models.
- Report suitable regression metrics, such as MAE, RMSE, and R².
- Add automated tests for API validation and prediction behavior.
- Improve monitoring, error handling, and deployment reliability.
- Add model interpretability to help explain which features influence predictions.

## Limitations

- Predictions depend on the quality and representativeness of the training data.
- A predicted score does not establish a person's mental health status.
- The application has not been established as a clinically validated assessment tool.
- Model performance should be documented using measured evaluation results before drawing conclusions about predictive reliability.

## Author

**Aryan Pati**

GitHub: https://github.com/aryanpati31

