# Stage 1: Build the application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Set build arguments for Vite environment variables
ARG VITE_AI_API_KEY
ARG VITE_AI_BASE_URL
ARG VITE_AI_MODEL_ID

# Set them as environment variables so npm run build can see them
ENV VITE_AI_API_KEY=$VITE_AI_API_KEY
ENV VITE_AI_BASE_URL=$VITE_AI_BASE_URL
ENV VITE_AI_MODEL_ID=$VITE_AI_MODEL_ID

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the build output from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Add a basic Nginx configuration to support SPA routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
