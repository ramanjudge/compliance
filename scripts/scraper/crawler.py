import os
import requests
import time
import sys
import json
from bs4 import BeautifulSoup
from google import genai

API_URL = (os.environ.get('NEXT_PUBLIC_API_URL') or 'http://localhost:3000').rstrip('/') + '/api/ingest'
API_SECRET = os.environ.get('API_SECRET') or 'super-secret-crawler-key-2026'
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
TARGET_STATE = os.environ.get('TARGET_STATE', 'dl')

def extract_wages_with_gemini(pdf_url, state_slug):
    """
    Downloads a PDF, extracts its text, and feeds it to Gemini API
    to autonomously reason and extract structured wage JSON.
    """
    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY is missing. Cannot run AI extraction.")
        sys.exit(1)
        
    print(f"Downloading PDF from {pdf_url}...")
    try:
        res = requests.get(pdf_url, timeout=15)
        res.raise_for_status()
    except Exception as e:
        print(f"❌ Failed to download PDF: {e}")
        return []

    pdf_path = f"{state_slug}_temp.pdf"
    with open(pdf_path, 'wb') as f:
        f.write(res.content)
        
    print("Uploading PDF to Gemini for native OCR processing...")
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        uploaded_file = client.files.upload(path=pdf_path)
    except Exception as e:
        print(f"❌ PDF upload to Gemini failed: {e}")
        os.remove(pdf_path)
        return []
        
    # Clean up local file immediately after upload
    os.remove(pdf_path)
    
    print(f"File uploaded as {uploaded_file.name}. Sending to Gemini for intelligence extraction...")
    
    prompt = f"""
    You are an expert Indian Labour Law compliance analyst.
    Extract the minimum wage data from the following government notification text for the state of '{state_slug}'.
    
    Rules for extraction:
    1. Identify all skill levels (e.g., Unskilled, Semi-skilled, Skilled, Highly Skilled).
    2. Identify all categories/industries (e.g., "All Scheduled Employments", "Clerical and Supervisory Staff").
    3. Identify zones if applicable (e.g., Zone A, Zone B). If none, return null.
    4. Extract Basic Wage, VDA (Variable Dearness Allowance), and Total Monthly Wage as numbers.
    5. Determine the effective date of these wages (effectiveFrom).
    6. Determine the notification or publish date of this document (notificationDate).
    
    Return ONLY a raw JSON array of objects matching this exact structure, with no markdown formatting or backticks:
    [
      {{
        "stateSlug": "{state_slug}",
        "industry": "String (e.g. All Scheduled Employments)",
        "skillLevel": "String",
        "category": "String or null",
        "zone": "String or null",
        "basicWage": Number,
        "vda": Number,
        "totalMonthly": Number,
        "effectiveFrom": Number (unix timestamp in milliseconds),
        "notificationDate": Number (unix timestamp in milliseconds, or null if not found)
      }}
    ]
    
    PDF Document Attached.
    """
    
    try:
        from google.genai import types
        
        # Wait for file to be processed
        time.sleep(3)
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_uri(file_uri=uploaded_file.uri, mime_type='application/pdf'),
                prompt
            ],
        )
        
        # Clean markdown if Gemini still includes it
        json_str = response.text.strip()
        if json_str.startswith('```json'):
            json_str = json_str.split('```json')[1].split('```')[0].strip()
        elif json_str.startswith('```'):
            json_str = json_str.split('```')[1].strip()
            
        data = json.loads(json_str)
        # Attach the source URL as the proof document
        for item in data:
            item['sourceUrl'] = pdf_url
            
        print(f"✅ Gemini successfully extracted {len(data)} wage records!")
        return data
        
    except Exception as e:
        print(f"❌ Failed to parse Gemini output: {e}")
        print("Raw output:", response.text if 'response' in locals() else "No response")
        return []

