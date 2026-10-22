# ---- Giai đoạn 1: build React ----
FROM node:20-alpine AS build
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

# Client ID của Google và App ID của Facebook không bí mật, được nhúng vào mã JavaScript lúc build
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_FACEBOOK_APP_ID=""
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID} \
    VITE_FACEBOOK_APP_ID=${VITE_FACEBOOK_APP_ID} \
    VITE_BASE_URL=/

RUN npm run build

# ---- Giai đoạn 2: Caddy phục vụ web, chuyển tiếp API và giữ HTTPS ----
FROM caddy:2-alpine
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv/www