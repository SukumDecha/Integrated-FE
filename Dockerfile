# Build stage
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build:uat

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# COPY --from=build /app/dist /app/build
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
