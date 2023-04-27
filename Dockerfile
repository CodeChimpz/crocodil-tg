FROM node:latest
WORKDIR app

COPY package*.json ./

RUN npm i
#RUN npm i -g typescript ts-node nodemon

ENV PG_CONNECTION_URL='postgresql://postgres:default@db:5432/bot_startup'

COPY . .
RUN npm run build