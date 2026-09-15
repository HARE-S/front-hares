# Build: compila el bundle estático con Node.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve: imagen nginx con el bundle en /usr/share/nginx/html.
FROM nginx:1.27-alpine
# Para cambiar a dhi.io: sustituir la línea anterior por
#   FROM dhi.io/nginx:1.31.5-alpine3.24-fips
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80