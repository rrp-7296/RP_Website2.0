# 🌐 Shared Linux Hosting Deployment (No Sudo / cPanel)
### Rakeshwar Pandey Portfolio (FastAPI + React)

If your shared Linux hosting (e.g., Namecheap, Hostinger, GoDaddy, Bluehost) does **not** give you `sudo` or root access, you cannot use Nginx or Supervisor. Instead, you must use the web server's built-in tools.

This guide covers the two best methods to deploy without `sudo`:
- **Method A (Easiest)**: Using cPanel's built-in **"Setup Python App"** (Phusion Passenger).
- **Method B (SSH Background Process)**: Running Uvicorn in the background + Apache `.htaccess` redirect.

---

## 🏗️ Step 1: Deploying the React Frontend (No Sudo Required)
Because React compiles into static HTML, CSS, and JS, it does not need a running node server.

1. On your local machine, build the production frontend:
   ```powershell
   cd ui
   echo "VITE_API_URL=https://yourdomain.com" > .env.production
   npm run build
   ```
2. Compress the contents of the `ui/dist/` folder into a `.zip` file.
3. Upload this `.zip` file to your server (either via cPanel File Manager or FTP) and extract it directly into your domain's document root (usually `/public_html`).

---

## 🐍 Method A: cPanel "Setup Python App" (Phusion Passenger)

Most shared hosts use **Phusion Passenger** to run Python apps under Apache.

### 1. Create the Python Application in cPanel
1. Log in to cPanel.
2. Search for and open **"Setup Python App"**.
3. Click **Create Application**.
4. Configure the settings:
   - **Python Version**: Select `3.11` or `3.12`.
   - **Application root**: `portfolio-backend` (creates a directory at `/home/your_username/portfolio-backend`).
   - **Application URL**: `yourdomain.com/api` (this routes `/api` requests to Python).
   - **Application startup file**: `passenger_wsgi.py` (leave as default).
   - **Application Entry point**: `application` (leave as default).
5. Click **Create**.

### 2. Upload Backend Code
Upload your backend folder files (except `venv` or `test.db`) directly to `/home/your_username/portfolio-backend/`.

### 3. Install Dependencies
1. Copy the command at the top of the cPanel Python App page to enter the virtual environment (it looks like `source /home/your_username/nodevenv/portfolio-backend/.../bin/activate`).
2. Log into your server via SSH, paste that command, and run it.
3. Install the dependencies and the WSGI wrapper `a2wsgi` (which converts FastAPI's ASGI interface to WSGI for Passenger):
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   pip install a2wsgi
   ```

### 4. Create `passenger_wsgi.py`
cPanel runs Python apps using WSGI. Create a `passenger_wsgi.py` file in `/home/your_username/portfolio-backend/` to translate FastAPI's ASGI app:

```python
import sys
import os

# Add your application directory to python path
sys.path.insert(0, os.path.dirname(__file__))

# Import the WSGI adapter and your FastAPI app instance
from a2wsgi import ASGIMiddleware
from app.main import app

# Wrap the FastAPI ASGI application as a WSGI app for cPanel/Passenger
application = ASGIMiddleware(app)
```

### 5. Restart the Python App
Go back to cPanel **"Setup Python App"** and click **Restart**. Your API is now live at `https://yourdomain.com/api`.

---

## 🏃 Method B: SSH Background Process + Apache `.htaccess` Proxy

If your host does **not** have "Setup Python App" but provides SSH access, you can run Uvicorn in the background and proxy requests to it using Apache's `.htaccess` mod_rewrite.

### 1. Start the Backend via SSH (No Sudo)
1. Navigate to your backend directory and activate your virtual environment:
   ```bash
   cd /home/your_username/portfolio/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. Start Uvicorn as a background daemon process using `nohup` (No Hang Up) on an unused port (like `8080`):
   ```bash
   nohup uvicorn app.main:app --host 127.0.0.1 --port 8080 --workers 2 > uvicorn.log 2>&1 &
   ```
3. Verify it is running:
   ```bash
   ps aux | grep uvicorn
   ```

### 2. Configure `.htaccess` to Proxy `/api` and `/uploads`
In your domain's `/public_html` directory, create or edit the `.htaccess` file to forward API and upload requests to your background Python app:

```apache
DirectoryIndex index.html

RewriteEngine On

# Redirect /api requests to the running Uvicorn port
RewriteRule ^api/(.*)$ http://127.0.0.1:8080/api/$1 [P,L]

# Redirect /uploads requests to the running Uvicorn port
RewriteRule ^uploads/(.*)$ http://127.0.0.1:8080/uploads/$1 [P,L]

# Serve React SPA router fallback (for client side routes)
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
```

### 3. Keeping Backend Running via User Cron Job
Since you cannot use Supervisor to auto-start the app after a server reboot, add a user cron job:
1. Run `crontab -e` in your SSH terminal.
2. Add this line to automatically start the backend if the server reboots:
   ```cron
   @reboot /home/your_username/portfolio/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8080 --workers 2 > /home/your_username/portfolio/backend/uvicorn.log 2>&1 &
   ```
