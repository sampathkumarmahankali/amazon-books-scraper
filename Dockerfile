# Use official Apify image with Node.js 20 and Playwright pre-installed
FROM apify/actor-node-playwright:20

# Set working directory
WORKDIR /usr/src/app

# Install any additional required dependencies (Alpine Linux packages)
RUN apk add --no-cache \
    libstdc++ \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm install --omit=dev

# Copy all source files
COPY . .

# Set up non-root user for security
RUN chown -R node:node /usr/src/app
USER node

# Run the application
CMD ["npm", "start"]