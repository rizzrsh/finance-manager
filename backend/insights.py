import pandas as pd


# =========================================
# Budget Rules
# =========================================

BUDGET_RULES = {
    "Food": 0.15,
    "Transport": 0.10,
    "Shopping": 0.10,
    "Entertainment": 0.05,
    "Utilities": 0.10,
    "Groceries": 0.12,
    "Health": 0.08,
    "Education": 0.10,
    "Savings": 0.20,
}


# =========================================
# Generate Financial Insights
# =========================================

def generate_insights(
    df: pd.DataFrame,
    monthly_income: float = 50000
) -> dict:

    # -----------------------------
    # Validate Required Columns
    # -----------------------------

    required_columns = [
        "date",
        "amount",
        "category"
    ]

    for col in required_columns:

        if col not in df.columns:
            raise ValueError(
                f"Missing required column: {col}"
            )

    # -----------------------------
    # Create Copy
    # -----------------------------

    df = df.copy()

    # -----------------------------
    # Convert Date Safely
    # -----------------------------

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    # Remove invalid dates
    df = df.dropna(subset=["date"])

    # -----------------------------
    # Convert Amount Safely
    # -----------------------------

    df["amount"] = pd.to_numeric(
        df["amount"],
        errors="coerce"
    )

    # Remove invalid amounts
    df = df.dropna(subset=["amount"])

    # -----------------------------
    # Fill Missing Categories
    # -----------------------------

    df["category"] = (
        df["category"]
        .fillna("Unknown")
        .astype(str)
    )

    # -----------------------------
    # Get Latest Month Data
    # -----------------------------

    latest_month = (
        df["date"]
        .dt.to_period("M")
        .max()
    )

    recent = df[
        df["date"].dt.to_period("M") == latest_month
    ]

    # -----------------------------
    # Total Spending
    # -----------------------------

    total_spent = float(
        recent["amount"].sum()
    )

    # -----------------------------
    # Savings Calculation
    # -----------------------------

    savings = monthly_income - total_spent

    savings_rate = (
        (savings / monthly_income) * 100
        if monthly_income > 0 else 0
    )

    # -----------------------------
    # Category Spending
    # -----------------------------

    cat_spend = (
        recent.groupby("category")["amount"]
        .sum()
        .to_dict()
    )

    # -----------------------------
    # Suggested Budgets
    # -----------------------------

    suggested_budget = {

        cat: round(
            monthly_income * pct,
            2
        )

        for cat, pct
        in BUDGET_RULES.items()
    }

    # -----------------------------
    # Overspending Alerts
    # -----------------------------

    alerts = []

    for cat, budget in suggested_budget.items():

        actual = cat_spend.get(cat, 0)

        if actual > budget:

            excess = actual - budget

            alerts.append({

                "category": cat,

                "type": "overspending",

                "message":
                    f"⚠️ You overspent on "
                    f"{cat} by ₹{excess:.0f} "
                    f"this month!",

                "actual":
                    round(float(actual), 2),

                "budget":
                    round(float(budget), 2),

                "severity":
                    "high"
                    if excess > budget * 0.5
                    else "medium"
            })

    # -----------------------------
    # Financial Tips
    # -----------------------------

    tips = []

    if savings_rate < 10:

        tips.append(
            "🚨 Critical: Save at least "
            "20% of income. "
            "Cut non-essentials immediately."
        )

    elif savings_rate < 20:

        tips.append(
            "⚠️ Try to increase savings. "
            "Reduce entertainment and shopping."
        )

    else:

        tips.append(
            "✅ Great job! You're saving well. "
            "Consider investing the surplus."
        )

    # -----------------------------
    # Highest Spending Category
    # -----------------------------

    if cat_spend:

        top_category = max(
            cat_spend,
            key=cat_spend.get
        )

    else:

        top_category = "N/A"

    tips.append(
        f"📊 Your highest spend category "
        f"is {top_category}. "
        f"Review if it's necessary."
    )

    # -----------------------------
    # Final Response
    # -----------------------------

    return {

        "total_spent":
            round(total_spent, 2),

        "monthly_income":
            round(float(monthly_income), 2),

        "savings":
            round(float(savings), 2),

        "savings_rate":
            round(float(savings_rate), 1),

        "category_breakdown": {

            k: round(float(v), 2)

            for k, v
            in cat_spend.items()
        },

        "suggested_budget":
            suggested_budget,

        "alerts":
            alerts,

        "tips":
            tips
    }


# =========================================
# Testing
# =========================================

if __name__ == "__main__":

    sample_data = {

        "date": [
            "2025-01-10",
            "2025-01-15",
            "2025-01-20",
            "2025-01-22",
            "2025-01-25"
        ],

        "amount": [
            1200,
            3000,
            5000,
            1500,
            2000
        ],

        "category": [
            "Food",
            "Shopping",
            "Entertainment",
            "Transport",
            "Food"
        ]
    }

    df = pd.DataFrame(sample_data)

    result = generate_insights(
        df,
        monthly_income=50000
    )

    print("\n=== Financial Insights ===\n")

    for key, value in result.items():

        print(f"{key}:")
        print(value)
        print()