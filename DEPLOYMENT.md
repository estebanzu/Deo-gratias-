# Deploying Deo Gratias Catalog

## Quick Start (Local)

```bash
npm install
cp .env.example .env
# Edit .env with your Cloudinary credentials
npm start
# → http://localhost:3015
```

## Environment Variables

| Variable                | Default  | Description                         |
| ----------------------- | -------- | ----------------------------------- |
| `PORT`                  | `3015`   | Server port                         |
| `IMAGES_DIR`            | `images` | Legacy image directory (unused)     |
| `CLOUDINARY_CLOUD_NAME` | —        | Cloudinary cloud name (required)    |
| `CLOUDINARY_API_KEY`    | —        | Cloudinary API key (required)       |
| `CLOUDINARY_API_SECRET` | —        | Cloudinary API secret (required)    |
| `CLOUDINARY_FOLDER`     | (empty)  | Cloudinary folder prefix (optional) |

Create `.env` from the example:

```bash
cp .env.example .env
```

## Cloudinary Setup

Images are hosted on **Cloudinary** instead of the local filesystem.

1. Sign up at https://cloudinary.com (free tier: 25GB storage)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add credentials to `.env`
4. Upload images via the Cloudinary Media Library or the app's upload button

## Production Build

No build step required — static files are served directly. For production:

```bash
NODE_ENV=production npm start
```

## Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p output data
EXPOSE 3015
CMD ["node", "server.js"]
```

```bash
docker build -t deo-gratias-catalog .
docker run -p 3015:3015 \
  -e CLOUDINARY_CLOUD_NAME=your_cloud_name \
  -e CLOUDINARY_API_KEY=your_api_key \
  -e CLOUDINARY_API_SECRET=your_api_secret \
  deo-gratias-catalog
```

## Railway / Render / Fly.io

1. Push to GitHub
2. Connect repo to your platform
3. Set environment variables:
   - `PORT` (or let platform assign)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Deploy — no build command needed
5. Only `data/` and `output/` need persistent storage (images are on Cloudinary)

## Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name catalog.example.com;

    location / {
        proxy_pass http://localhost:3015;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Persistent Storage

Only one directory must persist across deploys:

| Directory | Contents                 |
| --------- | ------------------------ |
| `data/`   | `products.json` metadata |

Images are hosted on Cloudinary — no local storage needed.

## Health Check

```bash
curl http://localhost:3015/api/images
# Returns { "images": [...], "total": N }
```

## PDF Generation

Requires Puppeteer (Chromium). On Linux Docker, add:

```dockerfile
RUN apk add --no-cache chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

PDF generation fetches images from Cloudinary URLs.

## SSL / HTTPS

Use a reverse proxy (nginx, Caddy, or cloud provider) for TLS. The app itself serves HTTP.

## Monitoring

- Check `/api/images` for availability
- Monitor `./output/` disk usage (PDF cache)
- Watch `console.error` for PDF generation failures
