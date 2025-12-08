FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (including devDependencies for tsx)
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Expose port
EXPOSE 8080

# Start the server using local tsx
CMD ["npx", "tsx", "server/index.ts"]
