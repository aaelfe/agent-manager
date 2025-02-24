FROM node:20

WORKDIR /app

COPY package*.json ./

# Pre-install ARM64 specific dependencies
RUN npm install @rollup/rollup-linux-arm64-gnu && \
    npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]