from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os

from classifier import (
    predict_category,
    classify_transactions,
    train_classifier
)

from predictor import (
    predict_next_month,
    predict_by_category
)

from insights import generate_insights
from simulator import generate_transactions

# Flask App
app = Flask(__name__)
CORS(app)

CSV_FILE = "transactions.csv"

# Train ML model on startup
train_classifier()


# Load transaction data
def load_data():
    try:
        if not os.path.exists(CSV_FILE):
            df = pd.DataFrame(
                columns=["date", "description", "amount", "category"]
            )
            df.to_csv(CSV_FILE, index=False)

        df = pd.read_csv(CSV_FILE)

        # Ensure category column exists
        if "category" not in df.columns:
            df["category"] = ""

        return classify_transactions(df)

    except Exception as e:
        print(f"Error loading data: {e}")

        return pd.DataFrame(
            columns=["date", "description", "amount", "category"]
        )


# Get all transactions
@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    df = load_data()
    return jsonify(df.to_dict(orient="records"))


# Add new transaction
@app.route("/api/transactions", methods=["POST"])
def add_transaction():

    data = request.json

    if not data:
        return jsonify({"error": "No data received"}), 400

    if "description" not in data or "amount" not in data:
        return jsonify({"error": "Missing required fields"}), 400

    df = load_data()

    new_row = {
        "date": data.get(
            "date",
            pd.Timestamp.today().strftime("%Y-%m-%d")
        ),
        "description": data["description"],
        "amount": float(data["amount"]),
        "category": data.get("category")
        or predict_category(data["description"])
    }

    df = pd.concat(
        [df, pd.DataFrame([new_row])],
        ignore_index=True
    )

    df.to_csv(CSV_FILE, index=False)

    return jsonify(new_row), 201


# Predict category
@app.route("/api/classify", methods=["POST"])
def classify():

    data = request.json

    if not data or "description" not in data:
        return jsonify({"error": "Missing description"}), 400

    category = predict_category(data["description"])

    return jsonify({
        "category": category
    })


# Generate insights
@app.route("/api/insights", methods=["GET"])
def get_insights():

    income = float(request.args.get("income", 50000))

    df = load_data()

    if df.empty:
        return jsonify({
            "error": "No transaction data available"
        }), 404

    insights = generate_insights(df, income)

    return jsonify(insights)


# Prediction route
@app.route("/api/predict", methods=["GET"])
def predict():

    df = load_data()

    if df.empty:
        return jsonify({
            "error": "No data to predict from"
        }), 404

    return jsonify({
        "next_month": predict_next_month(df),
        "by_category": predict_by_category(df)
    })


# Simulate transactions
@app.route("/api/simulate", methods=["GET"])
def simulate():

    months = int(request.args.get("months", 3))
    count = int(request.args.get("count", 20))

    transactions = generate_transactions(months, count)

    df = pd.DataFrame(transactions)

    df.to_csv(CSV_FILE, index=False)

    return jsonify({
        "message": f"Generated {len(transactions)} transactions",
        "count": len(transactions)
    })


# Health check
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "message": "Finance Manager API is running"
    })


# Run server
if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )