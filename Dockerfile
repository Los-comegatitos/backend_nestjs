# Etapa 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copiamos solo lo necesario para instalar dependencias
COPY package*.json ./

# Instalamos solo dependencias de producción
RUN npm install --omit=dev

# Copiamos el resto del código
COPY . .

# Compilamos el proyecto
RUN npm run build:prod

# Etapa 2: Producción
FROM node:20-slim

WORKDIR /app

# Copiamos solo lo necesario desde la etapa de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Exponemos el puerto que Render usará
EXPOSE 10000

# Iniciamos la app
CMD ["node", "dist/main"]