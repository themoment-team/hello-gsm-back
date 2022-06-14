FROM node:16.14.2-alpine

WORKDIR /app

COPY ./package.json ./yarn.lock ./

RUN yarn

RUN yarn global add prisma

COPY ./src ./src

COPY ./test ./test

COPY .env tsconfig.build.json tsconfig.json nest-cli.json ./

COPY ./prisma ./prisma

RUN prisma db pull

RUN prisma generate

RUN yarn build

CMD ["yarn", "start:prod"]
