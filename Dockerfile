FROM apify/actor-node-playwright:20

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]