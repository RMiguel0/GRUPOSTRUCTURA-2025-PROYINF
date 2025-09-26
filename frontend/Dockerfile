# Dockerfile de desarrollo para frontend (Vite dev server).
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Si el bind mount tapa node_modules, instalamos antes de dev:
CMD sh -c "npm install && npm run dev -- --host 0.0.0.0"
