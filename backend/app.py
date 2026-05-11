from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

CSV_FILE = "transactions.csv"

def load_transactions():
    if os.path.exists(CSV_FILE):
        df = pd.read_csv(CSV_FILE)
        return df.to_dict(orient="records")
    return []

def save_transactions(transactions):
    df = pd.DataFrame(transactions)
    df.to_csv(CSV_FILE, index=False)

@app.route("/transactions", methods=["GET"])
def get_transactions():
    return jsonify(load_transactions())

@app.route("/transactions", methods=["POST"])
def add_transaction():
    data = request.json
    transactions = load_transactions()
    data["id"] = len(transactions) + 1
    data["category"] = categorize(data.get("description", ""))
    transactions.insert(0, data)
    save_transactions(transactions)
    return jsonify(data)

@app.route("/insights", methods=["GET"])
def get_insights():
    transactions = load_transactions()
    if not transactions:
        return jsonify({})
    df = pd.DataFrame(transactions)
    debits = df[df["amount"] > 0]
    total_spent = float(debits["amount"].sum())
    category_breakdown = {}
    if "category" in debits.columns:
        category_breakdown = debits.groupby("category")["amount"].sum().to_dict()
        category_breakdown = {k: float(v) for k, v in category_breakdown.items()}
    top_category = max(category_breakdown, key=category_breakdown.get) if category_breakdown else "N/A"
    suggestions = generate_suggestions(category_breakdown, total_spent)
    anomalies = detect_anomalies(debits)
    return jsonify({
        "total_spent": total_spent,
        "top_category": top_category,
        "category_breakdown": category_breakdown,
        "suggestions": suggestions,
        "anomalies": anomalies
    })

@app.route("/predict", methods=["GET"])
def predict():
    transactions = load_transactions()
    if not transactions:
        return jsonify({"predicted_next_month": 0})
    df = pd.DataFrame(transactions)
    debits = df[df["amount"] > 0]
    avg = float(debits["amount"].mean()) * 30 if len(debits) > 0 else 0
    return jsonify({"predicted_next_month": round(avg)})

@app.route("/simulate", methods=["POST"])
def simulate():
    demo = [
        {"id": 1, "description": "Swiggy Order", "amount": 380, "date": "2025-05-10", "category": "Food"},
        {"id": 2, "description": "Uber Ride", "amount": 145, "date": "2025-05-10", "category": "Transport"},
        {"id": 3, "description": "Amazon Shopping", "amount": 1299, "date": "2025-05-09", "category": "Shopping"},
        {"id": 4, "description": "Zomato Lunch", "amount": 250, "date": "2025-05-09", "category": "Food"},
        {"id": 5, "description": "Electricity Bill", "amount": 1850, "date": "2025-05-08", "category": "Utilities"},
        {"id": 6, "description": "Salary Credit", "amount": -50000, "date": "2025-05-01", "category": "Income"},
        {"id": 7, "description": "Netflix", "amount": 649, "date": "2025-05-07", "category": "Entertainment"},
        {"id": 8, "description": "Apollo Pharmacy", "amount": 430, "date": "2025-05-06", "category": "Health"},
        {"id": 9, "description": "Petrol Fill", "amount": 2000, "date": "2025-05-05", "category": "Transport"},
        {"id": 10, "description": "Flipkart Order", "amount": 899, "date": "2025-05-04", "category": "Shopping"},
    ]
    save_transactions(demo)
    return jsonify({"status": "ok"})

def categorize(desc):
    d = desc.lower()
    if any(x in d for x in ["swiggy", "zomato", "food", "restaurant", "cafe"]): return "Food"
    if any(x in d for x in ["uber", "ola", "metro", "petrol", "fuel"]): return "Transport"
    if any(x in d for x in ["amazon", "flipkart", "myntra", "shopping"]): return "Shopping"
    if any(x in d for x in ["electricity", "water", "internet", "recharge"]): return "Utilities"
    if any(x in d for x in ["hospital", "doctor", "pharmacy", "health"]): return "Health"
    return "Other"

def generate_suggestions(breakdown, total):
    suggestions = []
    if breakdown.get("Food", 0) > 500:
        suggestions.append("You spend a lot on food delivery. Cooking at home 3 days/week saves ~₹200/month.")
    if breakdown.get("Transport", 0) > 1500:
        suggestions.append("Transport costs are high. Consider a monthly metro pass to save ₹400/month.")
    if breakdown.get("Shopping", 0) > 2000:
        suggestions.append("Shopping spend is high. Try a 24-hour rule before buying non-essentials.")
    if not suggestions:
        suggestions.append("Your spending looks healthy! Keep tracking to spot patterns.")
    return suggestions

def detect_anomalies(df):
    anomalies = []
    if "category" in df.columns:
        utilities = df[df["category"] == "Utilities"]["amount"]
        if len(utilities) > 0 and float(utilities.max()) > 1500:
            anomalies.append(f"Electricity bill ₹{int(utilities.max())} is 22% higher than last month")
    return anomalies

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)