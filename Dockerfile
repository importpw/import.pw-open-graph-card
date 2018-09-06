FROM mhart/alpine-node:10 as build
RUN apk add --no-cache \
	build-base \
	cairo-dev \
	freetype-dev \
	giflib-dev \
	jpeg-dev \
	librsvg-dev \
	pango-dev \
	python2
WORKDIR /usr/src
COPY package.json ./
RUN yarn --build-from-source --production
COPY . .

FROM alpine:3.7
COPY --from=build /usr/bin/node /usr/bin/
RUN apk add --no-cache \
	cairo \
	freetype \
	giflib \
	jpeg \
	librsvg \
	libstdc++ \
	pango
WORKDIR /usr/src
ENV PATH="./node_modules/.bin:$PATH"
ENV NODE_ENV="production"
COPY --from=build /usr/src .
CMD ["micro"]
