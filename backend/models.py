from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    name = db.Column(db.String(64))
    phone = db.Column(db.String(20))
    is_admin = db.Column(db.Boolean, default=False)
    
    vehicles = db.relationship('Vehicle', backref='owner', lazy=True)
    bookings = db.relationship('Booking', backref='user', lazy='dynamic')
    notifications = db.relationship('Notification', backref='user', lazy='dynamic')

class Vehicle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    make = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    year = db.Column(db.Integer)
    reg_no = db.Column(db.String(20), unique=True)
    fuel_type = db.Column(db.String(20))
    kms_driven = db.Column(db.Integer)
    last_service_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ServiceCenter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200))
    contact_number = db.Column(db.String(20))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

class ServiceType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False) # e.g., Periodic, Oil Change
    description = db.Column(db.Text)
    base_cost = db.Column(db.Float)
    duration_mins = db.Column(db.Integer)

class Slot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_center_id = db.Column(db.Integer, db.ForeignKey('service_center.id'), nullable=True) # Optional for now
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    capacity = db.Column(db.Integer, default=1)
    booked_count = db.Column(db.Integer, default=0)
    bookings = db.relationship('Booking', backref='slot', lazy='dynamic')

# Association Table for Many-to-Many relationship between Booking and ServiceType
booking_services = db.Table('booking_services',
    db.Column('booking_id', db.Integer, db.ForeignKey('booking.id'), primary_key=True),
    db.Column('service_type_id', db.Integer, db.ForeignKey('service_type.id'), primary_key=True)
)

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicle.id'), nullable=False)
    slot_id = db.Column(db.Integer, db.ForeignKey('slot.id'), nullable=False)
    
    # Removed single service_type_id
    # service_type_id = db.Column(db.Integer, db.ForeignKey('service_type.id'), nullable=False)
    
    status = db.Column(db.String(20), default='Booked') # Booked, Assigned, In Service, Wash & Clean, Ready, Completed, Cancelled
    estimated_cost = db.Column(db.Float)
    final_cost = db.Column(db.Float)
    mechanic_notes = db.Column(db.Text)
    eta = db.Column(db.DateTime) # Estimated completion time
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    vehicle = db.relationship('Vehicle')
    # Many-to-Many relationship
    services = db.relationship('ServiceType', secondary=booking_services, lazy='subquery',
        backref=db.backref('bookings', lazy=True))
    
    report = db.relationship('VehicleReport', backref='booking', uselist=False)

class VehicleReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=False)
    
    # Inputs
    kms_driven = db.Column(db.Integer)
    oil_level = db.Column(db.String(20)) # Low, Normal, High
    engine_temp = db.Column(db.Float)
    battery_voltage = db.Column(db.Float)
    brake_condition = db.Column(db.Integer) # 0-10
    
    # Outputs
    health_score = db.Column(db.Integer)
    health_status = db.Column(db.String(50))
    issues_detected = db.Column(db.Text) # JSON string or comma separated
    recommendations = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
