import base64, re
from email_fetcher import get_gmail_service

service = get_gmail_service()
results = service.users().messages().list(
    userId='me',
    q='from:alerts.sbi.bank.in newer_than:30d',
    maxResults=5
).execute()

print(f"SBI alert emails: {len(results.get('messages', []))}\n")

for msg in results.get('messages', []):
    full = service.users().messages().get(
        userId='me', id=msg['id'], format='full'
    ).execute()
    headers = full['payload'].get('headers', [])
    subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
    print(f"Subject: {subject}")

    # Get body — check all parts
    def get_text(payload):
        parts = payload.get('parts', [payload])
        for part in parts:
            if part.get('parts'):
                t = get_text(part)
                if t: return t
            data = part.get('body', {}).get('data', '')
            if data:
                raw = base64.urlsafe_b64decode(data).decode('utf-8', 'ignore')
                raw = re.sub(r'<[^>]+>', ' ', raw)
                return re.sub(r'\s+', ' ', raw).strip()
        return ''

    body = get_text(full['payload'])
    print(f"Body: {body[:400]}")
    print('-' * 60)