# -------- Build stage --------
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # Install deps (include dev deps so Angular CLI & tools are available)
    COPY package*.json ./
    RUN npm ci
    
    # Copy sources and build
    COPY . .
    RUN npm run build -- --configuration=production --output-path=dist
    
    # -------- Runtime stage --------
    FROM nginx:1.27-alpine
    
    # SPA routing config
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Copy compiled app
    COPY --from=builder /app/dist/ /usr/share/nginx/html/
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    