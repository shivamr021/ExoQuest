from fastapi import FastAPI
from schemas import PredictionRequest
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],  # or your exact origin(s)

    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"],

)
# This list contains the 36 feature names in the exact order the model expects.
# 'koi_score' has been removed as it was dropped during training.
MODEL_COLUMNS = [
    'koi_period', 'koi_period_err1', 'koi_period_err2', 'koi_time0bk',
    'koi_time0bk_err1', 'koi_time0bk_err2', 'koi_impact', 'koi_impact_err1',
    'koi_impact_err2', 'koi_duration', 'koi_duration_err1', 'koi_duration_err2',
    'koi_depth', 'koi_depth_err1', 'koi_depth_err2', 'koi_prad', 'koi_prad_err1',
    'koi_prad_err2', 'koi_teq', 'koi_insol', 'koi_insol_err1', 'koi_insol_err2',
    'koi_model_snr', 'koi_tce_plnt_num', 'koi_steff', 'koi_steff_err1',
    'koi_steff_err2', 'koi_slogg', 'koi_slogg_err1', 'koi_slogg_err2',
    'koi_srad', 'koi_srad_err1', 'koi_srad_err2', 'ra', 'dec', 'koi_kepmag'
]

# Load your trained model
# Ensure the path is correct relative to where you run uvicorn
try:
    # Assuming 'main.py' is in 'backend/' and 'my_random_forest.pkl' is in 'model/'
    model = joblib.load("model/my_random_forest.pkl")
    print("✅ Model loaded successfully.")
except FileNotFoundError:
    model = None
    print("🚨 Model file not found. Place 'my_random_forest.pkl' in the 'model' directory.")


@app.get("/")
def read_root():
    return {"message": "Exoplanet Prediction API is running."}


@app.post("/predict")
def predict_exoplanet(request: PredictionRequest):
    if model is None:
        return {"error": "Model not loaded. Cannot make predictions."}

    # Convert the incoming request data into a dictionary
    input_dict = request.dict()

    # Create a pandas DataFrame from the dictionary
    input_df = pd.DataFrame([input_dict])

    # Reorder the DataFrame columns to match the exact order the model was trained on
    input_df = input_df[MODEL_COLUMNS]

    # Make the prediction
    prediction = model.predict(input_df)
    probability = model.predict_proba(input_df)

    # Return the result
    return {
        "prediction_label": int(prediction[0]),
        "prediction_probability_of_being_exoplanet": float(probability[0][1])
    }