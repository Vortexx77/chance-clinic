# Frontend/Backend Separation Guide
## CHANSE CLINIC - Deploy Frontend on Hostinger, Backend on Clinic Server

This guide explains how to separate your CHANSE CLINIC website into:
- **Frontend**: Hosted on Hostinger (or any web hosting)
- **Backend**: Hosted on your clinic server

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTPS API Calls    ┌─────────────────┐
│   HOSTINGER     │ ─────────────────────► │  CLINIC SERVER   │
│  (Frontend)     │                        │   (Backend)     │
│                 │                        │                 │
│ • HTML/CSS/JS  │                        │ • PHP Files     │
│ • Images        │                        │ • Database      │
│ • Static Files  │                        │ • Admin Panel   │
└─────────────────┘                        └─────────────────┘
```

---

## 📋 Prerequisites

### 1. Domain Setup
- **Frontend Domain**: `chanseclinic.com` (on Hostinger)
- **Backend Domain**: `your-clinic-server.com` (your clinic server)

### 2. SSL Certificates
- Both domains must have valid SSL certificates
- HTTPS is required for production

### 3. Server Requirements
- **Clinic Server**: PHP 7.4+, MySQL 5.7+, Apache/Nginx
- **Hostinger**: Any shared hosting plan with PHP support

---

## 🚀 Step 1: Configure Clinic Server (Backend)

### 1.1 Update Environment Configuration
Edit `backend/config/environment.php`:

```php
// Change these values to your actual server
$isClinicServer = ($_SERVER['HTTP_HOST'] ?? '') === 'your-clinic-server.com';

// Update URLs
define('FRONTEND_URL', 'https://chanseclinic.com/');
define('BACKEND_URL', 'https://your-clinic-server.com/backend/');
define('ALLOWED_ORIGINS', ['https://chanseclinic.com', 'https://www.chanseclinic.com']);
```

### 1.2 Update Production Database
Edit `backend/config/database.production.php`:

```php
// Database settings
define('PROD_DB_HOST', 'localhost');
define('PROD_DB_NAME', 'chanse_clinic_prod');
define('PROD_DB_USER', 'chanse_clinic_user');
define('PROD_DB_PASS', 'YOUR_STRONG_PASSWORD_HERE');

// Security secrets
define('PROD_CSRF_SECRET', 'YOUR_PRODUCTION_CSRF_SECRET_HERE');
define('PROD_SESSION_SECRET', 'YOUR_PRODUCTION_SESSION_SECRET_HERE');

// SendGrid API key
define('PROD_SENDGRID_API_KEY', 'YOUR_PRODUCTION_SENDGRID_API_KEY');
```

### 1.3 Update Route Files
Modify all route files to include CORS middleware. Add this at the top of each route file:

```php
<?php
// Include CORS middleware
require_once __DIR__ . '/../middleware/CORS.php';

// Rest of your existing code...
```

### 1.4 Database Setup on Clinic Server
```sql
-- Create production database
CREATE DATABASE chanse_clinic_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create dedicated user
CREATE USER 'chanse_clinic_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON chanse_clinic_prod.* TO 'chanse_clinic_user'@'localhost';
FLUSH PRIVILEGES;

-- Import your database structure
mysql -u chanse_clinic_user -p chanse_clinic_prod < database-setup.sql
```

---

## 🌐 Step 2: Configure Hostinger (Frontend)

### 2.1 Upload Frontend Files
Upload these files to your Hostinger hosting:
- `index.html`
- `about.html`
- `contact.html`
- `services.html`
- `doctors.html`
- `img/` folder
- `frontend-config.js`

### 2.2 Update Frontend Configuration
Edit `frontend-config.js` on Hostinger:

```javascript
// Change these URLs to your actual servers
BACKEND_URL: {
    local: 'http://localhost/chanse-clinic/backend/',
    production: 'https://your-clinic-server.com/backend/', // YOUR CLINIC SERVER
    clinic: 'https://your-clinic-server.com/backend/' // YOUR CLINIC SERVER
},

FRONTEND_URL: {
    local: 'http://localhost/chanse-clinic/',
    production: 'https://chanseclinic.com/', // YOUR DOMAIN
    clinic: 'https://chanseclinic.com/' // YOUR DOMAIN
},

