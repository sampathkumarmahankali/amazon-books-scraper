FROM apify/actor-node-playwright:20

# Skip user creation (Windows workaround)
WORKDIR /usr/src/app

# Copy files
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install --omit=dev

# Copy app files
COPY . .

CMD ["npm", "start"]