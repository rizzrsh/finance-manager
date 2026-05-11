from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd

# Import custom modules
from classifier import classify_transactions
from predictor import predict_next_month, predict_by_category

# =========================
# Flask App Setup
# =========================

app = Flask(__name__)

# Enable CORS for frontend connection
CORS(app)

# CSV File Path
CSV_FILE = "transactions.csv"

# =========================
# Load Transactions
# =========================

def load_transactions():

    try:

        df = pd.read_csv(CSV_FILE)

        # Fill missing categories
        df = classify_transactions(df)

        return df

    except FileNotFoundError:

        print("transactions.csv file not found!")

        return pd.DataFrame()

# =========================
# Home Route
# =========================

@app.route('/')

def home():

    return jsonify({
        "message": "AI Finance Manager Backend Running Successfully"
    })

# =========================
# Get All Transactions
# =========================

@app.route('/transactions', methods=['GET'])

def get_transactions():

    df = load_transactions()

    return jsonify(
        df.to_dict(orient='records')
    )

# =========================
# Dashboard Summary
# =========================

@app.route('/summary', methods=['GET'])

def summary():

    df = load_transactions()

    if df.empty:

        return jsonify({
            "error": "No transaction data found"
        })

    total_spending = round(
        float(df['amount'].sum()),
        2
    )

    average_spending = round(
        float(df['amount'].mean()),
        2
    )

    highest_expense = round(
        float(df['amount'].max()),
        2
    )

    category_spending = (
        df.groupby('category')['amount']
        .sum()
        .to_dict()
    )

    category_spending = {
        k: round(float(v), 2)
        for k, v in category_spending.items()
    }

    return jsonify({

        "total_spending": total_spending,

        "average_spending": average_spending,

        "highest_expense": highest_expense,

        "category_spending": category_spending
    })

# =========================
# Spending Prediction API
# =========================

@app.route('/predict', methods=['GET'])

def predict():

    df = load_transactions()

    prediction = predict_next_month(df)

    return jsonify(prediction)

# =========================
# Category Prediction API
# =========================

@app.route('/category-prediction', methods=['GET'])

def category_prediction():

    df = load_transactions()

    prediction = predict_by_category(df)

    return jsonify(prediction)

# =========================
# Alerts API
# =========================

@app.route('/alerts', methods=['GET'])

def alerts():

    df = load_transactions()

    alerts_list = []

    # Monthly spending alert
    total = df['amount'].sum()

    if total > 10000:

        alerts_list.append(
            "Warning: Your spending exceeded ₹10,000"
        )

    # Shopping alert
    shopping_total = (
        df[df['category'] == 'Shopping']['amount']
        .sum()
    )

    if shopping_total > 3000:

        alerts_list.append(
            "High shopping expenses detected"
        )

    # Entertainment alert
    entertainment_total = (
        df[df['category'] == 'Entertainment']['amount']
        .sum()
    )

    if entertainment_total > 1000:

        alerts_list.append(
            "Entertainment spending is high"
        )

    return jsonify(alerts_list)

# =========================
# Insights API
# =========================

@app.route('/insights', methods=['GET'])

def insights():

    df = load_transactions()

    insights_list = []

    # Food insight
    food_total = (
        df[df['category'] == 'Food']['amount']
        .sum()
    )

    if food_total > 1500:

        insights_list.append(
            "Reduce food delivery expenses to save more."
        )

    # Shopping insight
    shopping_total = (
        df[df['category'] == 'Shopping']['amount']
        .sum()
    )

    if shopping_total > 3000:

        insights_list.append(
            "Shopping expenses are high this month."
        )

    # Transport insight
    transport_total = (
        df[df['category'] == 'Transport']['amount']
        .sum()
    )

    if transport_total > 1000:

        insights_list.append(
            "Try using public transport to reduce costs."
        )

    # Health insight
    health_total = (
        df[df['category'] == 'Health']['amount']
        .sum()
    )

    if health_total > 2000:

        insights_list.append(
            "Health expenses increased this month."
        )

    if len(insights_list) == 0:

        insights_list.append(
            "Your spending habits look balanced."
        )

    return jsonify(insights_list)

# =========================
# Run Flask Server
# =========================

if __name__ == '__main__':

    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )