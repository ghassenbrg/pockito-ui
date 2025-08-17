# Multi-stage build for Angular application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Install wget for health checks
RUN apk add --no-cache wget

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist/pockito-ui/browser /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -g 1001 -S pockito && \
    adduser -u 1001 -S pockito -G pockito

# Change ownership of nginx directories
RUN chown -R pockito:pockito /var/cache/nginx && \
    chown -R pockito:pockito /var/log/nginx && \
    chown -R pockito:pockito /etc/nginx/conf.d && \
    chown -R pockito:pockito /usr/share/nginx/html

# Create nginx pid directory with proper permissions
RUN mkdir -p /run/nginx && \
    chown -R pockito:pockito /run/nginx

# Switch to non-root user
USER pockito

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
