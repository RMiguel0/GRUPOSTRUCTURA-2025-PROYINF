# Dockerfile de desarrollo simple para backend (hot-reload con nodemon).
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npx","nodemon","src/index.js"]
