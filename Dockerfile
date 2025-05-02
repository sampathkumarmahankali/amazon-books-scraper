FROM apify/actor-node-playwright:20

# Windows-compatible setup
WORKDIR /usr/src/app

# Reset permissions (Windows workaround)
RUN chmod 777 /usr/src/app

# Copy only package.json first
COPY package.json .

# Clean install without lockfile
RUN npm install --omit=dev --package-lock=false

# Copy remaining files
COPY . .

CMD ["npm", "start"]