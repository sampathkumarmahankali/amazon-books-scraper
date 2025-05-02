FROM apify/actor-node-playwright:18

# Create non-root user
RUN useradd -m appuser
WORKDIR /usr/src/app

# Copy files with proper ownership
COPY --chown=appuser:appuser package*.json ./

# Install dependencies as non-root
USER appuser
RUN npm install --production

# Copy remaining files
COPY --chown=appuser:appuser . .

CMD ["npm", "start"]