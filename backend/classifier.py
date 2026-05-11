import os
import pickle
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline


# =========================
# Training Data
# =========================

TRAINING_DATA = [
    ("Swiggy food order", "Food"),
    ("Zomato dinner", "Food"),
    ("Restaurant lunch", "Food"),
    ("Bakery purchase", "Food"),
    ("McDonald's", "Food"),
    ("Pizza delivery", "Food"),

    ("Uber ride", "Transport"),
    ("Ola cab", "Transport"),
    ("Petrol pump", "Transport"),
    ("Bus pass", "Transport"),
    ("Metro card recharge", "Transport"),
    ("Auto rickshaw", "Transport"),

    ("Amazon shopping", "Shopping"),
    ("Flipkart order", "Shopping"),
    ("Clothes store", "Shopping"),
    ("Shoes purchase", "Shopping"),
    ("Electronics buy", "Shopping"),
    ("Online shopping", "Shopping"),

    ("Netflix subscription", "Entertainment"),
    ("Spotify premium", "Entertainment"),
    ("Movie tickets", "Entertainment"),
    ("Gaming purchase", "Entertainment"),
    ("Concert tickets", "Entertainment"),
    ("Hotstar subscription", "Entertainment"),

    ("Electricity bill", "Utilities"),
    ("Water bill", "Utilities"),
    ("Phone bill", "Utilities"),
    ("Internet recharge", "Utilities"),
    ("Gas cylinder", "Utilities"),
    ("DTH recharge", "Utilities"),

    ("Grocery store", "Groceries"),
    ("Supermarket", "Groceries"),
    ("Vegetables market", "Groceries"),
    ("Dairy products", "Groceries"),

    ("Online course", "Education"),
    ("Books purchase", "Education"),
    ("Tuition fees", "Education"),
    ("Udemy course", "Education"),

    ("Gym membership", "Health"),
    ("Medical checkup", "Health"),
    ("Pharmacy medicines", "Health"),
    ("Hospital visit", "Health"),
    ("Yoga class", "Health"),
    ("Doctor consultation", "Health"),

    ("Salary credit", "Income"),
    ("Freelance payment", "Income"),
    ("Bank interest", "Income"),
    ("Dividend received", "Income"),
]


# =========================
# Model File
# =========================

MODEL_PATH = "classifier_model.pkl"


# =========================
# Train Model
# =========================

def train_classifier():

    texts, labels = zip(*TRAINING_DATA)

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            lowercase=True
        )),
        ("clf", MultinomialNB(alpha=0.1))
    ])

    pipeline.fit(texts, labels)

    with open(MODEL_PATH, "wb") as file:
        pickle.dump(pipeline, file)

    return pipeline


# =========================
# Load Model
# =========================

def load_classifier():

    if os.path.exists(MODEL_PATH):

        with open(MODEL_PATH, "rb") as file:
            model = pickle.load(file)

        return model

    return train_classifier()


# =========================
# Predict Single Category
# =========================

def predict_category(description: str) -> str:

    if not isinstance(description, str):
        return "Unknown"

    model = load_classifier()

    prediction = model.predict([description])

    return prediction[0]


# =========================
# Classify DataFrame
# =========================

def classify_transactions(df: pd.DataFrame) -> pd.DataFrame:

    required_columns = ["description", "category"]

    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    model = load_classifier()

    mask = df["category"].isna() | (df["category"] == "")

    if mask.any():

        predictions = model.predict(
            df.loc[mask, "description"].astype(str)
        )

        df.loc[mask, "category"] = predictions

    return df


# =========================
# Testing
# =========================

if __name__ == "__main__":

    print("Training/Loading model...")

    model = load_classifier()

    test_text = "Uber trip to airport"

    category = predict_category(test_text)

    print(f"\nTransaction: {test_text}")
    print(f"Predicted Category: {category}")

    # Sample dataframe test
    sample_df = pd.DataFrame({
        "description": [
            "Swiggy order",
            "Uber ride",
            "Netflix subscription"
        ],
        "category": ["", "", ""]
    })

    classified_df = classify_transactions(sample_df)

    print("\nClassified Transactions:")
    print(classified_df)