# Service Slot Reservation System

A full-stack web application for booking vehicle service slots with AI health analysis.

## Tech Stack
- **Backend**: Python Flask, SQLite (Demo), SQLAlchemy
- **Frontend**: React, Vite, Tailwind CSS

## Quick Start

### 1. Start Backend
Open a terminal in the `backend` folder:
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Server runs at: `http://localhost:5000`

### 2. Start Frontend
Open a new terminal in the `frontend` folder:
```powershell
cd frontend
npm install
npm run dev
```
App runs at: `http://localhost:5173`

## Features
- **User Dashboard**: Book slots, view history.
- **AI Check**: Analyze vehicle health based on mileage, age, and noise.
- **Admin Panel**: Manage slots and view all bookings.
