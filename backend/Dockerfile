# Dockerfile de desarrollo simple para backend (hot-reload con nodemon).
FROM node:20-alpine
WORKDIR /usr/src/app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/ \
 && npm install
COPY . .
EXPOSE 3000
CMD ["npx","nodemon","src/index.js"]
