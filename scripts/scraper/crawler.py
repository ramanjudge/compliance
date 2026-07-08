import os
import requests
import time
import sys
import json
import re
from google import genai

API_URL = (os.environ.get('NEXT_PUBLIC_API_URL') or 'http://localhost:3000').rstrip('/') + '/api/ingest'
API_SECRET = os.environ.get('API_SECRET') or 'super-secret-crawler-key-2026'
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

STATE_MAP = {
    'dl': 'Delhi', 'hr': 'Haryana', 'up': 'Uttar Pradesh', 'ka': 'Karnataka',
    'mh': 'Maharashtra', 'tn': 'Tamil Nadu', 'tg': 'Telangana', 'gj': 'Gujarat',
    'wb': 'West Bengal', 'pb': 'Punjab', 'rj': 'Rajasthan', 'br': 'Bihar',
    'mp': 'Madhya Pradesh', 'kl': 'Kerala', 'ap': 'Andhra Pradesh', 'ar': 'Arunachal Pradesh',
    'as': 'Assam', 'cg': 'Chhattisgarh', 'ga': 'Goa', 'hp': 'Himachal Pradesh',
    'jh': 'Jharkhand', 'mn': 'Manipur', 'ml': 'Meghalaya', 'mz': 'Mizoram',
    'nl': 'Nagaland', 'or': 'Odisha', 'sk': 'Sikkim', 'tr': 'Tripura',
    'ut': 'Uttarakhand', 'an': 'Andaman and Nicobar', 'ch': 'Chandigarh',
    'dn': 'Dadra and Nagar Haveli', 'jk': 'Jammu and Kashmir', 'la': 'Ladakh',
    'ld': 'Lakshadweep', 'py': 'Puducherry'
}

def find_gazette_pdf_url(state_slug, target_year):
    """
    Uses Gemini Google Search Grounding to autonomously search the internet
    for the latest Minimum Wage Gazette PDF for the target state and year.
    """
    state_name = STATE_MAP.get(state_slug, state_slug)
    print(f"🔍 Using AI Agent to search for {target_year} Minimum Wage Gazette PDF for {state_name}...")
    
    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY is missing. Cannot run AI search.")
        return None

    try:
        from google.genai import types
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        prompt = f"Search the web for the direct PDF URL of the latest Minimum Wage Gazette notification for the Indian state of '{state_name}' published in {target_year}. Return ONLY the direct URL to the .pdf file, and nothing else. If you absolutely cannot find a direct PDF URL, return 'NOT_FOUND'."
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[{"google_search": {}}],
            )
        )
        
        result = response.text.strip()
        
        # Extract the URL cleanly just in case Gemini added chatter
        match = re.search(r'(https?://[^\s]+\.pdf)', result, re.IGNORECASE)
        if match:
            return match.group(1)
        
        print(f"⚠️ Search returned no PDF link: {result}")
        return None
        
    except Exception as e:
        print(f"❌ Agent search failed: {e}")
        return None

def extract_wages_with_gemini(pdf_url, state_slug):
    """
    Downloads a PDF, extracts its text, and feeds it to Gemini API
    to autonomously reason and extract structured wage JSON.
    """
    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY is missing. Cannot run AI extraction.")
        sys.exit(1)
        
    print(f"📥 Downloading PDF from {pdf_url}...")
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        res = requests.get(pdf_url, headers=headers, timeout=30)
        res.raise_for_status()
    except Exception as e:
        print(f"❌ Failed to download PDF: {e}")
        return []

    pdf_path = f"{state_slug}_temp.pdf"
    with open(pdf_path, 'wb') as f:
        f.write(res.content)
        
    print("🧠 Uploading PDF to Gemini for native OCR and Intelligence Extraction...")
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        uploaded_file = client.files.upload(path=pdf_path)
    except Exception as e:
        print(f"❌ PDF upload to Gemini failed: {e}")
        os.remove(pdf_path)
        return []
        
    # Clean up local file immediately after upload
    os.remove(pdf_path)
    
    print(f"✅ File uploaded as {uploaded_file.name}. Asking Gemini to extract wages...")
    
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
            
        print(f"🎉 Gemini successfully extracted {len(data)} wage records!")
        return data
        
    except Exception as e:
        print(f"❌ Failed to parse Gemini output: {e}")
        print("Raw output:", response.text if 'response' in locals() else "No response")
        return []

def push_to_api(payload):
    headers = {
        'Authorization': f'Bearer {API_SECRET}',
        'Content-Type': 'application/json'
    }
    
    try:
        res = requests.post(API_URL, json=payload, headers=headers)
        if res.status_code in [200, 201]:
            print(f"✅ API Success! ({payload.get('skillLevel', 'unknown')}): {res.json().get('message')}")
        else:
            print(f"❌ API Failed ({payload.get('skillLevel', 'unknown')}): {res.status_code} - {res.text}")
    except Exception as e:
        print(f"❌ Request failed for {payload.get('skillLevel', 'unknown')}: {e}")

if __name__ == '__main__':
    target = os.environ.get('TARGET_STATE', 'dl')
    # Default to current year, unless it's a historical backfill
    target_year = os.environ.get('TARGET_YEAR', '2024') # Use 2024 by default since 2025 is very new
    
    # Define matrix batches to prevent rate limits
    BATCHES = {
        'batch_1': ['dl', 'hr', 'up', 'ka', 'mh', 'tn', 'tg', 'gj', 'wb'],
        'batch_2': ['pb', 'rj', 'br', 'mp', 'kl', 'ap', 'ar', 'as', 'cg'],
        'batch_3': ['ga', 'hp', 'jh', 'mn', 'ml', 'mz', 'nl', 'or', 'sk'],
        'batch_4': ['tr', 'ut', 'an', 'ch', 'dn', 'jk', 'la', 'ld', 'py'],
        'all': ['dl', 'hr', 'up', 'ka', 'mh', 'tn', 'tg', 'gj', 'wb', 'pb', 'rj', 'br', 'mp', 'kl', 'ap', 'ar', 'as', 'cg', 'ga', 'hp', 'jh', 'mn', 'ml', 'mz', 'nl', 'or', 'sk', 'tr', 'ut', 'an', 'ch', 'dn', 'jk', 'la', 'ld', 'py']
    }
    
    states_to_run = BATCHES.get(target, [target])
    
    print(f"🤖 Starting Agentic Crawler for targets: {states_to_run} (Year: {target_year})")
    
    for state_slug in states_to_run:
        print(f"\n--- Initiating crawl for State ID: {state_slug} ---")
        
        pdf_url = find_gazette_pdf_url(state_slug, target_year)
        
        if pdf_url:
            print(f"✅ Found PDF URL: {pdf_url}")
            wage_data = extract_wages_with_gemini(pdf_url, state_slug)
        else:
            print(f"⚠️ Could not find a Gazette PDF for {state_slug} in {target_year}.")
            wage_data = []
            
        if not wage_data:
            print(f"⏭️ Skipping {state_slug} due to no data.")
            continue
            
        for item in wage_data:
            push_to_api(item)
            
    print("\n🏁 Crawler execution completed.")
