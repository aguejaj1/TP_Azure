FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 5002

ENV PORT=5002 \
    NODE_ENV=production \
    AUTH_SERVICE_URL=http://auth-service:5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5002/api/bookings/health || exit 1

CMD ["node", "src/index.js"]
