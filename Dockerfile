# Use an Apify base image, which comes with Node.js and other tools pre-installed
FROM apify/actor-node:latest

# Define a working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

RUN npx playwright install --with-deps chromium

# Install dependencies
RUN npm install --only=production

# Copy the rest of the actor's source code
COPY . ./

# Optional: Specify the command to run when the actor starts
# If not specified, Apify's base image provides a default CMD instruction
# CMD ["node", "main.js"]