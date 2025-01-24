FROM node:20

RUN npm install -g pnpm

WORKDIR /home/docker/scraper

ADD package.json .

RUN pnpm i

ADD . .

RUN pnpm build

CMD [ "pnpm", "start" ]

