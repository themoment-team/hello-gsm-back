FROM node:16.14.2-alpine

WORKDIR /app

COPY ./package.json ./package-lock.json ./

RUN npm i

RUN npm i -g prisma

COPY ./src ./src

COPY ./test ./test

COPY .env tsconfig.build.json tsconfig.json nest-cli.json ./

COPY ./prisma ./prisma

RUN prisma db pull

RUN prisma generate

RUN npm run build

CMD ["npm", "run", "start:prod"]