def scrape_delhi_wages():
    """
    Dynamic Delhi scraper: Finds the latest PDF link via BeautifulSoup,
    then hands it off to Gemini for actual data extraction.
    """
    print("Initiating crawl for Delhi Labour Department...")
    source_url = "https://labour.delhi.gov.in/labour/current-minimum-wage-rate"
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.get(source_url, headers=headers, timeout=30)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        pdf_links = [a['href'] for a in soup.find_all('a', href=True) if '.pdf' in a['href'].lower()]
        
        if pdf_links:
            pdf_url = pdf_links[0]
            if pdf_url.startswith('/'):
                pdf_url = f"https://labour.delhi.gov.in{pdf_url}"
            print(f"✅ Found latest official notification PDF: {pdf_url}")
            return extract_wages_with_gemini(pdf_url, 'delhi')
        else:
            print("⚠️ Could not find PDF link on the page.")
            raise Exception("No PDF links found.")
            
    except Exception as e:
        print(f"❌ Network error while scraping Delhi portal: {e}")
        print("⚠️ Indian Gov sites are aggressively geo-blocking GitHub Actions.")
        print("⚠️ Falling back to local copy of the PDF (da15april2025.pdf)...")
        
        # Since the network is blocked, we will upload the local copy of the PDF to Gemini directly.
        local_pdf_path = "scripts/scraper/da15april2025.pdf"
        
        if not os.path.exists(local_pdf_path):
            print("❌ Local fallback PDF not found.")
            return []
            
        print("Uploading local PDF to Gemini for native OCR processing...")
        try:
            client = genai.Client(api_key=GEMINI_API_KEY)
            uploaded_file = client.files.upload(path=local_pdf_path)
        except Exception as upload_e:
            print(f"❌ Local PDF upload to Gemini failed: {upload_e}")
            return []
            
        print(f"File uploaded as {uploaded_file.name}. Sending to Gemini for intelligence extraction...")
        
        prompt = f"""
        You are an expert Indian Labour Law compliance analyst.
        Extract the minimum wage data from the following government notification document for the state of 'delhi'.
        
        Rules for extraction:
        1. Identify all skill levels (e.g., Unskilled, Semi-skilled, Skilled, Highly Skilled).
        2. Identify all categories/industries (e.g., "All Scheduled Employments", "Clerical and Supervisory Staff").
        3. Identify zones if applicable (e.g., Zone A, Zone B). If none, return null.
        4. Extract Basic Wage, VDA (Variable Dearness Allowance), and Total Monthly Wage as numbers.
        5. Determine the effective date of these wages (effectiveFrom).
        6. Determine the notification or publish date of this document (notificationDate).
        
        Return ONLY a raw JSON array of objects matching this exact structure, with no markdown formatting or backticks:
        [
          {{
            "stateSlug": "delhi",
            "industry": "String (e.g. All Scheduled Employments)",
            "skillLevel": "String",
            "category": "String or null",
            "zone": "String or null",
            "basicWage": Number,
            "vda": Number,
            "totalMonthly": Number,
            "effectiveFrom": Number (unix timestamp in milliseconds),
            "notificationDate": Number (unix timestamp in milliseconds, or null if not found)
          }}
        ]
        
        PDF Document Attached.
        """
        
        try:
            from google.genai import types
            
            # Wait for file to be processed
            time.sleep(3)
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[
                    types.Part.from_uri(file_uri=uploaded_file.uri, mime_type='application/pdf'),
                    prompt
                ],
            )
            
            json_str = response.text.strip()
            if json_str.startswith('```json'):
                json_str = json_str.split('```json')[1].split('```')[0].strip()
            elif json_str.startswith('```'):
                json_str = json_str.split('```')[1].strip()
                
            data = json.loads(json_str)
            for item in data:
                item['sourceUrl'] = "https://labour.delhi.gov.in/sites/default/files/Labour/generic_multiple_files/da15april2025.pdf"
                
            print(f"✅ Gemini successfully extracted {len(data)} wage records from local fallback!")
            return data
            
        except Exception as parse_e:
            print(f"❌ Failed to parse Gemini output: {parse_e}")
            print("Raw output:", response.text if 'response' in locals() else "No response")
            return []

def push_to_api(payload):
    headers = {
        'Authorization': f'Bearer {API_SECRET}',
        'Content-Type': 'application/json'
    }
    
    print(f"Pushing {payload.get('skillLevel', 'unknown')} wage data to API...")
    try:
        res = requests.post(API_URL, json=payload, headers=headers)
        if res.status_code in [200, 201]:
            print(f"✅ API Success! Response: {res.json()}")
        else:
            print(f"❌ API Failed: {res.status_code} - {res.text}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Request failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    target = os.environ.get('TARGET_STATE', 'dl')
    
    # Define matrix batches to prevent rate limits
    BATCHES = {
        'batch_1': ['dl', 'hr', 'up', 'ka', 'mh', 'tn', 'tg', 'gj', 'wb'],
        'batch_2': ['pb', 'rj', 'br', 'mp', 'kl', 'ap', 'ar', 'as', 'cg'],
        'batch_3': ['ga', 'hp', 'jh', 'mn', 'ml', 'mz', 'nl', 'or', 'sk'],
        'batch_4': ['tr', 'ut', 'an', 'ch', 'dn', 'jk', 'la', 'ld', 'py'],
        'all': ['dl', 'hr', 'up', 'ka', 'mh', 'tn', 'tg', 'gj', 'wb', 'pb', 'rj', 'br', 'mp', 'kl', 'ap', 'ar', 'as', 'cg', 'ga', 'hp', 'jh', 'mn', 'ml', 'mz', 'nl', 'or', 'sk', 'tr', 'ut', 'an', 'ch', 'dn', 'jk', 'la', 'ld', 'py']
    }
    
    states_to_run = BATCHES.get(target, [target])
    
    print(f"Starting AI Crawler for targets: {states_to_run}")
    
    for state_slug in states_to_run:
        print(f"\n--- Initiating crawl for State ID: {state_slug} ---")
        
        # Right now we only have the Delhi MVP fallback logic built.
        # In Stage 2, this will hit egazette.gov.in using dynamic searches.
        if state_slug == 'dl':
            wage_data = scrape_delhi_wages()
        else:
            print(f"⚠️ Dynamic Gazette scraping for {state_slug} is under construction (Stage 2). Skipping.")
            wage_data = []
            
        if not wage_data:
            print(f"No data extracted for {state_slug}.")
            continue
            
        for item in wage_data:
            print(f"Pushing {item.get('skillLevel', 'Unknown')} wage data to API...")
            push_to_api(item)
            
    print("\nCrawler execution completed.")
