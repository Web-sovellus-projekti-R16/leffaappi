# --- Build Stage ---
FROM node:20 AS build
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Production Stage ---
FROM nginx:stable
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for Render
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]