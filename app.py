from flask import Flask, request, jsonify
import joblib
import numpy as np
import traceback
from flask_cors import CORS  # ✅ CORS import

app = Flask(__name__)
CORS(app)  # ✅ Enable CORS for all routes (React connection allowed)

# Load artifacts
scaler = joblib.load('scaler.joblib')
model = joblib.load('logistic_regression.joblib')  # or naive_bayes.joblib

features = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
            'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json  # expecting dict with feature names or positional list
        # Accept either dict or list
        if isinstance(data, dict):
            X = [data.get(f, 0) for f in features]
        elif isinstance(data, list):
            X = data
        else:
            return jsonify({'error': 'Invalid input format'}), 400

        X = np.array(X, dtype=float).reshape(1, -1)
        X_scaled = scaler.transform(X)
        proba = model.predict_proba(X_scaled)[0][1] if hasattr(model, 'predict_proba') else None
        pred = int(model.predict(X_scaled)[0])

        # threshold logic
        threshold_high = 0.6
        if proba is None:
            label = "Diabetic" if pred == 1 else "Non-Diabetic"
        else:
            if proba >= threshold_high:
                label = "Diabetic - High Risk"
            elif proba >= 0.4:
                label = "Borderline"
            else:
                label = "Non-Diabetic"

        return jsonify({
            'prediction': int(pred),
            'probability': float(proba) if proba is not None else None,
            'label': label
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
