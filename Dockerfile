# Use Node 20 as base image
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the frontend (Vite)
RUN npm run build

# --- Production Stage ---
FROM node:20-slim

WORKDIR /app

# Copy package files for installing only production dependencies
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production

# Install ts-node to run the server directly or build it. 
# For simplicity in this container, we can use ts-node or compile. 
# Let's install typescript/ts-node locally for runtime or pre-compile.
# Better approach: Compile server TS to JS in the builder stage or just run with ts-node/tsx.
# Given "type": "module" in package.json, usage of ts-node can be tricky without config.
# Let's use 'tsx' (a faster esbuild-based ts runner) or just 'ts-node'. 
# Adding 'ts-node' and 'typescript' to prod dependencies for simplicity here, 
# or we could build the server in the previous stage.
# Let's stick to installing necessary tools.
RUN npm install -g ts-node typescript

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy server source code
COPY --from=builder /app/server ./server

# Expose port
EXPOSE 3000

# Environment variables will be passed at runtime by Cloud Run
# ENV GEMINI_API_KEY=...

# Start the server
# We use ts-node to run the server file directly. 
# Since we are using ES modules, we need to ensure ts-node respects that.
CMD ["ts-node", "--transpile-only", "--esm", "server/index.ts"]
