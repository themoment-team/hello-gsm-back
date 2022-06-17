FROM node:16.15.1-alpine

WORKDIR /app

COPY ./package.json ./yarn.lock ./

RUN yarn

RUN yarn global add prisma

COPY ./apps/client ./apps/client

COPY .env tsconfig.build.json tsconfig.json nest-cli.json task-definition.json ./

COPY ./prisma ./prisma

RUN prisma db pull

RUN prisma generate

RUN yarn build

CMD ["yarn", "start:prod"]
