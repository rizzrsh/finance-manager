import os
import re
import json
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from flask import Flask, request, jsonify
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)


def load_transactions(user_id=None):
    """Load transactions - if no user_id, load ALL transactions"""
    try:
        query = supabase.table('transactions').select("*").order("date", desc=True)
        # Only filter by user_id if it's explicitly provided AND not None
        if user_id and user_id != 'None':
            query = query.eq('user_id', user_id)
        response = query.execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching from Supabase: {e}")
        return []


def save_transaction(data):
    try:
        response = supabase.table('transactions').insert(data).execute()
        return response.data
    except Exception as e:
        print(f"Error saving to Supabase: {e}")
        return None


def categorize(desc):
    d = desc.lower()
    if any(x in d for x in ['swiggy', 'zomato', 'food', 'restaurant', 'cafe']):
        return 'Food'
    elif any(x in d for x in ['uber', 'ola', 'metro', 'petrol', 'fuel']):
        return 'Transport'
    elif any(x in d for x in ['amazon', 'flipkart', 'myntra', 'shopping']):
        return 'Shopping'
    elif any(x in d for x in ['electricity', 'water', 'internet', 'recharge', 'netflix']):
        return 'Utilities'
    elif any(x in d for x in ['hospital', 'doctor', 'pharmacy', 'apollo', 'health']):
        return 'Health'
    else:
        return 'Other'


def generate_suggestions(breakdown, total):
    suggestions = []
    if breakdown.get('Food', 0) > 500:
        suggestions.append('You spend a lot on food delivery. Cooking at home 3 days/week saves ~₹200/month.')
    if breakdown.get('Transport', 0) > 1500:
        suggestions.append('Transport costs are high. Consider a monthly metro pass to save ₹400/month.')
    if breakdown.get('Shopping', 0) > 2000:
        suggestions.append('Shopping spend is high. Try a 24-hour rule before buying non-essentials.')
    if not suggestions:
        suggestions.append('Your spending looks healthy! Keep tracking to spot patterns.')
    return suggestions


def detect_anomalies(df):
    anomalies = []
    if len(df) == 0:
        return anomalies
    if 'category' in df.columns:
        utilities = df[df['category'] == 'Utilities']['amount']
        if len(utilities) > 0 and float(utilities.max()) > 1500:
            anomalies.append(f"Electricity bill ₹{int(utilities.max())} is 22% higher than last month")
    return anomalies


# ─── ROUTES ────────────────────────────────────────────────────────────────────

# ── NEW: health check used by SMSParser connection status banner ───────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})
# ──────────────────────────────────────────────────────────────────────────────


@app.route('/api/transactions', methods=['GET'])
def api_get_transactions():
    user_id = request.args.get('user_id')
    transactions = load_transactions(user_id)
    return jsonify(transactions)


@app.route('/api/transactions', methods=['POST'])
def api_add_transaction():
    data = request.json
    data['category'] = categorize(data.get('description', ''))
    data['created_at'] = datetime.now().isoformat()
    result = save_transaction(data)
    return jsonify(result[0] if result else data)


@app.route('/api/insights', methods=['GET'])
def api_insights():
    income = float(request.args.get('income', 50000))
    user_id = request.args.get('user_id')
    transactions = load_transactions(user_id)
    
    if not transactions:
        return jsonify({
            'total_spent': 0,
            'top_category': 'N/A',
            'category_breakdown': {},
            'suggestions': ['Your spending looks healthy! Keep tracking to spot patterns.'],
            'alerts': [],
            'balance': income,
            'savings_rate': 100,
            'monthly_income': income
        })
    
    df = pd.DataFrame(transactions)
    debits = df[df['amount'] > 0]
    total_spent = float(debits['amount'].sum()) if len(debits) > 0 else 0
    
    category_breakdown = {}
    if 'category' in debits.columns and len(debits) > 0:
        category_breakdown = debits.groupby('category')['amount'].sum().to_dict()
        category_breakdown = {k: float(v) for k, v in category_breakdown.items()}
    
    top_category = max(category_breakdown, key=category_breakdown.get) if category_breakdown else 'N/A'
    suggestions = generate_suggestions(category_breakdown, total_spent)
    alerts = detect_anomalies(debits)
    
    return jsonify({
        'total_spent': total_spent,
        'top_category': top_category,
        'category_breakdown': category_breakdown,
        'suggestions': suggestions,
        'alerts': alerts,
        'balance': income - total_spent,
        'savings_rate': round(((income - total_spent) / income * 100), 1) if income > 0 else 0,
        'monthly_income': income
    })


@app.route('/api/predict', methods=['GET'])
def api_predict():
    user_id = request.args.get('user_id')
    transactions = load_transactions(user_id)
    
    if not transactions:
        return jsonify({'predicted_next_month': 0, 'next_month': 0})
    
    df = pd.DataFrame(transactions)
    debits = df[df['amount'] > 0]
    avg = float(debits['amount'].mean()) * 30 if len(debits) > 0 else 0
    
    return jsonify({
        'predicted_next_month': round(avg),
        'next_month': round(avg),
        'trend': 'stable'
    })


