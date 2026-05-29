from flask import Blueprint, request, jsonify
from models import db, Slot, Booking, User, Vehicle, ServiceType
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

def is_admin():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return user and user.is_admin

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    if not is_admin(): return jsonify({"msg": "Forbidden"}), 403
    
    today = datetime.now().date()
    total_bookings = Booking.query.filter(Booking.created_at >= today).count()
    serviced = Booking.query.filter_by(status='Completed').count()
    pending = Booking.query.filter(Booking.status.in_(['Booked', 'Assigned', 'In Service'])).count()
    
    return jsonify({
        "total_bookings_today": total_bookings,
        "serviced_total": serviced,
        "pending_active": pending,
        "revenue": 0 # Placeholder
    }), 200

@admin_bp.route('/bookings', methods=['GET'])
@jwt_required()
def get_all_bookings():
    if not is_admin(): return jsonify({"msg": "Forbidden"}), 403
    
    status_filter = request.args.get('status')
    query = Booking.query
    if status_filter:
        query = query.filter_by(status=status_filter)
        
    bookings = query.order_by(Booking.created_at.desc()).all()
    result = []
    for b in bookings:
        service_names = ", ".join([s.name for s in b.services])
        result.append({
            "id": b.id,
            "user": b.user.name or b.user.email,
            "vehicle": f"{b.vehicle.make} {b.vehicle.model}",
            "service": service_names,
            "date": b.slot.date.isoformat(),
            "time": b.slot.time.strftime('%H:%M'),
            "status": b.status,
            "cost": b.estimated_cost
        })
    return jsonify(result), 200

@admin_bp.route('/bookings/<int:id>/status', methods=['PUT'])
@jwt_required()
def update_status(id):
    if not is_admin(): return jsonify({"msg": "Forbidden"}), 403
    
    data = request.get_json()
    new_status = data.get('status')
    
    booking = Booking.query.get_or_404(id)
    booking.status = new_status
    db.session.commit()
    
    return jsonify({"msg": "Status updated"}), 200

@admin_bp.route('/slots', methods=['POST'])
@jwt_required()
def create_slot():
    if not is_admin(): return jsonify({"msg": "Forbidden"}), 403
    
    data = request.get_json()
    new_slot = Slot(
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        time=datetime.strptime(data['time'], '%H:%M').time(),
        capacity=data.get('capacity', 1)
    )
    db.session.add(new_slot)
    db.session.commit()
    return jsonify({"msg": "Slot created"}), 201

@admin_bp.route('/seed-slots', methods=['POST'])
def seed_slots():
    # Public for demo
    start_date = datetime.now().date()
    for i in range(7):
        current_date = start_date + timedelta(days=i)
        for hour in range(9, 18):
            time_obj = datetime.strptime(f"{hour}:00", "%H:%M").time()
            if not Slot.query.filter_by(date=current_date, time=time_obj).first():
                slot = Slot(date=current_date, time=time_obj, capacity=3)
                db.session.add(slot)
    db.session.commit()
    return jsonify({"msg": "Slots seeded"}), 201
