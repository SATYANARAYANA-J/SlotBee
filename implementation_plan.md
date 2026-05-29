# Implementation Plan - Phase 2: Detailed Enhancements

## Goal
Build a comprehensive Service Slot Reservation System with a Red & White theme, featuring advanced AI diagnostics, detailed booking flows, and extensive admin capabilities.

## Design Theme
- **Colors**: Red (Primary) and White (Background/Secondary).
- **Style**: Clean, modern, professional.

## Detailed Features

### 1. Authentication
- **Login/Register**: Email/Password, Role Selection (User/Admin).
- **Tech**: JWT.

### 2. Customer Dashboard
- **Top Section**: Welcome Banner, Quick Actions (Book, AI Predict, Add Vehicle, Track Status).
- **Widgets**: Upcoming Bookings, AI Recommended Services, Last Service Summary, Notifications Panel.

### 3. Booking Flow (5 Steps)
1.  **Select Vehicle**: Dropdown of user's vehicles.
2.  **Select Service Type**: Periodic, Oil Change, Engine Repair, Brake Service, Inspection.
3.  **Choose Date & Time**: Calendar UI with slot availability.
4.  **Service Center**: Default or Select Center.
5.  **Confirm**: Summary with estimated cost and duration.

### 4. Vehicle Management
- **CRUD**: Add, Edit, Delete Vehicles.
- **Card View**: Details like Year, Fuel, Reg No, Last Service, Next Service.

### 5. AI Vehicle Health Prediction
- **Inputs**: Kms Driven, Last Service Kms, Engine Oil Level, Engine Temp, Battery Voltage, Brake Score (0-10).
- **Output**: Health Status, Confidence %, Issues Detected, Recommended Actions.

### 6. My Bookings & Tracking
- **List View**: Booking ID, Vehicle, Service, Date, Center, Status.
- **Status Tracking**: Booked -> Assigned -> In Service -> Wash & Clean -> Ready -> Completed.
- **Live Tracking**: Mechanic assigned, ETA, Real-time updates.

### 7. Admin Dashboard
- **Overview**: Stats cards (Total Bookings, Serviced, Pending, Revenue).
- **Management Modules**:
    - **Slots**: Calendar view, CRUD.
    - **Bookings**: Filter by date/status, Update status, Add notes.
    - **AI Monitor**: View critical vehicles and predictions.
    - **Customers**: View users and their vehicles.
    - **Service Records**: History of completed services.

### 8. Notifications & Invoices
- **Notifications**: Alerts for booking status, pickup ready, etc.
- **Invoice**: Breakdown of parts, labor, taxes.

## Database Schema Updates (SQLAlchemy)
- **User**: Existing + `phone`.
- **Vehicle**: `id`, `user_id`, `make`, `model`, `year`, `reg_no`, `fuel_type`, `kms_driven`, `last_service_date`.
- **ServiceType**: `id`, `name`, `base_cost`, `duration_mins`.
- **Slot**: Existing + `service_center_id`.
- **Booking**: Existing + `vehicle_id`, `service_type_id`, `status` (enum), `mechanic_notes`, `estimated_cost`, `eta`.
- **VehicleReport (AI)**: Updated with new input fields and detailed output.
- **Notification**: `id`, `user_id`, `message`, `read_status`, `created_at`.

## Implementation Steps
1.  **Backend Models**: Update `models.py` with new schemas.
2.  **Backend Routes**:
    - `vehicles_bp`: CRUD for vehicles.
    - `services_bp`: Manage service types.
    - `booking_bp`: Enhanced booking flow and status updates.
    - `ai_bp`: New prediction logic.
    - `admin_bp`: Enhanced stats and management.
3.  **Frontend Setup**:
    - Apply Red/White theme in `tailwind.config.js`.
    - Create Layout components (Sidebar, Navbar).
4.  **Frontend Pages**:
    - Dashboard, Vehicle Management, Booking Wizard, AI Page, Tracking Page.
    - Admin Dashboard with sub-pages.

## Verification
- **Flow**: User registers -> Adds Vehicle -> Runs AI -> Books Slot -> Admin updates status -> User tracks status.
