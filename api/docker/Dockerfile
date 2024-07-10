FROM node:lts-bookworm-slim
WORKDIR /app
COPY ./src/package.json ./
RUN npm install
COPY ./src ./
