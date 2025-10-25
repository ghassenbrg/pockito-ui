# SSL Development Setup

This folder contains SSL certificates for local development with HTTPS support.

## 🚫 Important Security Notice

**DO NOT COMMIT THESE FILES TO GIT!**

The files in this folder are:
- Private SSL certificates and keys
- Machine-specific development certificates
- Already added to `.gitignore`

## 🔧 Setup Instructions

### Prerequisites
- Windows, macOS, or Linux
- Internet connection for downloading mkcert

### One-Time Setup

1. **Download mkcert** (if not already done):
   ```bash
   # Windows (PowerShell)
   Invoke-WebRequest -Uri "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-windows-amd64.exe" -OutFile "mkcert.exe"
   
   # macOS
   brew install mkcert
   
   # Linux
   # Follow instructions at: https://github.com/FiloSottile/mkcert#installation
   ```

2. **Install the local CA**:
   ```bash
   ./mkcert.exe -install
   ```

3. **Generate certificates for your development domains**:
   ```bash
   ./mkcert.exe localhost 192.168.178.123 127.0.0.1
   ```

4. **Move certificates to ssl folder**:
   ```bash
   # Windows
   move localhost+2.pem ssl\cert.pem
   move localhost+2-key.pem ssl\key.pem
   
   # macOS/Linux
   mv localhost+2.pem ssl/cert.pem
   mv localhost+2-key.pem ssl/key.pem
   ```

5. **Clean up temporary files**:
   ```bash
   del mkcert.exe
   ```

## 🎯 What This Achieves

- ✅ **No "Not Secure" warnings** in browsers
- ✅ **Valid SSL certificates** (green lock icon)
- ✅ **Works with Keycloak authentication**
- ✅ **Production-like development environment**
- ✅ **Valid for 3 years** (until 2028)

## 🌐 Access Your App

After setup, access your application at:
- `https://192.168.178.123:4200/` - No security warnings!
- `https://localhost:4200/` - Also works perfectly

## 🔄 For Team Members

Each developer needs to run the setup once on their machine. The certificates are:
- **Machine-specific**: Generated for each developer's local environment
- **Secure**: Private keys never leave the local machine
- **Trusted**: Browsers automatically trust the certificates

## 🛠️ Troubleshooting

### Certificate not trusted?
- Make sure you ran `mkcert -install` to install the CA
- Restart your browser after installing the CA
- Check that certificates are in the correct location

### Angular dev server not using certificates?
- Verify `angular.json` has the correct SSL configuration:
  ```json
  "ssl": true,
  "sslKey": "ssl/key.pem",
  "sslCert": "ssl/cert.pem"
  ```

### Still getting "Not Secure" warnings?
- Clear browser cache and restart browser
- Check that the certificate files exist in the ssl folder
- Verify the certificate includes your IP address

## 📁 File Structure

```
ssl/
├── README.md          # This file
├── cert.pem           # SSL certificate (DO NOT COMMIT)
└── key.pem            # Private key (DO NOT COMMIT)
```

## 🔒 Security Best Practices

- **Never commit** SSL certificates or private keys to version control
- **Regenerate certificates** if compromised
- **Use different certificates** for different environments
- **Keep private keys secure** on your local machine only

---

**Need help?** Check the [mkcert documentation](https://github.com/FiloSottile/mkcert) or ask the development team.
