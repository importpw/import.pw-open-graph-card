FROM mhart/alpine-node:10 as base
WORKDIR /usr/src
RUN apk add --no-cache \
  git \
  g++ \
  build-base \
  cairo-dev \
  jpeg-dev \
  librsvg-dev \
  pango-dev \
  freetype-dev \
  giflib-dev
COPY package.json .
RUN yarn install
COPY . .

FROM alpine:3.6
WORKDIR /usr/src
COPY --from=base /usr/bin/node /usr/bin/
RUN apk add --no-cache \
  libstdc++ \
  cairo \
  jpeg \
  librsvg \
  pango \
  freetype \
  giflib \
  ttf-dejavu ttf-droid ttf-freefont ttf-liberation ttf-ubuntu-font-family fontconfig
ENV NODE_ENV="production"
COPY --from=base /usr/src .
CMD [ "node", "./node_modules/.bin/micro", "server.js" ]
