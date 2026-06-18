# 🐍 Python & Package Installation Guide
### Rakeshwar Pandey Portfolio — Linux Server Setup

> Run these commands on your Linux server via SSH **before** starting the main deployment steps.

---

## STEP 1 — Check What's Already Installed

```bash
python3 --version
pip3 --version
```

| Result | Action |
|--------|--------|
| Python 3.11+ shown | ✅ Skip to Step 3 |
| Python 3.8 / 3.9 / 3.10 | ⚠️ Do Step 2 |
| Command not found | ⚠️ Do Step 2 |

---

## STEP 2 — Install Python 3.11

### Ubuntu / Debian (most shared hosts):
```bash
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
```

### CentOS / AlmaLinux / cPanel hosts:
```bash
sudo dnf install -y python3.11 python3.11-devel
```

### cPanel hosts without sudo:
Use cPanel → **Software** → **Python Selector** to enable Python 3.11 for your account.

Verify the install:
```bash
python3.11 --version
# Expected: Python 3.11.x
```

---

## STEP 3 — Navigate to the Backend Folder

```bash
cd /home/your_username/portfolio/backend
```

---

## STEP 4 — Create a Virtual Environment

```bash
python3.11 -m venv venv
```

This creates an isolated `venv/` folder so project packages don't conflict with the system Python.

---

## STEP 5 — Activate the Virtual Environment

```bash
source venv/bin/activate
```

Your terminal prompt will change to:
```
(venv) your_username@server:~/portfolio/backend$
```

> ⚠️ **You must activate the venv every time you open a new SSH session before running Python commands.**

---

## STEP 6 — Upgrade pip

```bash
pip install --upgrade pip
```

---

## STEP 7 — Install All Project Packages

```bash
pip install -r requirements.txt
```

This installs the following packages:

| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | 0.115.6 | Web API framework |
| `uvicorn[standard]` | 0.34.0 | ASGI web server |
| `sqlalchemy` | 2.0.36 | Database ORM |
| `aiomysql` | 0.2.0 | Async MySQL driver |
| `alembic` | 1.15.1 | Database schema migrations |
| `pydantic` | 2.10.4 | Data validation |
| `pydantic-settings` | 2.7.1 | Settings from `.env` file |
| `python-jose[cryptography]` | 3.3.0 | JWT authentication tokens |
| `passlib[bcrypt]` | 1.7.4 | Password hashing |
| `python-multipart` | 0.0.20 | File upload handling |
| `aiofiles` | 24.1.0 | Async file read/write |
| `Pillow` | 11.1.0 | Image processing for uploads |
| `python-dotenv` | 1.0.1 | Load `.env` configuration |

---

## STEP 8 — Install Gunicorn (Production Server)

```bash
pip install gunicorn
```

Gunicorn runs the FastAPI app in production with multiple workers for better performance.

---

## STEP 9 — Verify All Packages Are Installed

```bash
python -c "import fastapi, uvicorn, sqlalchemy, aiomysql, alembic, pydantic, PIL; print('✅ All packages OK')"
```

Expected output:
```
✅ All packages OK
```

---

## STEP 10 — Test the App Starts

```bash
python run.py
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

Press `Ctrl+C` to stop. If you see this, Python and all packages are correctly set up. ✅

---

## ⚠️ Common Errors & Fixes

### ❌ `error: externally-managed-environment`
The system Python is blocking pip. Make sure your venv is activated:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### ❌ `aiomysql` fails to install
Install MySQL development headers first:
```bash
sudo apt install -y libmysqlclient-dev default-libmysqlclient-dev
pip install aiomysql
```

### ❌ `Pillow` fails to install
Install image libraries:
```bash
sudo apt install -y libjpeg-dev zlib1g-dev libpng-dev
pip install Pillow
```

### ❌ `python3.11-venv not found`
```bash
sudo apt install -y python3.11-venv
python3.11 -m venv venv
```

### ❌ `cryptography` package fails (for python-jose)
```bash
sudo apt install -y python3-dev libffi-dev libssl-dev build-essential
pip install cryptography
pip install python-jose[cryptography]
```

### ❌ `ModuleNotFoundError` when running the app
The venv is not activated. Run:
```bash
source venv/bin/activate
python run.py
```

### ❌ No module named 'pip'
```bash
python3.11 -m ensurepip --upgrade
python3.11 -m pip install --upgrade pip
```

---

## 🔄 How to Reactivate the Environment Later

Every time you SSH into the server and want to run the backend manually:

```bash
cd /home/your_username/portfolio/backend
source venv/bin/activate
```

---

## 📦 Checking Installed Package Versions

```bash
pip list
# or check a specific package:
pip show fastapi
```

---

## ➡️ Next Step

Once all packages are installed, continue to [DEPLOYMENT.md](./DEPLOYMENT.md) **Step 5** — configuring your `.env` file.

---

*See also: [DEPLOYMENT.md](./DEPLOYMENT.md) | [MOBILE_BUILD.md](./MOBILE_BUILD.md) | [ARCHITECTURE.md](./ARCHITECTURE.md)*
