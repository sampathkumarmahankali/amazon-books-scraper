# Use Apify's pre-configured Node.js + Playwright image
FROM apify/actor-node-playwright:20

# Set working directory inside container
WORKDIR /usr/src/app

# First copy package files to cache dependencies
COPY package.json package-lock.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy all source files
COPY . ./

# Run the actor
CMD ["npm", "start"]