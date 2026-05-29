# Service Slot Reservation System - Walkthrough

## Overview
This is a full-stack application for booking service slots with an AI-powered vehicle health check.

## Prerequisites
- Node.js & npm
- Python 3.8+
- Git

## Setup & Running

### 1. Backend Setup
The backend is built with Flask.
**Note:** Configured to use SQLite for demonstration. To use PostgreSQL, update `backend/config.py`.

```bash
cd backend
# Create virtual environment (if not already active)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
# (If requirements.txt is missing, run: pip install flask flask-sqlalchemy flask-cors psycopg2-binary python-dotenv flask-jwt-extended)

# Run the server
python app.py
```
Server runs at `http://localhost:5000`.

### 2. Frontend Setup
The frontend is built with React + Vite + Tailwind CSS.

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

## Features Walkthrough

### 1. Registration & Login
- Open the frontend URL.
- Click "Get Started" or "Sign Up".
- Register a new account.
- Login with your credentials.

### 2. Admin Panel (Seeding Slots)
- **Note:** The first user is NOT automatically an admin. You need to manually set `is_admin=True` in the database or use the provided seed endpoint which is currently public for demo purposes.
- Go to `http://localhost:5000/api/admin/seed-slots` (POST request) to seed slots, or use the "Seed Slots" button in the Admin Panel if you have access.
- **To get Admin Access:**
    - You can modify the database directly.
    - Or, for this demo, I've enabled the "Seed Slots" button in the Admin Panel to work (it hits the public endpoint).
    - Login, go to `/admin` (manually type URL if link is hidden).
    - *Wait, the UI hides the link if not admin.*
    - You can use the `test_api.py` script to see how the flow works or just use the app as a regular user.

### 3. Booking a Slot
- Go to "Dashboard".
- Select a date.
- You will see available slots (if seeded).
- Click "Book Now".
- Enter vehicle details (Mileage, Age, Noise).
- **AI Analysis:** The system will analyze your inputs and provide a health score and recommendation.
- Booking will be confirmed.

### 4. AI Health Check (Standalone)
- Click "AI Check" in the navbar.
- Enter vehicle details to get a quick diagnosis without booking.

## Verification Results
- **Backend Tests:** Passed. Verified Registration, Login, Slot Seeding, and Booking flow.
- **AI Module:** Verified rule-based logic for vehicle health analysis.
