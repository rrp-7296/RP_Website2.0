# 🚀 Linux Shared Server Deployment Guide
### Rakeshwar Pandey Portfolio (FastAPI + React)

> This guide deploys your project on a shared Linux server (cPanel / SSH access).
> Stack: **FastAPI (Python)** backend + **React (Vite)** frontend + **MySQL** database + **Nginx** reverse proxy

---

## 📋 Prerequisites Checklist

Before you begin, make sure you have:

- [ ] SSH access to your server (hostname, username, password/key)
- [ ] A domain name pointed to the server IP (A record in DNS)
- [ ] MySQL database created via cPanel or terminal
- [ ] Python 3.11+ available on the server (`python3 --version`)

---

## STEP 1 — Connect to Your Server via SSH

```bash
ssh your_username@your_server_ip
# or if using a custom SSH port:
ssh -p 2222 your_username@your_server_ip
```

> **cPanel Shared Hosts**: Enable SSH in cPanel → "SSH Access" and use Terminal or PuTTY.

---

## STEP 2 — Upload Your Project Files

### Option A: Git (Recommended)

```bash
# On the server — clone your repo
cd /home/your_username
git clone https://github.com/rrp-7296/RP_Website2.0.git portfolio
cd portfolio
```

### Option B: Upload via FTP/SFTP (FileZilla)

Upload your project folder to `/home/your_username/portfolio/`

Make sure these folders are uploaded:
```
portfolio/
├── backend/
│   ├── app/
│   ├── requirements.txt
│   ├── run.py
│   └── alembic/
└── ui/
    └── dist/          ← Built React app (see Step 6)
```

---

## STEP 3 — Set Up MySQL Database

### In cPanel → MySQL Databases:
1. Create a database: `your_cpanel_user_rakeshwar`
2. Create a user: `your_cpanel_user_rp`
3. Set a strong password
4. Add user to database → Grant ALL PRIVILEGES

### Or via terminal:
```bash
mysql -u root -p
```
```sql
CREATE DATABASE rakeshwarpandey_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'rp_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON rakeshwarpandey_v2.* TO 'rp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## STEP 4 — Set Up Python Virtual Environment

```bash
cd /home/your_username/portfolio/backend

# Check Python version (needs 3.11+)
python3 --version

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

> **If Python 3.11+ is not available**, install it:
> ```bash
> sudo apt update && sudo apt install python3.11 python3.11-venv python3.11-dev -y
> ```

---

## STEP 5 — Configure Environment Variables

```bash
cd /home/your_username/portfolio/backend

# Copy the example env file
cp .env.example .env

# Edit with your real values
nano .env
```

Paste and fill in your actual values:

```ini
# ─── Database ──────────────────────────────────────────────
DATABASE_URL=mysql+aiomysql://rp_user:YourStrongPassword123!@localhost:3306/rakeshwarpandey_v2

# ─── JWT (generate a strong secret!) ──────────────────────
JWT_SECRET=paste-a-very-long-random-string-here-at-least-64-chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440

# ─── CORS (your domain here) ──────────────────────────────
CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com","capacitor://localhost","http://localhost"]

# ─── Uploads ───────────────────────────────────────────────
UPLOAD_DIR=/home/your_username/portfolio/backend/uploads
MAX_UPLOAD_SIZE_MB=10

# ─── Email (SMTP for contact form replies) ────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-gmail-app-password
CONTACT_NOTIFY_EMAIL=rakeshwarpandey@gmail.com

# ─── App ───────────────────────────────────────────────────
APP_NAME=Rakeshwar Pandey Portfolio
DEBUG=false
```

> **Generate a JWT secret:**
> ```bash
> python3 -c "import secrets; print(secrets.token_hex(64))"
> ```

> **Gmail App Password**: Google Account → Security → 2-Step Verification → App Passwords

Save: `Ctrl+O` → Enter → `Ctrl+X`

---

## STEP 6 — Build the React Frontend

Do this on your **local Windows machine** first, then upload `dist/`:

```powershell
# In your local terminal
cd C:\Old_Website\Website2.0\ui

# Create production env file
echo "VITE_API_URL=https://yourdomain.com" > .env.production

# Build
npm run build
```

Then upload the generated `ui/dist/` folder to the server at:
```
/home/your_username/portfolio/ui/dist/
```

Or if using Git — commit the `dist/` folder (or build on the server if Node.js is available):

```bash
# On the server (if Node.js 18+ is available)
cd /home/your_username/portfolio/ui
npm install
VITE_API_URL=https://yourdomain.com npm run build
```

---

## STEP 7 — Run Database Migrations

```bash
cd /home/your_username/portfolio/backend
source venv/bin/activate

# Option A: Auto-migration (development style)
python -c "from app.database import init_db; import asyncio; asyncio.run(init_db())"

# Option B: Alembic (production style — recommended)
alembic upgrade head
```

