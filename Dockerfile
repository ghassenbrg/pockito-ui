# ---- Build stage ----
    FROM node:20-alpine AS build

    WORKDIR /app
    
    # Install Angular CLI globally if you’re building an Angular app
    # (safe even if your project isn’t Angular; remove if you prefer local CLI)
    RUN npm i -g @angular/cli@17.3.0
    
    # Install dependencies first (better layer caching)
    COPY package*.json ./
    RUN npm ci --prefer-offline --no-audit --no-fund
    
    # Copy the rest of the sources
    COPY . .
    
    # Build the app
    # For Angular, your package.json should have: "build": "ng build --configuration production"
    # For React/Vite/etc, keep "npm run build" as-is.
    ARG BUILD_CMD="npm run build"
    RUN /bin/sh -c "$BUILD_CMD"
    
    # Angular 17+ outputs to: dist/<project-name>/browser by default.
    # If your app builds elsewhere, override this at build time:
    #   --build-arg DIST_DIR=dist
    ARG DIST_DIR="dist/*/browser"
    
    
    # ---- Runtime stage ----
    FROM nginx:alpine
    
    # Clean the default site to avoid conflicts
    RUN rm -f /etc/nginx/conf.d/default.conf
    
    # Copy your MAIN nginx.conf (must contain 'events {}' / 'http {}' etc.)
    # Make sure this file defines the server and a /health location.
    COPY nginx.conf /etc/nginx/nginx.conf
    
    # Static assets
    # If your DIST_DIR is a glob (like dist/*/browser), keep the same ARG and copy with shell expansion.
    ARG DIST_DIR
    COPY --from=build /app/${DIST_DIR} /usr/share/nginx/html/
    
    # Optional: small healthcheck that relies on /health location in your nginx.conf
    HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD wget -qO- http://127.0.0.1/health || exit 1
    
    EXPOSE 80
    
    # Default command (nginx base image already sets this, but kept explicit)
    CMD ["nginx", "-g", "daemon off;"]
    