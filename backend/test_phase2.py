import unittest
import json
from backend.app import create_app, db
from backend.models import User, Vehicle, ServiceType, Slot, Booking

class Phase2TestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            # Seed Services
            self.client.post('/api/services/seed')
            # Seed Slots
            self.client.post('/api/admin/seed-slots')

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def get_auth_header(self, email, password):
        res = self.client.post('/api/auth/login', json={
            'email': email, 'password': password
        })
        token = res.get_json()['access_token']
        return {'Authorization': f'Bearer {token}'}

    def test_full_flow(self):
        # 1. Register User
        res = self.client.post('/api/auth/register', json={
            'email': 'test@example.com', 'password': 'password', 'name': 'Test User'
        })
        self.assertEqual(res.status_code, 201)
        
        # 2. Login
        headers = self.get_auth_header('test@example.com', 'password')
        
        # 3. Add Vehicle
        res = self.client.post('/api/vehicles/', headers=headers, json={
            'make': 'Hyundai', 'model': 'i20', 'year': 2020, 'reg_no': 'AP01AB1234',
            'fuel_type': 'Petrol', 'kms_driven': 15000
        })
        self.assertEqual(res.status_code, 201)
        vehicle_id = res.get_json()['id']
        
        # 4. AI Health Check
        res = self.client.post('/api/slots/analyze', headers=headers, json={
            'kms_driven': 15000, 'last_service_kms': 10000, 'oil_level': 'Normal',
            'engine_temp': 90, 'battery_voltage': 12.6, 'brake_condition': 9
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()['health_status'], 'Good')
        
        # 5. Get Services & Slots
        services = self.client.get('/api/services/').get_json()
        service_id = services[0]['id']
        
        with self.app.app_context():
            first_slot = Slot.query.first()
            date_str = first_slot.date.isoformat()
            
        slots = self.client.get(f'/api/slots/available?date={date_str}').get_json()
        slot_id = slots[0]['id']
        
        # 6. Book Service
        res = self.client.post('/api/slots/book', headers=headers, json={
            'vehicle_id': vehicle_id,
            'service_type_id': service_id,
            'slot_id': slot_id
        })
        self.assertEqual(res.status_code, 201)
        booking_id = res.get_json()['booking_id']
        
        # 7. Admin Update Status
        # Create Admin
        self.client.post('/api/auth/register', json={
            'email': 'admin@example.com', 'password': 'admin', 'name': 'Admin', 'is_admin': True
        })
        admin_headers = self.get_auth_header('admin@example.com', 'admin')
        
        res = self.client.put(f'/api/admin/bookings/{booking_id}/status', headers=admin_headers, json={
            'status': 'In Service'
        })
        self.assertEqual(res.status_code, 200)
        
        # 8. User Track Status
        res = self.client.get('/api/slots/my-bookings', headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()[0]['status'], 'In Service')
        
        print("Phase 2 Full Flow Verified Successfully!")

if __name__ == '__main__':
    unittest.main()
