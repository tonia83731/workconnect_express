FROM node:18-alpine AS builder

WORKDIR /user/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


FROM node:18-alpine AS runner

WORKDIR /user/src/app

COPY --from=builder /user/src/app/dist ./dist
COPY --from=builder /user/src/app/package*.json ./

RUN npm install --omit=dev

EXPOSE 8080

CMD ["node", "dist/server.prod.js"]