# Deploying the Next.js Store to Ubuntu VPS

This guide provides step-by-step instructions to deploy the Next.js store on an Ubuntu VPS using PM2 and Nginx.

## 1. Prerequisites

- Ubuntu VPS (18.04 or newer)
- Node.js (18.x or newer)
- NPM or Yarn
- PM2
- Nginx
- Domain name pointed to your VPS IP

## 2. Server Setup

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install PM2
```bash
npm install -g pm2
```

### Install Nginx
```bash
sudo apt-get install -y nginx
```

## 3. Application Deployment

### Clone your repository
```bash
git clone https://github.com/your-repo/nextjs-store.git
cd nextjs-store
```

### Install dependencies and build the application
```bash
npm install
npm run build
```

### Set up environment variables
Create a `.env.local` file with your environment variables:
```bash
cp .example-env .env.local
nano .env.local
```

Fill in the required variables:
```
MONGODB_URI=your_mongodb_uri
AUTH_SECRET=your_auth_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
RESEND_API_KEY=your_resend_api_key
# Add other required variables
```

### Start the application with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 4. Nginx Configuration

### Create Nginx configuration
```bash
sudo nano /etc/nginx/sites-available/nextjs-store
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name store.spacesautomation.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
}
```

### Enable the site and restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/nextjs-store /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 5. SSL Configuration (Optional but Recommended)

### Install Certbot
```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

### Get SSL certificate
```bash
sudo certbot --nginx -d store.spacesautomation.com
```

## 6. Troubleshooting

### Check application logs
```bash
pm2 logs nextjs-store
```

### Check Nginx logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Restart the application
```bash
pm2 restart nextjs-store
```

### Check if the application is running
```bash
pm2 list
```

### Check if Nginx is working correctly
```bash
sudo systemctl status nginx
```

## 7. Updating the Application

When you need to update your application:

```bash
cd nextjs-store
git pull
npm install
npm run build
pm2 restart nextjs-store
``` 