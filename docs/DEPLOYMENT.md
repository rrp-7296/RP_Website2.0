# Website 2.0 — Production Deployment Guide

This guide details the deployment steps for **Website 2.0** on a shared Linux server.

---

## Architecture Overview

```
                        +----------------------+
                        |     Linux Server     |
                        +----------------------+
                                   |
                     +-------------+-------------+
                     |                           |
                     v                           v
              [Apache / Nginx]             [MySQL 8.0]
              (Port 80/443)                (Port 5236 / 3306)
                     |                           ^
         +-----------+-----------+               |
         |                       |               |
         v                       v               |
    [Static HTML]         [FastAPI Backend] -----+
  (React build files)      (Uvicorn + Systemd)
                          (Running on Port 8000)
```

---

## Phase 1: Database Setup & Migration

### 1.1 Create the Database
Log in to your MySQL server and create the new database schema:
```sql
CREATE DATABASE rakeshwarpandey_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 1.2 Setup Environment Variables
Create a `.env` file in the `backend/` directory using `backend/.env.example` as a template. Set your production database URL, JWT secret, and SMTP parameters:
```env
DATABASE_URL=mysql+aiomysql://root:secure_password@localhost:5236/rakeshwarpandey_v2
JWT_SECRET=your_super_long_random_secret_string
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_NOTIFY_EMAIL=rakeshwarpandey@gmail.com
```

### 1.3 Run Database Migrations
Inside the `backend/` folder, run Alembic migrations to generate the tables:
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head
```

### 1.4 Run Data Migration Script
To migrate the content from the old database (`rakeshwarpandey_blogdtls`) to the new one:
```bash
python migration.py \
  --source "mysql+pymysql://rakes_rrp7296:Ravi@7296@localhost:5236/rakeshwarpandey_blogdtls" \
  --dest "mysql+pymysql://root:secure_password@localhost:5236/rakeshwarpandey_v2"
```

### 1.5 Seed the Admin Account
Run the seeding script to create the initial admin user credentials:
```bash
python -m app.seed
```
*Note: Make sure to change the default admin password immediately inside the admin dashboard.*

---

## Phase 2: FastAPI Backend Deployment

We recommend running FastAPI with **Uvicorn** managed by **Systemd** or **Supervisord**.

### 2.1 Systemd Configuration
Create a service file `/etc/systemd/system/rakeshwar_backend.service`:
```ini
[Unit]
Description=FastAPI Backend for Rakeshwar Pandey Portfolio
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/Website2.0/backend
ExecStart=/var/www/Website2.0/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable rakeshwar_backend
sudo systemctl start rakeshwar_backend
```

---

## Phase 3: Frontend Deployment

### 3.1 Build the Production Bundle
Compile the React SPA locally or on your CI/CD server:
```bash
cd ui
npm install
npm run build
```
This produces a static output directory `ui/dist/`.

### 3.2 Configure Nginx Reverse Proxy
To serve the React static files and reverse-proxy `/api` requests to Uvicorn, add the following block to your Nginx site configuration:
```nginx
server {
    listen 80;
    server_name rakeshwarpandey.com www.rakeshwarpandey.com;

    # React Static SPA
    location / {
        root /var/www/Website2.0/ui/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Uploaded Media Files
    location /uploads {
        alias /var/www/Website2.0/backend/uploads;
        expires 7d;
        add_header Cache-Control "public";
    }

    # FastAPI backend proxy
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reload Nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```
