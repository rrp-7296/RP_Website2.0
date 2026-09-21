# PHP Backend — Deployment Guide

## Overview
This is the PHP 8.4 backend for the Rakeshwar Pandey portfolio website.  
It requires **zero Composer packages** — only plain PHP 8.4 + MySQL.

---

## Server Requirements
- PHP 8.0+ (8.4 recommended)
- MySQL 5.7+ or MariaDB 10.4+
- Apache with `mod_rewrite` enabled (standard on all cPanel hosts)
- PHP extensions: `pdo_mysql`, `gd` (for image resize), `fileinfo`

---

## Step-by-Step Deployment

### 1. Configure Database Credentials

Open `api/config.php` and fill in your MySQL details from cPanel:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'cpanelusername_yourdbname');
define('DB_USER', 'cpanelusername_yourdbuser');
define('DB_PASS', 'YourStrongPassword');
```

Also update:
- `JWT_SECRET` — generate with: `php -r "echo bin2hex(random_bytes(32));"`  
- `CORS_ORIGINS` — add your domain(s)
- `CONTACT_NOTIFY_EMAIL` — where contact form notifications go
- `UPLOAD_DIR` — absolute path to uploads on server (e.g. `/home/username/public_html/uploads`)

### 2. Upload Files to Server

Upload the following via cPanel File Manager or FTP:

```
public_html/
├── api/               ← Upload the entire api/ folder here
│   ├── .htaccess
│   ├── index.php
│   ├── config.php
│   ├── helpers/
│   └── routes/
├── uploads/           ← Upload the uploads/ folder here
│   ├── .htaccess
│   ├── blog/
│   ├── gallery/
│   ├── news/
│   └── timeline/
└── setup.php          ← Upload temporarily, DELETE after use!
```

> **Note**: If you want the API at `yourdomain.com/api/`, place the `api/` folder in `public_html/api/`.  
> If you want it at a subdomain like `api.yourdomain.com`, place it in `public_html/` of that subdomain.

### 3. Create the MySQL Database

In cPanel → MySQL Databases:
1. Create a new database (e.g., `yourname_portfolio`)
2. Create a new user with a strong password
3. Add the user to the database with **All Privileges**

### 4. Run the Setup Script

Visit in your browser:
```
https://yourdomain.com/setup.php
```

This will:
- Create all 10 database tables
- Seed the default admin user (`admin` / `admin123`)
- Seed sample blog posts

### 5. ⚠️ DELETE setup.php Immediately!

After the setup succeeds, delete `setup.php` from your server. It is a security risk.

### 6. Update the Frontend Config

In the React frontend (`ui/src/config/api.ts` or `.env.production`), ensure:
```
VITE_API_URL=https://yourdomain.com/api
```

Then rebuild the frontend locally:
```bash
npm run build
```

Upload the `ui/dist/` folder contents to your `public_html/`.

### 7. Change the Admin Password

Log in to `/admin` with `admin` / `admin123` and change the password immediately  
(via your database management tool in cPanel → phpMyAdmin, or add a change-password endpoint).

---

## API Endpoint Reference

All endpoints are prefixed with `/api/`:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/auth/login` | No | Admin login → JWT |
| GET | `/auth/me` | Yes | Get admin profile |
| GET | `/blogs` | No | Paginated blog list |
| GET | `/blogs/popular` | No | Top blogs by likes |
| GET | `/blogs/{id}` | No | Blog detail + comments |
| POST | `/blogs/{id}/like` | No | Like a blog post |
| POST | `/blogs/{id}/comments` | No | Submit a comment |
| GET | `/timeline` | No | Paginated timeline |
| GET | `/news` | No | Paginated news |
| GET | `/news/{id}` | No | News detail |
| GET | `/gallery` | No | Gallery images (filter by tag) |
| GET | `/gallery/tags` | No | Available tag categories |
| POST | `/messages` | No | Submit contact form |
| POST | `/subscriptions` | No | Newsletter subscribe |
| GET | `/admin/stats` | ✅ | Dashboard statistics |
| POST | `/admin/blogs` | ✅ | Create blog post |
| PUT | `/admin/blogs/{id}` | ✅ | Update blog post |
| DELETE | `/admin/blogs/{id}` | ✅ | Delete blog post |
| POST | `/admin/timeline` | ✅ | Create timeline event |
| DELETE | `/admin/timeline/{id}` | ✅ | Delete timeline event |
| POST | `/admin/news` | ✅ | Create news item |
| DELETE | `/admin/news/{id}` | ✅ | Delete news item |
| POST | `/admin/gallery` | ✅ | Upload gallery image |
| DELETE | `/admin/gallery/{id}` | ✅ | Delete gallery image |
| GET | `/admin/messages` | ✅ | List contact messages |
| PATCH | `/admin/messages/{id}/read` | ✅ | Mark message read |
| POST | `/admin/messages/{id}/reply` | ✅ | Reply to message |
| GET | `/admin/comments` | ✅ | List pending comments |
| PATCH | `/admin/comments/{id}/approve` | ✅ | Approve comment |
| DELETE | `/admin/comments/{id}` | ✅ | Delete comment |
| GET | `/admin/notifications` | ✅ | List notifications |
| PATCH | `/admin/notifications/{id}/read` | ✅ | Mark notification read |
| POST | `/admin/notifications/read-all` | ✅ | Mark all notifications read |
| DELETE | `/admin/notifications/{id}` | ✅ | Delete notification |

---

## Troubleshooting

**500 Error / White page**
- Enable PHP error display temporarily: add `ini_set('display_errors', 1);` at top of `index.php`
- Check the error log in cPanel → Logs → Error Log

**CORS errors in browser**
- Update `CORS_ORIGINS` in `config.php` to include your exact domain

**Images not saving**
- Ensure the `uploads/` directory is writable: `chmod 755 uploads/`
- Check `UPLOAD_DIR` is the correct absolute path

**`.htaccess` not working**
- Ensure Apache `AllowOverride All` is enabled (it usually is on cPanel)
- Check that `mod_rewrite` is enabled (almost always on cPanel)

**mod_rewrite issues with subdirectory**
- If the API is in a subdirectory (e.g., `public_html/api/`), the `.htaccess` auto-strips the prefix
