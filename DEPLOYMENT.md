# Deploying Deo Gratias Catalog

## Quick Start (Local)

```bash
npm install
cp .env.example .env
npm start
# → http://localhost:3015
```

Place jewelry images in `./images/`.

## Environment Variables

| Variable       | Default         | Description                     |
|----------------|-----------------|---------------------------------|
| `PORT`         | `3015`          | Server port                     |
| `IMAGES_DIR`   | `images`        | Image directory path            |

Create `.env` from the example:
```bash
cp .env.example .env
```

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
RUN mkdir -p images output data
EXPOSE 3015
CMD ["node", "server.js"]
```

```bash
docker build -t deo-gratias-catalog .
docker run -p 3015:3015 -v ./images:/app/images deo-gratias-catalog
```

## Railway / Render / Fly.io

1. Push to GitHub
2. Connect repo to your platform
3. Set environment variable: `PORT` (or let platform assign)
4. Deploy — no build command needed
5. Mount persistent storage for `./images` and `./data`

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

    location /images/ {
        proxy_pass http://localhost:3015/images/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

## Persistent Storage

Two directories must persist across deploys:

| Directory   | Contents                |
|-------------|-------------------------|
| `images/`   | User-uploaded jewelry   |
| `data/`     | `products.json` metadata|

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

## SSL / HTTPS

Use a reverse proxy (nginx, Caddy, or cloud provider) for TLS. The app itself serves HTTP.

## Monitoring

- Check `/api/images` for availability
- Monitor `./output/` disk usage (PDF cache)
- Watch `console.error` for PDF generation failures
