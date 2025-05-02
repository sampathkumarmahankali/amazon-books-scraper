FROM apify/actor-node-playwright:20

# Windows-compatible setup
WORKDIR /usr/src/app

# Copy only package.json first (Windows-safe)
COPY package.json .

# Install dependencies without lockfile
RUN npm install --omit=dev --no-package-lock --no-audit --no-fund

# Copy remaining files
COPY . .

CMD ["npm", "start"]