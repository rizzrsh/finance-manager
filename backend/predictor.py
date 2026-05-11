import pandas as pd
import numpy as np


# =========================================
# Predict Next Month Expense
# =========================================

def predict_next_month(df: pd.DataFrame) -> dict:

    # Check required columns
    required_columns = ["date", "amount"]

    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    # Create copy to avoid modifying original dataframe
    df = df.copy()

    # Convert date safely
    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    # Remove invalid dates
    df = df.dropna(subset=["date"])

    # Convert amount to numeric
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce")

    # Remove invalid amounts
    df = df.dropna(subset=["amount"])

    # Create month column
    df["month"] = df["date"].dt.to_period("M")

    # Keep only expenses
    expenses = df[df["amount"] > 0]

    # Group by month
    monthly = (
        expenses.groupby("month")["amount"]
        .sum()
        .reset_index()
    )

    monthly["amount"] = monthly["amount"].astype(float)

    # If no data
    if len(monthly) == 0:
        return {
            "predicted_total": 5000.0,
            "trend": "stable",
            "confidence": "low"
        }

    # If insufficient data
    if len(monthly) < 2:

        avg = float(monthly["amount"].mean())

        return {
            "predicted_total": round(avg, 2),
            "trend": "stable",
            "confidence": "low"
        }

    try:

        amounts = monthly["amount"].values

        # X-axis values
        x = np.arange(len(amounts))

        # Linear regression
        slope, intercept = np.polyfit(x, amounts, 1)

        # Predict next month
        predicted = intercept + slope * len(amounts)

        # Avoid negative prediction
        predicted = max(predicted, 0)

        # Detect trend
        if slope > 100:
            trend = "increasing"
        elif slope < -100:
            trend = "decreasing"
        else:
            trend = "stable"

        # Confidence
        confidence = "high" if len(monthly) >= 3 else "medium"

        return {
            "predicted_total": round(float(predicted), 2),
            "trend": trend,
            "confidence": confidence,
            "slope": round(float(slope), 2)
        }

    except Exception as e:

        return {
            "error": str(e),
            "predicted_total": 0,
            "trend": "unknown",
            "confidence": "low"
        }


# =========================================
# Predict Spending by Category
# =========================================

def predict_by_category(df: pd.DataFrame) -> dict:

    # Check required columns
    required_columns = ["date", "amount", "category"]

    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    # Create copy
    df = df.copy()

    # Convert date
    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    # Remove invalid rows
    df = df.dropna(subset=["date"])

    # Convert amount safely
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce")

    # Remove invalid amounts
    df = df.dropna(subset=["amount"])

    # Find latest month
    latest_month = df["date"].dt.to_period("M").max()

    # Filter latest month
    recent = df[
        df["date"].dt.to_period("M") == latest_month
    ]

    # Group by category
    cat_spend = (
        recent.groupby("category")["amount"]
        .sum()
        .to_dict()
    )

    # Round values
    return {
        k: round(float(v), 2)
        for k, v in cat_spend.items()
    }


# =========================================
# Testing
# =========================================

if __name__ == "__main__":

    sample_data = {
        "date": [
            "2025-01-10",
            "2025-01-15",
            "2025-02-10",
            "2025-02-20",
            "2025-03-12"
        ],
        "amount": [
            1200,
            1500,
            2000,
            1800,
            2500
        ],
        "category": [
            "Food",
            "Transport",
            "Food",
            "Shopping",
            "Entertainment"
        ]
    }

    df = pd.DataFrame(sample_data)

    print("\n=== Next Month Prediction ===")
    print(predict_next_month(df))

    print("\n=== Category Prediction ===")
    print(predict_by_category(df))