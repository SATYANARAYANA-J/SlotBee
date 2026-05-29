from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app)
    db.init_app(app)
    JWTManager(app)

    from routes.auth_routes import auth_bp
    from routes.slot_routes import slot_bp
    from routes.admin_routes import admin_bp
    from routes.vehicle_routes import vehicle_bp
    from routes.service_routes import service_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(slot_bp, url_prefix='/api/slots')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(vehicle_bp, url_prefix='/api/vehicles')
    app.register_blueprint(service_bp, url_prefix='/api/services')

    with app.app_context():
        db.create_all()

    @app.route('/')
    def index():
        return "Service Slot Reservation API is running!"

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
