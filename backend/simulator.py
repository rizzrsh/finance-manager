import random
from datetime import datetime, timedelta

# Transaction templates
TEMPLATES = [
    ("Swiggy Food Order", "Food", 200, 800),
    ("Uber Ride", "Transport", 80, 400),
    ("Amazon Shopping", "Shopping", 300, 3000),
    ("Netflix Subscription", "Entertainment", 649, 649),
    ("Electricity Bill", "Utilities", 800, 1500),
    ("Grocery Store", "Groceries", 300, 1200),
    ("Gym Membership", "Health", 1000, 2000),
    ("Online Course", "Education", 500, 5000),
    ("Zomato Order", "Food", 150, 600),
    ("Petrol", "Transport", 300, 800),
    ("Pharmacy", "Health", 100, 500),
    ("Movie Tickets", "Entertainment", 200, 600),
]

def generate_transactions(months=3, count_per_month=20):
    transactions = []
    today = datetime.now()

    for m in range(months):
        # Get first day of month
        month_date = today - timedelta(days=30 * m)
        month_start = month_date.replace(day=1)

        for _ in range(count_per_month):
            description, category, min_amt, max_amt = random.choice(TEMPLATES)

            # Random date in month
            day_offset = random.randint(0, 27)
            transaction_date = month_start + timedelta(days=day_offset)

            # Random amount
            amount = random.randint(min_amt, max_amt)

            transactions.append({
                "date": transaction_date.strftime("%Y-%m-%d"),
                "description": description,
                "amount": amount,
                "category": category
            })

    # Sort by latest date
    transactions.sort(key=lambda x: x["date"], reverse=True)

    return transactions


# Run simulator
if __name__ == "__main__":
    data = generate_transactions(months=3, count_per_month=20)

    print("\nGenerated Bank Transactions:\n")

    for txn in data:
        print(
            f"{txn['date']} | "
            f"{txn['description']} | "
            f"₹{txn['amount']} | "
            f"{txn['category']}"
        )


