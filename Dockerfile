FROM apify/actor-node-playwright:20

# Set working directory with correct permissions
WORKDIR /usr/src/app
RUN mkdir -p /usr/src/app/node_modules && chown -R node:node /usr/src/app

# Switch to non-root user
USER node

# Copy package files
COPY --chown=node:node package.json .

# Install dependencies
RUN npm install --omit=dev --no-package-lock --no-audit --no-fund

# Copy application files
COPY --chown=node:node . .

CMD ["npm", "start"]