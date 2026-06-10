# Website 2.0 — Rakeshwar Pandey Portfolio

A modern portfolio website for **Rakeshwar Pandey** (Social Leader & President, INTUC Jharkhand).

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Python FastAPI + MySQL 8.0
- **Mobile**: Capacitor.js (Android/iOS)
- **ORM**: SQLAlchemy 2.0 + Alembic

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Edit with your MySQL credentials
alembic upgrade head       # Run migrations
python run.py              # Starts on http://localhost:8000
```

### Frontend
```bash
cd ui
npm install
npm run dev                # Starts on http://localhost:5173
```

### Mobile
```bash
cd ui
npm run build
npx cap sync
npx cap open android       # Opens Android Studio
npx cap open ios            # Opens Xcode
```

## Project Structure
```
Website2.0/
├── docs/           # Architecture & design decisions
├── backend/        # FastAPI + MySQL
├── ui/             # React + Vite
├── mobile/         # Capacitor native projects
└── README.md
```
