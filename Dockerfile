# ---- Build stage ----
    FROM node:20-alpine AS build

    WORKDIR /app
    
    # Angular CLI (safe to keep; remove if you only use local CLI)
    RUN npm i -g @angular/cli@17.3.0
    
    # Dependencies
    COPY package*.json ./
    RUN npm ci --prefer-offline --no-audit --no-fund
    
    # Source
    COPY . .
    
    # Build your app
    ARG BUILD_CMD="npm run build"
    RUN /bin/sh -c "$BUILD_CMD"
    
    # Angular output path can be overridden at build time:
    #   --build-arg DIST_DIR=dist/pockito-ui
    ARG DIST_DIR="dist/*/browser"
    
    # ---- Runtime stage ----
    FROM nginx:alpine
    
    # Remove default site & pages to avoid "Welcome to nginx!" bleeding through
    RUN rm -f /etc/nginx/conf.d/default.conf \
        && rm -f /usr/share/nginx/html/index.html /usr/share/nginx/html/50x.html || true
    
    # Use your main nginx.conf (must contain server {} and /health)
    COPY nginx.conf /etc/nginx/nginx.conf
    
    # IMPORTANT: copy the CONTENTS of DIST into the web root (note trailing slash)
    ARG DIST_DIR
    COPY --from=build /app/${DIST_DIR}/ /usr/share/nginx/html/
    
    # Healthcheck (IPv4 to avoid ::1 issues)
    HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD wget -qO- http://127.0.0.1/health || exit 1
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    