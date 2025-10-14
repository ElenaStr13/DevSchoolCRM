# 1. Білд React
FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Сервер Nginx
FROM nginx:alpine

# Копіюємо білд у папку nginx
COPY --from=build /app/build /usr/share/nginx/html

# Копіюємо кастомний конфіг nginx
COPY ../nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
