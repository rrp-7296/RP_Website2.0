# Website 2.0 — Architecture & Design Decisions

## Project Overview
Portfolio website rebuild for **Rakeshwar Pandey** (Social Leader & President, INTUC Jharkhand).

**Project Tracker ID**: `56bd5490-fc26-48af-93cd-9299cfc9363a`  
**Tracker URL**: http://localhost:3000

---

## Design Decisions Log

### DD-001: Frontend Framework — React + Vite (TypeScript)
- **Decision**: Use React with Vite bundler and TypeScript
- **Rationale**: Fast HMR, optimized builds, SPA with no SSR needed, best ecosystem for Capacitor mobile wrapping
- **Date**: 2026-06-10

### DD-002: Mobile App Strategy — Capacitor.js
- **Decision**: Wrap React SPA with Capacitor for Android/iOS
- **Rationale**: Single codebase for web + mobile, no UI rewrite needed (vs React Native)
- **Date**: 2026-06-10

### DD-003: Color Scheme — Indian Tricolor Inspired
- **Decision**: Indian tricolor theme (saffron, white, green accents with navy base)
- **Details**: 
  - Primary: Saffron/Deep Orange (`#FF6B00` → `#FF9933`)
  - Secondary: Forest Green (`#138808` → `#059669`)
  - Accent: White/Cream (`#FFFFFF` → `#F5F0E8`)
  - Base: Deep Navy (`#0a0f1c` → `#111827`)
  - Enriched with gradients, glassmorphism, beautiful transitions and animations
- **Date**: 2026-06-10

### DD-004: Admin Panel — Full Feature Parity
- **Decision**: Replicate ALL admin features from old site
- **Scope**: Blog CRUD, Timeline CRUD, News CRUD, Gallery management, Messages inbox, Comment approval, Dashboard stats
- **Enhancement**: Beautiful modern dashboard UI
- **Date**: 2026-06-10

### DD-005: Gallery — Dynamic with Auto-Sync
- **Decision**: Fully dynamic gallery with admin upload capability
- **Enhancement**: Timeline posts automatically added to gallery as well
- **Date**: 2026-06-10

### DD-006: Database — MySQL 8.0
- **Decision**: Target MySQL 8.0
- **Date**: 2026-06-10

### DD-007: Deployment — Shared Linux Server
- **Decision**: FastAPI behind Apache/Nginx reverse proxy, React build as static files
- **Date**: 2026-06-10

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + Vite | React 18+, Vite 6+ |
| Language | TypeScript | 5.x |
| Backend | FastAPI | 0.115+ |
| ORM | SQLAlchemy | 2.0+ |
| Database | MySQL | 8.0 |
| Migrations | Alembic | 1.15+ |
| Auth | JWT (python-jose) | — |
| Mobile | Capacitor.js | 6+ |
| Server | Uvicorn | 0.34+ |

---

## Folder Structure

```
Website2.0/
├── docs/              ← Project documentation
├── backend/           ← FastAPI + MySQL (Python)
│   ├── app/           ← Application code
│   ├── uploads/       ← User-uploaded files
│   └── alembic/       ← DB migrations
├── ui/                ← React + Vite (TypeScript)
│   ├── src/           ← Source code
│   └── public/        ← Static assets
├── mobile/            ← Capacitor native projects
└── README.md
```