CLINIC_INFO: {
    name: 'CHANSE PHYSICIAN & CHILDREN\'S CLINIC',
    phone: '+256 XXX XXX XXX', // REAL PHONE
    email: 'info@chanseclinic.com', // REAL EMAIL
    address: 'Namulanda, Entebbe, Uganda',
    website: 'https://chanseclinic.com' // YOUR DOMAIN
}
```

### 2.3 Update HTML Files
In each HTML file, replace the old fetch calls with the new configuration:

**Before:**
```javascript
fetch('backend/routes/contact.php', {
    // ... options
})
```

**After:**
```javascript
// Include the config file first
<script src="frontend-config.js"></script>

// Then use the enhanced fetch
enhancedFetch('contact', {
    method: 'POST',
    body: JSON.stringify(formData)
})
```

---

## 🔒 Step 3: Security Configuration

### 3.1 CORS Settings
The CORS middleware automatically handles:
- Origin validation
- Preflight requests
- Security headers
- Access logging

### 3.2 Rate Limiting
Configure in `frontend-config.js`:
```javascript
SECURITY: {
    enableCSRF: true,
    enableRateLimiting: true,
    maxRequestsPerMinute: 10
}
```

### 3.3 SSL/TLS
- Both servers must use HTTPS
- Configure HSTS headers
- Use secure cookies

---

## 📁 Step 4: File Structure After Deployment

### Hostinger (Frontend)
```
public_html/
├── index.html
├── about.html
├── contact.html
├── services.html
├── doctors.html
├── frontend-config.js
├── img/
│   ├── logo2.png
│   └── done/
└── .htaccess
```

### Clinic Server (Backend)
```
/var/www/html/chanse-clinic/
├── backend/
│   ├── config/
│   │   ├── environment.php
│   │   ├── database.production.php
│   │   └── email-sendgrid.php
│   ├── middleware/
│   │   └── CORS.php
│   ├── routes/
│   │   ├── contact.php
│   │   ├── appointment.php
│   │   └── newsletter.php
│   ├── admin/
│   └── logs/
└── database/
```

---

## 🧪 Step 5: Testing

### 5.1 Test Frontend
1. Visit `https://chanseclinic.com`
2. Check browser console for errors
3. Test contact form submission
4. Verify appointment booking

### 5.2 Test Backend
1. Test API endpoints directly
2. Check CORS headers
3. Verify database connections
4. Test admin panel access

### 5.3 Test Security
1. Verify HTTPS redirects
2. Check CORS origin validation
3. Test rate limiting
4. Verify CSRF protection

---

## 🔧 Troubleshooting

### Common Issues

#### 1. CORS Errors
```
Access to fetch at 'https://your-clinic-server.com/backend/routes/contact.php' 
from origin 'https://chanseclinic.com' has been blocked by CORS policy
```

**Solution**: Check `ALLOWED_ORIGINS` in `environment.php`

#### 2. Database Connection Failed
**Solution**: Verify database credentials and network access

#### 3. SSL Certificate Issues
**Solution**: Ensure both domains have valid SSL certificates

#### 4. API Timeout
**Solution**: Check server response times and increase timeout in `frontend-config.js`

---

## 📊 Monitoring & Maintenance

### 1. Log Files
Monitor these files on your clinic server:
- `backend/logs/access.log` - API access logs
- `backend/logs/error.log` - Error logs
- `backend/logs/security.log` - Security violations

### 2. Database Backups
Set up automatic database backups:
```bash
# Daily backup script
mysqldump -u chanse_clinic_user -p chanse_clinic_prod > backup_$(date +%Y%m%d).sql
```

### 3. SSL Certificate Renewal
Set reminders for SSL certificate renewal dates

---

## 🚨 Security Checklist

- [ ] HTTPS enabled on both servers
- [ ] CORS origins properly configured
- [ ] Database user has minimal privileges
- [ ] Strong passwords for all accounts
- [ ] Regular security updates
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] CSRF protection active
- [ ] Input validation implemented
- [ ] Error logging enabled

---

## 📞 Support

If you encounter issues:
1. Check the log files first
2. Verify configuration values
3. Test API endpoints directly
4. Check browser console for errors
5. Verify server connectivity

---

## 🎯 Benefits of This Setup

1. **Security**: Patient data stays on clinic server
2. **Performance**: Static files served from CDN
3. **Reliability**: Professional hosting for frontend
4. **Control**: Full control over backend and database
5. **Scalability**: Easy to scale either component independently
6. **Compliance**: Better HIPAA compliance (if applicable)

---

**Remember**: Always test thoroughly in a staging environment before deploying to production!
