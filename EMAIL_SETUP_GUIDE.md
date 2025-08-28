# 📧 Email Configuration Setup Guide

## Quick Setup for Gmail (Recommended for Testing)

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security"
3. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. In Google Account settings, go to "Security"
2. Find "App passwords" (under 2-Step Verification)
3. Select "Mail" and "Other (Custom name)"
4. Enter "CHANSE CLINIC" as the name
5. Click "Generate"
6. **Copy the 16-character app password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update Email Configuration
Edit the file: `backend/config/email.php`

Replace these lines:
```php
if (!defined('SMTP_USERNAME')) define('SMTP_USERNAME', 'your-email@gmail.com');
if (!defined('SMTP_PASSWORD')) define('SMTP_PASSWORD', 'your-app-password');
```

With your actual Gmail credentials:
```php
if (!defined('SMTP_USERNAME')) define('SMTP_USERNAME', 'yourname@gmail.com');
if (!defined('SMTP_PASSWORD')) define('SMTP_PASSWORD', 'abcd efgh ijkl mnop');
```

### Step 4: Test Email Configuration
1. Go to the admin panel
2. Click "Test Email" button
3. Enter your email address
4. Click "Send Test Email"

## Alternative Email Providers

### Outlook/Hotmail
```php
if (!defined('SMTP_HOST')) define('SMTP_HOST', 'smtp-mail.outlook.com');
if (!defined('SMTP_PORT')) define('SMTP_PORT', 587);
if (!defined('SMTP_SECURE')) define('SMTP_SECURE', 'tls');
if (!defined('SMTP_USERNAME')) define('SMTP_USERNAME', 'your-email@outlook.com');
if (!defined('SMTP_PASSWORD')) define('SMTP_PASSWORD', 'your-password');
```

### Yahoo Mail
```php
if (!defined('SMTP_HOST')) define('SMTP_HOST', 'smtp.mail.yahoo.com');
if (!defined('SMTP_PORT')) define('SMTP_PORT', 587);
if (!defined('SMTP_SECURE')) define('SMTP_SECURE', 'tls');
if (!defined('SMTP_USERNAME')) define('SMTP_USERNAME', 'your-email@yahoo.com');
if (!defined('SMTP_PASSWORD')) define('SMTP_PASSWORD', 'your-app-password');
```

### Custom Domain (cPanel)
```php
if (!defined('SMTP_HOST')) define('SMTP_HOST', 'mail.yourdomain.com');
if (!defined('SMTP_PORT')) define('SMTP_PORT', 587);
if (!defined('SMTP_SECURE')) define('SMTP_SECURE', 'tls');
if (!defined('SMTP_USERNAME')) define('SMTP_USERNAME', 'noreply@yourdomain.com');
if (!defined('SMTP_PASSWORD')) define('SMTP_PASSWORD', 'your-email-password');
```

## Troubleshooting

### Common Errors:

**"SMTP Error: Could not authenticate"**
- Check your username and password
- For Gmail: Make sure you're using an app password, not your regular password
- Ensure 2FA is enabled on Gmail

**"Connection timed out"**
- Check your internet connection
- Verify the SMTP host and port are correct
- Some networks block SMTP ports

**"Authentication failed"**
- Double-check your credentials
- For Gmail: Regenerate the app password
- Make sure there are no extra spaces in the password

### Security Notes:
- Never commit real email passwords to version control
- Use app passwords instead of regular passwords when possible
- Consider using environment variables for production

## Testing Your Configuration

After updating the settings:
1. Go to the admin panel
2. Click "Test Email" in the header
3. Enter your email address
4. Click "Send Test Email"
5. Check your inbox for the test email

If successful, you'll see: "Test email sent successfully! Please check your inbox."

## Next Steps

Once email is working:
1. Test appointment notifications by updating appointment status
2. Test newsletter campaigns by sending to subscribers
3. All email features will now work automatically 