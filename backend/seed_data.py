"""
Seed script to populate the database with initial data
"""
from app import create_app, db
from models import ServiceType, Slot, ServiceCenter, User
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta, time
import random

app = create_app()

with app.app_context():
    # Clear existing data
    ServiceType.query.delete()
    Slot.query.delete()
    ServiceCenter.query.delete()
    User.query.delete()
    
    # Seed Default Users
    hashed_pw = generate_password_hash('password123')
    customer = User(email='customer@slotbee.com', password_hash=hashed_pw, name='SlotBee Customer', is_admin=False)
    admin = User(email='admin@slotbee.com', password_hash=hashed_pw, name='SlotBee Admin', is_admin=True)
    db.session.add(customer)
    db.session.add(admin)
    
    # Seed Service Types
    services = [
        ServiceType(name='Periodic Service', description='Regular maintenance and checkup', base_cost=2500, duration_mins=120),
        ServiceType(name='Oil Change', description='Engine oil replacement', base_cost=800, duration_mins=30),
        ServiceType(name='Engine Repair', description='Complete engine diagnostics and repair', base_cost=5000, duration_mins=240),
        ServiceType(name='Brake Service', description='Brake pad replacement and inspection', base_cost=1500, duration_mins=60),
        ServiceType(name='Full Inspection', description='Comprehensive vehicle inspection', base_cost=1000, duration_mins=90),
        ServiceType(name='AC Service', description='Air conditioning service and gas refill', base_cost=1200, duration_mins=45),
        ServiceType(name='Battery Replacement', description='Battery check and replacement', base_cost=3000, duration_mins=30),
        ServiceType(name='Wheel Alignment', description='Wheel balancing and alignment', base_cost=600, duration_mins=45),
    ]
    
    for service in services:
        db.session.add(service)
    
    import json
    import os

    # Seed Service Centers from external JSON
    centers = []
    json_path = os.path.join(os.path.dirname(__file__), 'service_centers.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        service_centers_data = json.load(f)
        
    for item in service_centers_data:
        center = ServiceCenter(
            name=item['name'], 
            location=item['location'], 
            contact_number=item['contact_number'],
            latitude=item['latitude'],
            longitude=item['longitude']
        )
        db.session.add(center)
        centers.append(center)
    
    db.session.commit() # Commit to get IDs

    # Seed Slots for next 7 days for ALL centers (limited slots per center to avoid huge DB)
    start_date = datetime.now().date()
    time_slots = [
        time(9, 0),   # 9:00 AM
        time(11, 0),  # 11:00 AM
        time(14, 0),  # 2:00 PM
        time(16, 0),  # 4:00 PM
    ]
    
    # Add slots for first 5 centers fully, and random slots for others to keep it manageable
    for i, center in enumerate(centers):
        # Full slots for top 5 centers
        if i < 5:
            for day_offset in range(7):
                slot_date = start_date + timedelta(days=day_offset)
                for slot_time in time_slots:
                    slot = Slot(
                        service_center_id=center.id,
                        date=slot_date,
                        time=slot_time,
                        capacity=3,
                        booked_count=0
                    )
                    db.session.add(slot)
        # Minimal slots for others (just for demo)
        else:
            slot_date = start_date + timedelta(days=1) # Tomorrow
            slot = Slot(
                service_center_id=center.id,
                date=slot_date,
                time=time(10, 0),
                capacity=2,
                booked_count=0
            )
            db.session.add(slot)
    
    db.session.commit()
    print("SUCCESS: Database seeded successfully!")
    print(f"   * {len(services)} service types added")
    print(f"   * {len(centers)} service centers added with coordinates")
    print(f"   * Slots created for next 7 days")
