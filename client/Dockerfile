# client/Dockerfile
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# pass in VITE_API_URL from docker-compose
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# optional: production stage with nginx or serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]