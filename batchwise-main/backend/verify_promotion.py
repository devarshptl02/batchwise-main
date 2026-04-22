import os
import json
import time
import urllib.request
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env from .env file
print(f"Current CWD: {os.getcwd()}")
env_path = os.path.join(os.getcwd(), ".env")
print(f"Checking .env at: {env_path}, Exists: {os.path.exists(env_path)}")

load_dotenv(dotenv_path=env_path)

url: str = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

print(f"URL: {url[:10]}..." if url else "URL: None")
print(f"KEY: {key[:10]}..." if key else "KEY: None")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_KEY not set.")
    exit(1)

supabase: Client = create_client(url, key)

import uuid

TEST_INSTITUTE_ID = str(uuid.uuid4())


def setup_data():
    print("--- Setting up Test Data ---")
    try:
        # 1. Cleanup old test data
        print("Cleaning up old data...")
        supabase.table("students").delete().eq("institute_id", TEST_INSTITUTE_ID).execute()
        
        # 2. Insert Scenario Students
        print("Inserting new data...")
        students = [
            {
                "name": "Student A (Exact)",
                "parent_phone": "9999999991",
                "batch_name": "Class 10",
                "institute_id": TEST_INSTITUTE_ID,
                "total_fee_package": 10000,
                "paid_amount": 10000, # Scenario A
                "pending_payment": 0
            },
            {
                "name": "Student B (Extra)",
                "parent_phone": "9999999992",
                "batch_name": "Class 10",
                "institute_id": TEST_INSTITUTE_ID,
                "total_fee_package": 10000,
                "paid_amount": 12000, # Scenario B (2k Extra)
                "pending_payment": 0
            },
            {
                "name": "Student C (Debt)",
                "parent_phone": "9999999993",
                "batch_name": "Class 10",
                "institute_id": TEST_INSTITUTE_ID,
                "total_fee_package": 10000,
                "paid_amount": 8000, # Scenario C (2k Debt)
                "pending_payment": 2000
            }
        ]
        
        data = supabase.table("students").insert(students).execute()
        print(f"Inserted {len(data.data)} students.")
        return [s['id'] for s in data.data]
    except Exception as e:
        print(f"SETUP ERROR: {e}")
        # If we can't inspect 'e' easily, print type
        print(type(e))
        if hasattr(e, 'message'):
             print(e.message)
        if hasattr(e, 'code'):
             print(e.code)
        if hasattr(e, 'details'):
             print(e.details)
        exit(1)

def call_promote_api(student_ids):
    print("\n--- Calling /promote API ---")
    payload = {
        "student_ids": student_ids,
        "new_fee": 25000,
        "new_batch": "Class 11",
        "institute_id": TEST_INSTITUTE_ID
    }
    
    req = urllib.request.Request(
        "http://localhost:8000/promote",
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print("API Response:", result)
            return result
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} - {e.read().decode('utf-8')}")
        exit(1)
    except Exception as e:
        print(f"Error calling API: {e}")
        exit(1)

def verify_results(student_ids):
    print("\n--- Verifying Results ---")
    response = supabase.table("students").select("*").in_("id", student_ids).order("name").execute()
    students = response.data
    
    for s in students:
        print(f"Checking {s['name']}...")
        if "Exact" in s['name']:
            # Scenario A: 10k paid 10k -> 0 carry -> New Total 25k -> Paid 0
            assert s['paid_amount'] == 0, f"Scenario A Failed: Paid {s['paid_amount']} != 0"
            assert s['total_fee_package'] == 25000
        elif "Extra" in s['name']:
            # Scenario B: 10k paid 12k -> 2k carry -> New Total 25k -> Paid 2000
            assert s['paid_amount'] == 2000, f"Scenario B Failed: Paid {s['paid_amount']} != 2000"
            assert s['total_fee_package'] == 25000
        elif "Debt" in s['name']:
             # Scenario C: 10k paid 8k -> 0 carry (Clean Slate) -> New Total 25k -> Paid 0
            assert s['paid_amount'] == 0, f"Scenario C Failed: Paid {s['paid_amount']} != 0"
            assert s['total_fee_package'] == 25000
        
        # Common checks
        assert s['batch_name'] == "Class 11"
        assert s['pending_payment'] == 0
        assert s['last_payment_status'] is None
        
    print("✅ All Scenarios Passed!")

def cleanup():
     print("\n--- Cleanup ---")
     supabase.table("students").delete().eq("institute_id", TEST_INSTITUTE_ID).execute()
     print("Cleaned up test data.")

if __name__ == "__main__":
    ids = setup_data()
    # Wait a bit for server to settle if just started, though we are running script separately
    time.sleep(1) 
    
    try:
        call_promote_api(ids)
        # Wait for DB propagation if async (unlikely with Supabase await but good practice)
        time.sleep(1)
        verify_results(ids)
    finally:
        cleanup()
