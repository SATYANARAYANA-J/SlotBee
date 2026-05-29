from flask import Blueprint, request, jsonify
from models import db, ServiceType, ServiceCenter

service_bp = Blueprint('services', __name__)

@service_bp.route('/', methods=['GET'])
def get_services():
    services = ServiceType.query.all()
    result = []
    for s in services:
        result.append({
            "id": s.id,
            "name": s.name,
            "description": s.description,
            "base_cost": s.base_cost,
            "duration_mins": s.duration_mins
        })
    return jsonify(result), 200

@service_bp.route('/centers', methods=['GET'])
def get_service_centers():
    centers = ServiceCenter.query.all()
    result = []
    for c in centers:
        result.append({
            "id": c.id,
            "name": c.name,
            "location": c.location,
            "contact_number": c.contact_number,
            "latitude": c.latitude,
            "longitude": c.longitude
        })
    return jsonify(result), 200

@service_bp.route('/seed', methods=['POST'])
def seed_services():
    # Helper to seed default services
    defaults = [
        {"name": "Periodic Service", "cost": 5000, "duration": 240, "desc": "Complete checkup and fluid top-up"},
        {"name": "Oil Change", "cost": 1500, "duration": 60, "desc": "Engine oil replacement"},
        {"name": "Engine Repair", "cost": 8000, "duration": 480, "desc": "Deep engine diagnostics and fix"},
        {"name": "Brake Service", "cost": 2500, "duration": 120, "desc": "Brake pad replacement and cleaning"},
        {"name": "Full Inspection", "cost": 1000, "duration": 90, "desc": "Comprehensive vehicle health check"}
    ]
    
    for d in defaults:
        if not ServiceType.query.filter_by(name=d['name']).first():
            s = ServiceType(name=d['name'], base_cost=d['cost'], duration_mins=d['duration'], description=d['desc'])
            db.session.add(s)
            
    db.session.commit()
    return jsonify({"msg": "Services seeded"}), 201
