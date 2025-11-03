// DiabetesForm.jsx
import React, { useState } from "react";

const initialState = {
  Pregnancies: 0,
  Glucose: 0,
  BloodPressure: 0,
  SkinThickness: 0,
  Insulin: 0,
  BMI: 0,
  DiabetesPedigreeFunction: 0,
  Age: 0,
};

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 inline-block ml-2" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  );
}

export default function DiabetesForm() {
  const [form, setForm] = useState(initialState);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // keep numeric values (allow decimals)
    setForm((prev) => ({ ...prev, [name]: value === "" ? "" : Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:5001/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Server error. Check backend." });
    } finally {
      setLoading(false);
    }
  };

  const inputs = [
    { key: "Pregnancies", placeholder: "e.g. 2" },
    { key: "Glucose", placeholder: "e.g. 120" },
    { key: "BloodPressure", placeholder: "e.g. 70" },
    { key: "SkinThickness", placeholder: "e.g. 25" },
    { key: "Insulin", placeholder: "e.g. 125" },
    { key: "BMI", placeholder: "e.g. 30.1", step: "0.1" },
    { key: "DiabetesPedigreeFunction", placeholder: "e.g. 0.45", step: "0.001" },
    { key: "Age", placeholder: "e.g. 29" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6 md:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Diabetes Risk Predictor</h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter patient details — model will return a prediction and probability.
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-400">Model</div>
            <div className="mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
              Logistic Regression
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {inputs.map((inp) => (
            <label key={inp.key} className="block">
              <div className="flex justify-between items-center text-sm font-medium text-gray-700 mb-1">
                <span>{inp.key}</span>
                {/* small hint */}
                <span className="text-xs text-gray-400">{inp.placeholder}</span>
              </div>
              <input
                name={inp.key}
                type="number"
                step={inp.step ?? "1"}
                min={inp.key === "Age" ? 0 : undefined}
                value={form[inp.key]}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </label>
          ))}

          <div className="md:col-span-2 flex items-center gap-3 mt-1">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition
                ${loading ? "bg-amber-300 text-white cursor-wait" : "bg-amber-500 hover:bg-amber-600 text-white"}`}
            >
              {loading ? "Predicting" : "Predict"}
              {loading && <Spinner />}
            </button>

            <button
              type="button"
              onClick={() => { setForm(initialState); setResult(null); }}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50"
            >
              Reset
            </button>

            <div className="ml-auto text-xs text-gray-500">
              <div>Tip: Use realistic values for better results.</div>
            </div>
          </div>
        </form>

        <div className="mt-6">
          {result && result.error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-4 text-red-700">
              {result.error}
            </div>
          )}

          {result && !result.error && (
            <div className="rounded-2xl border p-4 bg-gradient-to-r from-white to-amber-50 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-shrink-0">
                {/* Result badge */}
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-white text-sm font-bold
                    ${result.label === "Diabetic - High Risk" ? "bg-red-500" : result.label === "Borderline" ? "bg-yellow-500" : "bg-green-500"}`}
                >
                  {result.label === "Diabetic - High Risk" ? "HIGH" : result.label === "Borderline" ? "MID" : "SAFE"}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold text-gray-800">{result.label}
                  <span className="ml-2 text-sm">
                    {result.label === "Diabetic - High Risk" ? "⚠" : "✅"}
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-600 flex gap-6">
                  <div>
                    <div className="text-xs text-gray-400">Probability</div>
                    <div className="font-medium">{(result.probability ?? 0).toFixed(3)}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400">Raw prediction</div>
                    <div className="font-medium">{result.prediction}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400">Model</div>
                    <div className="font-medium">Logistic Regression</div>
                  </div>
                </div>

                {result.probability !== null && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${result.probability >= 0.6 ? "bg-red-500" : result.probability >= 0.4 ? "bg-yellow-400" : "bg-green-500"}`}
                        style={{ width: `${Math.min(Math.max(result.probability * 100, 0), 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Probability bar</div>
                  </div>
                )}
              </div>

              <div className="ml-auto text-xs text-gray-400 hidden md:block">
                <div>Confidence visualization</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-xs text-gray-400">
          <strong>Note:</strong> This is a demo prediction. For production use, ensure HTTPS, authentication and proper model validation.
        </div>
      </div>
    </div>
  );
}
