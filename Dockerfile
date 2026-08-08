FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p images output uploads data

EXPOSE 3015

CMD ["node", "server.js"]
