FROM node:18

WORKDIR /app
COPY Back_End/ .

RUN npm install
RUN npx prisma generate

EXPOSE 8000

CMD ["node", "Back_End/index.js"]
