# Use official Apify image with Node.js 20
FROM apify/actor-node:20

# Set working directory
WORKDIR /usr/src/app

# Install system dependencies for Playwright
RUN apt-get update && \
    apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright and browsers
RUN npm install playwright@1.42.1 && \
    npx playwright install --with-deps chromium

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