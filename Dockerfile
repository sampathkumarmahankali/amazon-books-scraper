FROM apify/actor-node:latest

# Copy just package.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of your project
COPY . ./

# Optional: If you have any build steps, add them here
# For example, if you are using TypeScript:
# RUN npm run build

# Command to run when the container starts
CMD ["npm", "start"]