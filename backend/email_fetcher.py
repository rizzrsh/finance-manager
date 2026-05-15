import os
import re
import base64
import schedule
import time
from datetime import datetime
from dotenv import load_dotenv
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from supabase import create_client

load_dotenv()

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TOKEN_PATH = os.path.join(BASE_DIR, 'token.json')
CREDS_PATH = os.path.join(BASE_DIR, 'credentials.json')

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)


def get_gmail_service():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_PATH, 'w') as token:
            token.write(creds.to_json())
    return build('gmail', 'v1', credentials=creds)


# ── ONLY THIS FUNCTION IS CHANGED — everything else is identical ───────────────
def parse_email_body(text):
    # ── AMOUNT ──────────────────────────────────────────────────────────────
    amount = None
    amount_patterns = [
        # Matches: Rs.927, INR 1,250.00, debited with Rs 500
        r'(?:Rs\.?|INR)\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)',
        # Matches: debited 500, credited 1250.00
        r'(?:debited|credited)\s+(?:with\s+)?(?:Rs\.?|INR)?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)',
        # Matches: amount Rs 500, amt: 1250
        r'(?:amount|amt)\s*[:\-]?\s*(?:Rs\.?|INR)?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)',
    ]
    for pattern in amount_patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            amount = float(m.group(1).replace(',', ''))
            break

    # ── MERCHANT ─────────────────────────────────────────────────────────────
    merchant = 'Unknown'

    # Words that are NOT merchants — used to skip bad matches
    noise_words = [
        'your', 'the', 'account', 'bank', 'upi', 'neft', 'imps', 'rtgs',
        'ref', 'state', 'india', 'banking', 'with', 'has', 'been', 'been',
        'please', 'call', 'any', 'assistance', 'dear', 'customer', 'card',
        'avl', 'bal', 'balance', 'available', 'thanks', 'regards'
    ]

    merchant_patterns = [
        # SBI UPI: "Info: UPI/merchantVPA/note" or "Info: UPI/merchant/remark"
        r'Info:\s*UPI/([^/\n\r]{2,40})/',
        # SBI transfer: "trf to MERCHANT" 
        r'trf\s+to\s+([A-Za-z][A-Za-z0-9\s&\.\-]{2,40}?)(?:\s+on|\s+via|\s*/|\.|,|\n|\r|$)',
        # Generic paid/sent/transfer to MERCHANT
        r'(?:paid\s+to|sent\s+to|transfer\s+to|payment\s+to|Payment\s+to)\s+([A-Za-z][A-Za-z0-9\s&\.\-]{2,40}?)(?:\s+on|\s+via|\.|,|\n|\r|$)',
        # HDFC/ICICI VPA: "to VPA merchant@bank" — extract just merchant name before @
        r'(?:to|for)\s+VPA\s+([^\s@]{2,30})@',
        # UPI handle: merchant name before @upi
        r'([A-Za-z][A-Za-z0-9]{2,20})@(?:upi|oksbi|okaxis|okhdfcbank|ybl|paytm|apl)',
        # "at MERCHANT on"
        r'\bat\s+([A-Za-z][A-Za-z0-9\s&\.\-]{2,30}?)(?:\s+on\s|\s+via\s|\.|,|\n|\r)',
        # Original fallback patterns (kept from original code)
        r'(?:to|at|for)\s+([A-Za-z][A-Za-z0-9\s&]+?)(?:\s+on|\s+via|\s+ref|\s+UPI|\.|,|$)',
        r'Payment to\s+([A-Za-z][A-Za-z0-9\s]+?)(?:\s+via|\s+on|\.|,)',
        r'paid to\s+([A-Za-z][A-Za-z0-9\s]+?)(?:\s+via|\s+on|\.|,)',
    ]

    for p in merchant_patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip()
            # Skip if it's a noise word or too short
            if (len(candidate) >= 2 and
                    not any(n == candidate.lower() for n in noise_words) and
                    not all(n in candidate.lower() for n in ['banking', 'india'])):
                merchant = candidate[:50]
                break

    # ── DATE ─────────────────────────────────────────────────────────────────
    date = datetime.now().strftime('%Y-%m-%d')
    date_patterns = [
        (r'(\d{2}[-/]\d{2}[-/]\d{4})', ['%d-%m-%Y', '%d/%m/%Y']),   # DD-MM-YYYY
        (r'(\d{2}[-/]\d{2}[-/]\d{2})',  ['%d-%m-%y', '%d/%m/%y']),   # DD-MM-YY
        (r'(\d{4}[-/]\d{2}[-/]\d{2})',  ['%Y-%m-%d', '%Y/%m/%d']),   # YYYY-MM-DD
    ]
    for pattern, formats in date_patterns:
        m = re.search(pattern, text)
        if m:
            for fmt in formats:
                try:
                    date = datetime.strptime(m.group(1), fmt).strftime('%Y-%m-%d')
                    break
                except ValueError:
                    continue
            break

    # ── CATEGORY ─────────────────────────────────────────────────────────────
    # Check merchant AND first 200 chars of email for better matching
    desc = (merchant + ' ' + text[:200]).lower()

    if any(x in desc for x in ['swiggy', 'zomato', 'food', 'restaurant', 'cafe', 'pizza', 'burger', 'domino']):
        category = 'Food'
    elif any(x in desc for x in ['uber', 'ola', 'metro', 'petrol', 'fuel', 'rapido', 'irctc', 'bus', 'train']):
        category = 'Transport'
    elif any(x in desc for x in ['amazon', 'flipkart', 'myntra', 'shopping', 'meesho', 'nykaa', 'ajio']):
        category = 'Shopping'
    elif any(x in desc for x in ['electricity', 'water', 'internet', 'recharge', 'netflix', 'hotstar',
                                  'broadband', 'jio', 'airtel', 'bsnl', 'bill']):
        category = 'Utilities'
    elif any(x in desc for x in ['hospital', 'doctor', 'pharmacy', 'apollo', 'health', 'medic', 'clinic']):
        category = 'Health'
    elif any(x in desc for x in ['salary', 'income', 'refund', 'cashback', 'reward', 'credited']):
        category = 'Income'
    else:
        category = 'Other'

    return amount, merchant, date, category
