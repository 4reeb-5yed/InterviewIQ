# [stub] The frontend deploys via Vercel; this is a placeholder for optional
# containerized static builds. It is NOT used by docker-compose (the frontend
# runs locally via Vite: `cd client && npm run dev`).
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
# Serve dist/ with any static host (placeholder only).