---

## STEP 8 — Test the Backend Manually

```bash
cd /home/your_username/portfolio/backend
source venv/bin/activate

# Start for a quick test
python run.py
```

Visit `http://your_server_ip:8000/api/health` — you should see:
```json
{"status": "healthy", "app": "Rakeshwar Pandey Portfolio", "version": "2.0.0"}
```

Press `Ctrl+C` to stop.

---

## STEP 9 — Set Up Gunicorn (Production Server)

```bash
source venv/bin/activate
pip install gunicorn

# Test Gunicorn works
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

Press `Ctrl+C` when confirmed working.

---

## STEP 10 — Keep Backend Running with Supervisor

Supervisor restarts your app automatically if it crashes.

```bash
# Install Supervisor
sudo apt install supervisor -y
```

Create a config file:
```bash
sudo nano /etc/supervisor/conf.d/portfolio.conf
```

Paste this (replace `your_username` everywhere):
```ini
[program:portfolio]
command=/home/your_username/portfolio/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000
directory=/home/your_username/portfolio/backend
user=your_username
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/var/log/portfolio.err.log
stdout_logfile=/var/log/portfolio.out.log
environment=HOME="/home/your_username"
```

Apply and start:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start portfolio
sudo supervisorctl status portfolio
```

You should see `RUNNING`. ✅

---

## STEP 11 — Configure Nginx Reverse Proxy

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/portfolio
```

Paste (replace `yourdomain.com` and `your_username`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Max upload size
    client_max_body_size 15M;

    # Proxy all /api and /uploads requests to FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }

    # Serve the built React SPA for everything else
    location / {
        root /home/your_username/portfolio/ui/dist;
        try_files $uri $uri/ /index.html;
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }
}
```

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## STEP 12 — Enable HTTPS with Let's Encrypt (Free SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts — Certbot will automatically update your Nginx config with SSL.

Auto-renewal is set up automatically. Test it:
```bash
sudo certbot renew --dry-run
```

---

## STEP 13 — Rebuild Android APK with Production URL

On your **local Windows machine**:

```powershell
cd C:\Old_Website\Website2.0\ui

# Set production API URL
echo "VITE_API_URL=https://yourdomain.com" > .env.production

# Build React
npm run build

# Sync to Android
npx cap sync android

# Build APK
cd android
$env:JAVA_HOME="C:\Old_Website\jdk21"
.\gradlew.bat assembleDebug
```

New APK location:
```
ui\android\app\build\outputs\apk\debug\app-debug.apk
```

The app will now connect to your live server instead of your local PC.

---

## STEP 14 — Seed Admin User

```bash
cd /home/your_username/portfolio/backend
source venv/bin/activate
python -m app.seed
```

> Default credentials are in `app/seed.py`. **Change the admin password** immediately after first login.

---

## ✅ Post-Deployment Checklist

| Check | URL / Command |
|-------|--------------|
| API health check | `https://yourdomain.com/api/health` |
| Frontend loads | `https://yourdomain.com` |
| Admin panel | `https://yourdomain.com/admin` |
| Uploads work | Upload a blog image via admin |
| Contact form | Submit a test message |
| Email reply | Reply to a message in admin |
| Backend logs | `sudo tail -f /var/log/portfolio.out.log` |
| Supervisor status | `sudo supervisorctl status portfolio` |

---

## 🔥 Common Issues & Fixes

### ❌ `502 Bad Gateway`
The backend isn't running.
```bash
sudo supervisorctl status portfolio
sudo tail -50 /var/log/portfolio.err.log
```

### ❌ `CORS error` in browser
Add your domain to `CORS_ORIGINS` in `.env`:
```ini
CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com","capacitor://localhost"]
```
Then restart: `sudo supervisorctl restart portfolio`

### ❌ `Can't connect to MySQL`
Verify credentials and test:
```bash
mysql -u rp_user -p rakeshwarpandey_v2
```

### ❌ `ModuleNotFoundError`
Virtual environment not activated or package missing:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### ❌ Android app still hits old IP
Make sure `.env.production` has `VITE_API_URL=https://yourdomain.com` and rebuild the APK.

### ❌ File uploads permission denied
```bash
chmod -R 755 /home/your_username/portfolio/backend/uploads
```

---

## 🔄 How to Update the Site After Changes

```bash
# On the server
cd /home/your_username/portfolio
git pull origin main

# Restart backend
sudo supervisorctl restart portfolio

# If frontend changed — rebuild locally and re-upload dist/
# Or on server if Node.js available:
cd ui && npm run build
```

---

> **Need a signed APK for Play Store?** Ask me to generate a keystore and create a signed release build.