@app.route('/api/simulate', methods=['GET', 'POST'])
def api_simulate():
    """Simulate sample UPI transactions"""
    data = request.json or {}
    user_id = data.get('user_id')

    demo = [
        {'description': 'Swiggy Order',      'amount': 380,    'date': '2025-05-10', 'category': 'Food'},
        {'description': 'Uber Ride',          'amount': 145,    'date': '2025-05-10', 'category': 'Transport'},
        {'description': 'Amazon Shopping',    'amount': 1299,   'date': '2025-05-09', 'category': 'Shopping'},
        {'description': 'Zomato Lunch',       'amount': 250,    'date': '2025-05-09', 'category': 'Food'},
        {'description': 'Electricity Bill',   'amount': 1850,   'date': '2025-05-08', 'category': 'Utilities'},
        {'description': 'Netflix',            'amount': 649,    'date': '2025-05-07', 'category': 'Utilities'},
        {'description': 'Apollo Pharmacy',    'amount': 430,    'date': '2025-05-06', 'category': 'Health'},
        {'description': 'Petrol Fill',        'amount': 2000,   'date': '2025-05-05', 'category': 'Transport'},
        {'description': 'Flipkart Order',     'amount': 899,    'date': '2025-05-04', 'category': 'Shopping'},
        {'description': 'Salary Credit',      'amount': -50000, 'date': '2025-05-01', 'category': 'Income'},
    ]

    inserted = []
    for t in demo:
        t['created_at'] = datetime.now().isoformat()
        # Only add user_id if explicitly provided
        if user_id:
            t['user_id'] = user_id
        result = save_transaction(t)
        if result:
            inserted.append(result[0] if isinstance(result, list) else result)

    return jsonify({'status': 'ok', 'inserted': len(inserted), 'message': f'Inserted {len(inserted)} sample transactions'})


@app.route('/api/merchants', methods=['GET'])
def api_merchants():
    user_id = request.args.get('user_id')
    transactions = load_transactions(user_id)
    
    merchant_map = {}
    for t in transactions:
        if float(t.get('amount', 0)) <= 0:
            continue
        name = t.get('description', 'Unknown').split()[0]
        if name not in merchant_map:
            merchant_map[name] = {'merchant': name, 'count': 0, 'total': 0, 'category': t.get('category', 'Other')}
        merchant_map[name]['count'] += 1
        merchant_map[name]['total'] += float(t.get('amount', 0))
    
    result = sorted(merchant_map.values(), key=lambda x: x['count'], reverse=True)
    return jsonify(result)


@app.route('/api/sms-parse', methods=['POST'])
def parse_sms():
    data = request.json
    sms = data.get('sms', '')
    amount = None
    amt_match = re.search(r'(?:Rs\.?|INR)\s*(\d+(?:\.\d{2})?)', sms, re.IGNORECASE)
    if amt_match:
        amount = float(amt_match.group(1))
    merchant = 'Unknown'
    merchant_patterns = [
        r'to\s+([A-Za-z][A-Za-z\s]+?)(?:\s+on|\s+via|\s+ref|\.|$)',
        r'paid to\s+([A-Za-z][A-Za-z\s]+?)(?:\s+via|\s+on|\.|$)',
        r'debited to\s+([A-Za-z][A-Za-z\s]+?)(?:\s+via|\s+on|\.|$)',
    ]
    for pattern in merchant_patterns:
        m = re.search(pattern, sms, re.IGNORECASE)
        if m:
            merchant = m.group(1).strip()
            break
    date = datetime.now().strftime('%Y-%m-%d')
    date_match = re.search(r'(\d{2}/\d{2}/\d{2,4})', sms)
    if date_match:
        try:
            d = date_match.group(1)
            parts = d.split('/')
            if len(parts[2]) == 2:
                parts[2] = '20' + parts[2]
            date = f"{parts[2]}-{parts[1]}-{parts[0]}"
        except:
            pass
    category = categorize(merchant)
    if not amount:
        return jsonify({'error': 'Could not parse amount from SMS'}), 400
    return jsonify({
        'merchant': merchant,
        'amount': amount,
        'date': date,
        'category': category,
        'description': merchant
    })


@app.route('/api/sms-webhook', methods=['POST'])
def sms_webhook():
    data = request.json or request.form
    sms_text = data.get('sms') or data.get('message') or data.get('body') or ''
    if not sms_text:
        return jsonify({'error': 'No SMS text'}), 400
    keywords = ['debited', 'credited', 'upi', 'payment', 'rs.', 'inr']
    if not any(k in sms_text.lower() for k in keywords):
        return jsonify({'status': 'ignored', 'reason': 'not a transaction SMS'}), 200
    amount = None
    amt_match = re.search(r'(?:Rs\.?|INR)\s*(\d+(?:\.\d{2})?)', sms_text, re.IGNORECASE)
    if amt_match:
        amount = float(amt_match.group(1))
    merchant = 'Unknown'
    patterns = [
        r'(?:to|at)\s+([A-Za-z][A-Za-z0-9\s&]+?)(?:\s+on|\s+via|\s+ref|\.|,|$)',
        r'paid to\s+([A-Za-z][A-Za-z0-9\s]+?)(?:\s+via|\s+on|\.|,)',
    ]
    for p in patterns:
        m = re.search(p, sms_text, re.IGNORECASE)
        if m:
            merchant = m.group(1).strip()[:50]
            break
    date = datetime.now().strftime('%Y-%m-%d')
    category = categorize(merchant)
    if not amount:
        return jsonify({'status': 'ignored', 'reason': 'no amount found'}), 200
    transaction = {
        'description': merchant,
        'amount': amount,
        'date': date,
        'category': category,
        'created_at': datetime.now().isoformat(),
        'source': 'sms'
    }
    try:
        supabase.table('transactions').insert(transaction).execute()
        return jsonify({'status': 'saved', 'transaction': transaction})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)