# ── END OF CHANGED FUNCTION ────────────────────────────────────────────────────


def is_upi_email(subject, body):
    keywords = ['debited', 'credited', 'UPI', 'payment', 'transaction', 'Rs.', 'INR']
    text = (subject + ' ' + body).lower()
    return any(k.lower() in text for k in keywords)


def already_processed(msg_id):
    try:
        res = supabase.table('processed_emails').select('id').eq('msg_id', msg_id).execute()
        return len(res.data) > 0
    except:
        return False


def mark_processed(msg_id):
    try:
        supabase.table('processed_emails').insert({'msg_id': msg_id}).execute()
    except:
        pass


def fetch_and_save():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Checking Gmail for UPI transactions...")
    try:
        service = get_gmail_service()
        results = service.users().messages().list(
            userId='me',
            q='subject:(debit OR credit OR UPI OR payment OR transaction) newer_than:30d',
            maxResults=20
        ).execute()

        messages = results.get('messages', [])
        saved = 0

        for msg in messages:
            msg_id = msg['id']
            if already_processed(msg_id):
                continue

            full = service.users().messages().get(
                userId='me', id=msg_id, format='full'
            ).execute()
            payload = full.get('payload', {})
            headers = payload.get('headers', [])
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')

            body = ''
            parts = payload.get('parts', [payload])
            for part in parts:
                if part.get('mimeType') == 'text/plain':
                    data = part.get('body', {}).get('data', '')
                    if data:
                        body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                        break

            full_text = subject + ' ' + body

            if not is_upi_email(subject, body):
                continue

            amount, merchant, date, category = parse_email_body(full_text)

            if not amount:
                continue

            transaction = {
                'description': merchant,
                'amount': amount,
                'date': date,
                'category': category,
                'created_at': datetime.now().isoformat(),
                'source': 'email'
            }

            supabase.table('transactions').insert(transaction).execute()
            mark_processed(msg_id)
            saved += 1
            print(f"  Saved: {merchant} - Rs.{amount} ({category})")

        print(f"  Done. {saved} new transactions saved.")

    except Exception as e:
        print(f"  Error: {e}")


def run_scheduler():
    fetch_and_save()
    schedule.every(5).minutes.do(fetch_and_save)
    print("Email fetcher running — checks every 5 minutes. Press Ctrl+C to stop.")
    while True:
        schedule.run_pending()
        time.sleep(30)


if __name__ == '__main__':
    run_scheduler()