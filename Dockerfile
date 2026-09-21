# Build the static app, then serve it with nginx (which also proxies /api to the backend).
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# npm can exit 0 after crashing mid-install; fail here rather than at a confusing 'tsc: not found'.
RUN npm ci && test -x node_modules/.bin/tsc
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
ENV API_UPSTREAM=http://backend:8000
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
