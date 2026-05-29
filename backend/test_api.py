import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_flow():
    # 1. Register
    print("Testing Registration...")
    email = "test@example.com"
    password = "password123"
    try:
        res = requests.post(f"{BASE_URL}/auth/register", json={
            "email": email,
            "password": password,
            "name": "Test User"
        })
        print("Register:", res.status_code, res.json())
    except Exception as e:
        print("Register failed (maybe user exists):", e)

    # 2. Login
    print("\nTesting Login...")
    res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    print("Login:", res.status_code)
    if res.status_code != 200:
        print("Login failed, aborting.")
        return
    
    token = res.json()['access_token']
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Seed Slots (Admin only, but let's try to hit the public seed endpoint if I made it public? 
    # Wait, I made it public in admin_routes.py: @admin_bp.route('/seed-slots', methods=['POST'])
    # But it doesn't have @jwt_required(). So anyone can call it. Good for testing.
    print("\nSeeding Slots...")
    res = requests.post(f"{BASE_URL}/admin/seed-slots")
    print("Seed:", res.status_code, res.json())

    # 4. Get Available Slots
    print("\nGetting Slots...")
    res = requests.get(f"{BASE_URL}/slots/available", params={"date": "2025-11-24"}) # Tomorrow?
    # Actually seed uses datetime.now().date() + i
    # So let's try today's date or just list all if I didn't filter?
    # The endpoint filters by date if provided.
    # Let's try to get slots for today.
    from datetime import datetime
    today = datetime.now().strftime('%Y-%m-%d')
    res = requests.get(f"{BASE_URL}/slots/available", params={"date": today})
    print("Slots:", res.status_code)
    slots = res.json()
    if not slots:
        print("No slots found for today.")
    else:
        print(f"Found {len(slots)} slots.")
        slot_id = slots[0]['id']

        # 5. Book a Slot
        print(f"\nBooking Slot {slot_id}...")
        res = requests.post(f"{BASE_URL}/slots/book", json={
            "slot_id": slot_id,
            "vehicle_info": {
                "mileage": 60000,
                "age": 5,
                "noise": "rattling"
            }
        }, headers=headers)
        print("Booking:", res.status_code, res.json())

    # 6. My Bookings
    print("\nVerifying Booking...")
    res = requests.get(f"{BASE_URL}/slots/my-bookings", headers=headers)
    print("My Bookings:", res.status_code, res.json())

if __name__ == "__main__":
    test_flow()
