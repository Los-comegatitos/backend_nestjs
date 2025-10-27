# Imagen base ligera
FROM node:22-slim

# Carpeta de trabajo
WORKDIR /app

# Copia solo lo necesario para instalar dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copia el resto del código y compila
COPY . .
RUN npm run build

# Expón el puerto que usará Render
EXPOSE 10000

# Arranca la app
CMD ["node", "dist/main"]