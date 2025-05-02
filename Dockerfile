FROM apify/actor-node-playwright:20

# Set working directory
WORKDIR /usr/src/app

# Copy package files first
COPY package.json .

# Install dependencies as root (temporary)
RUN npm install --omit=dev --no-package-lock --no-audit --no-fund

# Fix permissions (Windows-safe method)
RUN chmod -R 777 /usr/src/app/node_modules

# Copy application files
COPY . .

# Switch to non-root user (1001 is standard non-root user in Apify images)
USER 1001

CMD ["npm", "start"]