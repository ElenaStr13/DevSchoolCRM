FROM node:20-alpine

LABEL maintainer = 'Dev For School'

RUN mkdir /app
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]