from flask import Blueprint, request, jsonify
from models import db, Vehicle
from flask_jwt_extended import jwt_required, get_jwt_identity

vehicle_bp = Blueprint('vehicles', __name__)

@vehicle_bp.route('/', methods=['GET'])
@jwt_required()
def get_vehicles():
    user_id = get_jwt_identity()
    vehicles = Vehicle.query.filter_by(user_id=user_id).all()
    result = []
    for v in vehicles:
        result.append({
            "id": v.id,
            "make": v.make,
            "model": v.model,
            "year": v.year,
            "reg_no": v.reg_no,
            "fuel_type": v.fuel_type,
            "kms_driven": v.kms_driven,
            "last_service_date": v.last_service_date.isoformat() if v.last_service_date else None
        })
    return jsonify(result), 200

@vehicle_bp.route('/', methods=['POST'])
@jwt_required()
def add_vehicle():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    new_vehicle = Vehicle(
        user_id=user_id,
        make=data.get('make'),
        model=data.get('model'),
        year=data.get('year'),
        reg_no=data.get('reg_no'),
        fuel_type=data.get('fuel_type'),
        kms_driven=data.get('kms_driven'),
        # last_service_date handled if provided
    )
    
    db.session.add(new_vehicle)
    db.session.commit()
    return jsonify({"msg": "Vehicle added successfully", "id": new_vehicle.id}), 201

@vehicle_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_vehicle(id):
    user_id = get_jwt_identity()
    vehicle = Vehicle.query.get_or_404(id)
    
    if vehicle.user_id != int(user_id):
        return jsonify({"msg": "Unauthorized"}), 403
        
    db.session.delete(vehicle)
    db.session.commit()
    return jsonify({"msg": "Vehicle deleted"}), 200
