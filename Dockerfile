FROM node:18

WORKDIR /app

COPY Back_End/package*.json ./

# Installer les dépendances dans l'image Docker
RUN npm install

# Copier le reste du code
COPY Back_End/ .

RUN npx prisma generate
RUN npx prisma db push

EXPOSE 8000

CMD ["node", "index.js"]
