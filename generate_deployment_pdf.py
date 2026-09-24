import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

def create_deployment_guide_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor('#FF9933')      # Saffron
    secondary_color = colors.HexColor('#0D1117')    # Dark Theme header
    accent_green = colors.HexColor('#10B981')       # Green
    dark_text = colors.HexColor('#1E293B')          # Dark slate
    light_bg = colors.HexColor('#F8FAFC')           # Slate background
    code_bg = colors.HexColor('#1E1E1E')            # Dark code box

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        alignment=TA_LEFT,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=secondary_color,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#C2410C'),
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=dark_text,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletDark',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        fontName='Courier',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#00FF66'),
        spaceBefore=4,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=body_style,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#475569')
    )

    story = []

    # Title Banner Block
    story.append(Paragraph("RAKESHWAR PANDEY PORTFOLIO & CMS", title_style))
    story.append(Paragraph("Comprehensive End-to-End Production Deployment Guide (Web & Backend)", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceBefore=0, spaceAfter=15))

    # Executive Overview
    overview_text = """<b>Executive Overview:</b> This document provides an exhaustive, step-by-step production deployment manual for the Rakeshwar Pandey Portfolio & CMS application. The system consists of a Vite/React Single Page Application (SPA) frontend, a pure PHP 7.4/8.x REST API backend, and a MySQL / SQLite database engine. Follow each section in order to ensure complete security, reliability, and functionality in live production environments."""
    
    overview_table = Table(
        [[Paragraph(overview_text, callout_style)]],
        colWidths=[530]
    )
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('LINELEFT', (0,0), (0,0), 4, primary_color)
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 12))

    # SECTION 1
    story.append(Paragraph("1. System Requirements & Hosting Prerequisites", h1_style))
    story.append(Paragraph("Ensure the hosting server meets all minimum technical requirements prior to deployment:", body_style))
    
    reqs = [
        "<b>Web Server:</b> Apache 2.4+ (with <code>mod_rewrite</code> enabled) or Nginx 1.18+.",
        "<b>PHP Version:</b> PHP 7.4, 8.0, 8.1, 8.2, or 8.3.",
        "<b>Required PHP Extensions:</b> <code>pdo</code>, <code>pdo_mysql</code>, <code>gd</code>, <code>fileinfo</code>, <code>json</code>, <code>mbstring</code>, <code>openssl</code>.",
        "<b>Database Server:</b> MySQL 5.7+ / MariaDB 10.3+ (or SQLite 3 for zero-config instances).",
        "<b>SSL Certificate:</b> Valid HTTPS certificate (Let's Encrypt / cPanel AutoSSL mandatory for JWT headers).",
        "<b>File Permissions:</b> Ability to set directory permissions (755) and file permissions (644)."
    ]
    for r in reqs:
        story.append(Paragraph(f"• {r}", bullet_style))
    
    story.append(Spacer(1, 10))

    # SECTION 2
    story.append(Paragraph("2. Database Creation & Schema Migration", h1_style))
    story.append(Paragraph("Follow these steps to prepare your production database:", body_style))

    story.append(Paragraph("Step 2.1: Create MySQL Database & User (cPanel / MySQL CLI)", h2_style))
    sql_cmd = """CREATE DATABASE cpanel_rakeshwar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nCREATE USER 'cpanel_rakeshwar_usr'@'localhost' IDENTIFIED BY 'StrongPass_2026!#';\nGRANT ALL PRIVILEGES ON cpanel_rakeshwar_db.* TO 'cpanel_rakeshwar_usr'@'localhost';\nFLUSH PRIVILEGES;"""
    
    cmd_table = Table([[Paragraph(sql_cmd.replace('\n', '<br/>'), code_style)]], colWidths=[530])
    cmd_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), code_bg),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#333333'))
    ]))
    story.append(cmd_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Step 2.2: Initialize Database Schema", h2_style))
    story.append(Paragraph("You can initialize schema automatically by visiting <code>https://yourdomain.com/api/setup.php</code> once after uploading files, OR by executing table creation DDL statements in phpMyAdmin.", body_style))

    tables_info = [
        ["Table Name", "Purpose & Key Columns"],
        ["admin_users", "Admin authentication credentials (id, username, password_hash, display_name, email)"],
        ["blog_posts", "Blog articles & metadata (id, title, description, main_body, image, views, likes)"],
        ["blog_comments", "User comments on blogs (id, post_id, name, comment, is_approved)"],
        ["news_items", "News items & press releases (id, title, text, image, url, date, likes)"],
        ["timeline_events", "Chronological journey events (id, text, location, image, date, likes)"],
        ["gallery_images", "Photo gallery repository (id, filename, tag, caption, source_timeline_id)"],
        ["contact_messages", "Inbox submitted messages (id, name, email, subject, message, is_read, is_replied)"],
        ["subscriptions", "Subscriber distribution list (id, name, email, phone, status)"],
        ["visitor_profiles", "Registered site visitors (id, name, email, phone, is_subscribed)"],
        ["notifications", "Admin system activity alerts (id, type, post_id, item_id, message, is_read)"]
    ]

    tbl = Table(tables_info, colWidths=[130, 400])
    tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('FONTSIZE', (0,1), (-1,-1), 8.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(tbl)
    story.append(Spacer(1, 14))

    # SECTION 3
    story.append(Paragraph("3. Central Backend Configuration (api/config.php)", h1_style))
    story.append(Paragraph("Open <code>backend-php/api/config.php</code> and configure production variables:", body_style))

    config_snippets = """// 1. Set Production Database Driver & Credentials
define('DB_DRIVER', 'mysql'); // Change from 'sqlite' to 'mysql'
define('DB_HOST', 'localhost');
define('DB_PORT', 3306);
define('DB_NAME', 'cpanel_rakeshwar_db');
define('DB_USER', 'cpanel_rakeshwar_usr');
define('DB_PASS', 'StrongPass_2026!#');

// 2. Set Cryptographically Secure 64-character JWT Secret Key
define('JWT_SECRET', 'e9f4a8b2c7d1e0f3a6b5c4d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2');
define('JWT_EXPIRY_MINUTES', 1440); // 24 Hours

// 3. Configure Production CORS Allowed Origins
define('CORS_ORIGINS', [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'capacitor://localhost'
]);

// 4. Set SMTP & Notification Email Settings
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'info@yourdomain.com');
define('SMTP_PASS', 'your-app-password');
define('CONTACT_NOTIFY_EMAIL', 'rakeshwarpandey@gmail.com');

// 5. Disable Debug Mode for Production
define('DEBUG', false);"""

    cfg_table = Table([[Paragraph(config_snippets.replace('\n', '<br/>'), code_style)]], colWidths=[530])
    cfg_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), code_bg),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#333333'))
    ]))
    story.append(cfg_table)
    story.append(Spacer(1, 14))

    # Page Break for clean section layout
    story.append(PageBreak())

    # SECTION 4
    story.append(Paragraph("4. Frontend Build & Distribution Deployment", h1_style))
    story.append(Paragraph("Step 4.1: Production API Base URL Check", h2_style))
    story.append(Paragraph("In <code>ui/src/config/api.ts</code>, the frontend automatically resolves the production backend URL using <code>window.location.origin</code> when deployed on a web server. If deploying the backend on a different domain or subdomain, set <code>VITE_API_URL=https://api.yourdomain.com</code> in <code>ui/.env.production</code> before building.", body_style))

    story.append(Paragraph("Step 4.2: Execute Vite Production Build", h2_style))
    build_cmd = "cd ui\nnpm run build"
    b_table = Table([[Paragraph(build_cmd.replace('\n', '<br/>'), code_style)]], colWidths=[530])
    b_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), code_bg),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#333333'))
    ]))
    story.append(b_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Step 4.3: Upload Build Assets", h2_style))
    story.append(Paragraph("Upload the entire compiled contents of the <code>ui/dist/</code> directory (including <code>index.html</code> and the <code>assets/</code> folder) to your server's public document root (e.g. <code>public_html/</code>).", body_style))

    story.append(Paragraph("Step 4.4: React Router SPA Rewrite (.htaccess)", h2_style))
    story.append(Paragraph("To ensure client-side routing works when users refresh pages like <code>/blog</code> or <code>/admin</code>, place this <code>.htaccess</code> file in <code>public_html/</code>:", body_style))

    spa_htaccess = """# SPA Client-Side Routing Rewrite Rules
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>"""

    spa_table = Table([[Paragraph(spa_htaccess.replace('\n', '<br/>'), code_style)]], colWidths=[530])
    spa_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), code_bg),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#333333'))
    ]))
    story.append(spa_table)
    story.append(Spacer(1, 14))

    # SECTION 5
    story.append(Paragraph("5. Directory Permissions & File Structure", h1_style))
    story.append(Paragraph("Target production web server directory layout:", body_style))

    dir_structure = """public_html/
├── index.html                 (From ui/dist)
├── assets/                    (From ui/dist - JS, CSS, fonts)
├── api/                       (From backend-php/api)
│   ├── index.php              (Router entry point)
│   ├── config.php             (Configuration credentials)
│   ├── helpers/               (mail.php, auth.php, db.php, etc.)
│   ├── routes/                (blogs.php, news.php, contact.php, etc.)
│   └── .htaccess              (API URL rewrite rules)
└── uploads/                   (Uploaded images folder)
    ├── blog/
    ├── gallery/
    ├── news/
    ├── timeline/
    └── .htaccess              (Security script blocking)"""

    dir_table = Table([[Paragraph(dir_structure.replace('\n', '<br/>'), code_style)]], colWidths=[530])
    dir_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), code_bg),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#333333'))
    ]))
    story.append(dir_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Set correct Unix permissions across directories and files:", body_style))
    story.append(Paragraph("• Standard Directories: <code>755 (drwxr-xr-x)</code>", bullet_style))
    story.append(Paragraph("• Uploads Directory (<code>public_html/uploads/</code>): <code>755</code> or <code>775</code> (Must be writable by web server user)", bullet_style))
    story.append(Paragraph("• Standard Files (<code>.php</code>, <code>.html</code>, <code>.css</code>, <code>.js</code>): <code>644 (-rw-r--r--)</code>", bullet_style))

    story.append(Spacer(1, 14))

    # SECTION 6
    story.append(Paragraph("6. Critical Security Hardening", h1_style))
    
    sec_items = [
        "<b>Delete <code>setup.php</code>:</b> IMMEDIATELY delete <code>backend-php/setup.php</code> from the web server after initial database schema import. Leaving this file exposed allows unauthorized database resets.",
        "<b>Upload Folder Execution Protection:</b> Ensure <code>uploads/.htaccess</code> exists with script execution disabled:<br/><code>Options -Indexes -ExecCGI<br/>&lt;FilesMatch \"\\.(php|phtml|php3|php4|php5|phps|pl|py|cgi|sh|bash)$\"&gt;<br/>&nbsp;&nbsp;Order Allow,Deny<br/>&nbsp;&nbsp;Deny from all<br/>&lt;/FilesMatch&gt;</code>",
        "<b>HTTPS Enforcement:</b> Force SSL/TLS across all HTTP requests by placing HTTPS redirect rules in root <code>.htaccess</code>.",
        "<b>Hide Sensitive Files:</b> Ensure <code>.git</code>, <code>.env</code>, and database backup files are not accessible via web URLs."
    ]
    for item in sec_items:
        story.append(Paragraph(f"✔ {item}", bullet_style))

    story.append(Spacer(1, 14))

    # SECTION 7
    story.append(Paragraph("7. Post-Deployment Verification & QA Checklist", h1_style))

    qa_data = [
        ["Test Item", "Expected Outcome", "Verification Method"],
        ["Admin Login", "Returns Bearer JWT Token", "Log into /#/admin using credentials"],
        ["Protected API", "HTTP 401 on unauthorized access", "Visit /api/admin/subscribers in browser directly"],
        ["Blog / News Creation", "Item publishes & broadcasts email", "Create item with 'Send Email Notification' checked"],
        ["Contact Form", "Message arrives in admin inbox", "Submit form on /#contact section"],
        ["Email Reply", "Recipient gets formatted HTML reply", "Reply to message from Admin Inbox"],
        ["Visitor Profile", "Deduplicates existing emails", "Submit visitor modal with matching email"],
        ["Unsubscribe Link", "Updates status to 'unsubscribed'", "Click unsubscribe link in notification email footer"],
        ["Image Uploads", "Resized via GD & stored in /uploads", "Upload banner photo on blog post creation"]
    ]

    qa_tbl = Table(qa_data, colWidths=[120, 230, 180])
    qa_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('FONTSIZE', (0,1), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(qa_tbl)
    story.append(Spacer(1, 14))

    # SECTION 8
    story.append(Paragraph("8. Troubleshooting & Common Fixes", h1_style))

    trouble_items = [
        ("404 Not Found on API Endpoints", "Ensure <code>mod_rewrite</code> is enabled on Apache and <code>api/.htaccess</code> exists with correct RewriteRule."),
        ("500 Internal Server Error", "Check <code>php_stderr.log</code>. Verify database user credentials in <code>api/config.php</code> and check PHP GD extension."),
        ("CORS Policy Error in Browser", "Verify <code>CORS_ORIGINS</code> in <code>api/config.php</code> contains your exact frontend origin (e.g. <code>https://yourdomain.com</code>)."),
        ("Emails Not Arriving", "Verify <code>SMTP_USER</code> and <code>SMTP_PASS</code> in <code>config.php</code>. If using cPanel, ensure <code>mail()</code> function is enabled.")
    ]

    for title, desc in trouble_items:
        story.append(Paragraph(f"<b>• {title}:</b> {desc}", bullet_style))

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceBefore=10, spaceAfter=10))
    story.append(Paragraph("Rakeshwar Pandey Portfolio & CMS — Official Production Deployment Guide", ParagraphStyle('FooterText', fontName='Helvetica', fontSize=8, leading=10, textColor=colors.HexColor('#94A3B8'), alignment=TA_CENTER)))

    doc.build(story)
    print(f"PDF successfully created at: {filename}")

if __name__ == '__main__':
    target_path = sys.argv[1] if len(sys.argv) > 1 else 'Production_Deployment_Guide.pdf'
    create_deployment_guide_pdf(target_path)
