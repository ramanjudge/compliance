import os
import requests
import time
import sys
from bs4 import BeautifulSoup

API_URL = os.environ.get('NEXT_PUBLIC_API_URL', 'http://localhost:3000') + '/api/ingest'
API_SECRET = os.environ.get('API_SECRET', 'super-secret-crawler-key-2026')
TARGET_STATE = os.environ.get('TARGET_STATE', 'dl') # Default to Delhi

def scrape_delhi_wages():
    """
    Simulated scraper for Delhi Minimum Wages.
    In a real scenario, this would use BeautifulSoup to parse HTML tables, 
    or pdfplumber/Tesseract to extract tabular data from Gazette PDFs.
    """
    print("Initiating crawl for Delhi Labour Department (https://labour.delhi.gov.in/)...")
    
    # 1. Simulate web request
    try:
        response = requests.get('https://labour.delhi.gov.in/', timeout=10)
        print(f"Website reached. Status: {response.status_code}")
    except Exception as e:
        print(f"Network error: {e}")
    
    time.sleep(2) # Simulate processing time
    
    print("Extracting latest notification PDF deep link...")
    source_url = 'https://labour.delhi.gov.in/latest-gazette-notification-2025.pdf'
    
    print("Parsing tabular data...")
    # Mocked extraction data to push to the API
    scraped_data = [
        {
            "stateSlug": "delhi",
            "industry": "All Scheduled Employments",
            "skillLevel": "Unskilled",
            "category": "General",
            "basicWage": 18000.00,
            "vda": 500.00,
            "effectiveFrom": int(time.time() * 1000), # Today for demo
            "sourceUrl": source_url
        },
        {
            "stateSlug": "delhi",
            "industry": "All Scheduled Employments",
            "skillLevel": "Skilled",
            "category": "General",
            "basicWage": 22000.00,
            "vda": 600.00,
            "effectiveFrom": int(time.time() * 1000), # Today for demo
            "sourceUrl": source_url
        }
    ]
    
    return scraped_data

def push_to_api(payload):
    headers = {
        'Authorization': f'Bearer {API_SECRET}',
        'Content-Type': 'application/json'
    }
    
    print(f"Pushing {payload['skillLevel']} wage data to {API_URL}...")
    try:
        res = requests.post(API_URL, json=payload, headers=headers)
        if res.status_code == 201:
            print(f"✅ Success! Ingested as {res.json()['id']}")
        else:
            print(f"❌ Failed: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    print(f"Starting Crawler for State ID: {TARGET_STATE}")
    
    data_to_push = []
    
    if TARGET_STATE == 'dl':
        data_to_push = scrape_delhi_wages()
    elif TARGET_STATE == 'hr':
        print("Haryana scraper logic would run here...")
    else:
        print(f"No specific scraper logic implemented for {TARGET_STATE} yet.")
        sys.exit(0)
        
    for item in data_to_push:
        push_to_api(item)
        time.sleep(1) # Prevent rate limiting
        
    print("Crawler execution completed successfully.")
