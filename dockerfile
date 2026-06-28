# Stage 1: Build the frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies and build the frontend
# We copy package files first for better caching
COPY frontend/chat_app/package*.json ./chat_app/
WORKDIR /app/frontend/chat_app
RUN npm install
COPY frontend/chat_app/ ./

# Pass the Clerk publishable key at build time so Vite can embed it
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

RUN npm run build

# Stage 2: Build the backend and serve both
FROM node:22-alpine
WORKDIR /app/backend

# Copy backend package files and install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy the rest of the backend files
COPY backend/ ./

# Copy the built React app from the frontend builder stage
# We place it in a "public" folder inside the backend directory, 
# which our server.js is configured to serve statically.
COPY --from=frontend-builder /app/frontend/chat_app/dist ./public

# Expose the backend port
EXPOSE 5000

# Start the application
CMD ["node", "src/server.js"]
