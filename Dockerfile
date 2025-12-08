FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Install tsx globally for running the server
RUN npm install -g tsx

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Expose port
EXPOSE 8080

# Start the server
CMD ["tsx", "server/index.ts"]