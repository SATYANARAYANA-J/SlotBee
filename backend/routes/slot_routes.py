from flask import Blueprint, request, jsonify
from models import db, Slot, Booking, VehicleReport, Vehicle, ServiceType
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from services.ai_service import analyze_vehicle_health

slot_bp = Blueprint('slots', __name__)

@slot_bp.route('/available', methods=['GET'])
def get_available_slots():
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({"msg": "Date required"}), 400
        
    date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    slots = Slot.query.filter_by(date=date_obj).all()
    
    result = []
    for slot in slots:
        if slot.booked_count < slot.capacity:
            result.append({
                "id": slot.id,
                "time": slot.time.strftime('%H:%M'),
                "available": slot.capacity - slot.booked_count
            })
    
    return jsonify(result), 200

@slot_bp.route('/book', methods=['POST'])
@jwt_required()
def book_slot():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # New Inputs
    vehicle_id = data.get('vehicle_id')
    service_type_ids = data.get('service_type_ids') # List of IDs
    slot_id = data.get('slot_id')
    
    # Validation
    slot = Slot.query.get(slot_id)
    if not slot or slot.booked_count >= slot.capacity:
        return jsonify({"msg": "Slot unavailable"}), 400
        
    if not service_type_ids or not isinstance(service_type_ids, list):
        return jsonify({"msg": "Invalid Service Types"}), 400
        
    selected_services = ServiceType.query.filter(ServiceType.id.in_(service_type_ids)).all()
    if not selected_services:
        return jsonify({"msg": "No valid services found"}), 400

    total_cost = sum(s.base_cost for s in selected_services)

    # Create Booking
    booking = Booking(
        user_id=user_id,
        vehicle_id=vehicle_id,
        slot_id=slot_id,
        status='Booked',
        estimated_cost=total_cost,
        # eta could be calculated based on service duration
    )
    
    # Add services
    booking.services.extend(selected_services)
    
    slot.booked_count += 1
    db.session.add(booking)
    db.session.commit()

    return jsonify({
        "msg": "Booking confirmed",
        "booking_id": booking.id,
        "estimated_cost": total_cost
    }), 201

@slot_bp.route('/my-bookings', methods=['GET'])
@jwt_required()
def my_bookings():
    user_id = get_jwt_identity()
    bookings = Booking.query.filter_by(user_id=user_id).order_by(Booking.created_at.desc()).all()
    
    result = []
    for b in bookings:
        service_names = ", ".join([s.name for s in b.services])
        result.append({
            "id": b.id,
            "vehicle": f"{b.vehicle.make} {b.vehicle.model} ({b.vehicle.reg_no})",
            "service": service_names,
            "date": b.slot.date.isoformat(),
            "time": b.slot.time.strftime('%H:%M'),
            "status": b.status,
            "cost": b.estimated_cost
        })
    
    return jsonify(result), 200

@slot_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_health():
    data = request.get_json()
    result = analyze_vehicle_health(data)
    return jsonify(result), 200
