# Use an official Node runtime as a parent image
FROM --platform=$TARGETPLATFORM node:18.13.0-alpine AS base

WORKDIR /usr/src/app

#prebuild requires python, make, gcc. Increase container max volume size in local docker deamon if needed.
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
RUN apk add --no-cache make
RUN apk add gcc g++
RUN yarn global add prebuild


COPY package.json yarn.lock nx.json ./
COPY wave.sqlite3 ./wave.sqlite3
RUN yarn install --ignore-scripts  --frozen-lockfile
RUN yarn add sqlite3
RUN cd /usr/src/app/node_modules/@parcel/watcher && prebuild --openssl_fips=''  && \
    rm -rf /var/cache/apk/* && \
    rm -rf /root/.npm && \
    rm -rf /usr/lib/node_modules/npm



FROM --platform=$TARGETPLATFORM node:18.13.0-alpine as build
RUN apk add curl bash

# install node-prune (https://github.com/tj/node-prune)
RUN curl -sfL https://gobinaries.com/tj/node-prune | bash -s -- -b /usr/local/bin
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --from=base /usr/src/app/node_modules  ./node_modules
COPY  . .
RUN export NX_DAEMON=false; yarn run build 
# run node prune
RUN /usr/local/bin/node-prune

FROM --platform=$TARGETPLATFORM node:18.13.0-alpine  as prod
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules  ./node_modules
COPY --from=build /usr/src/app/wave.sqlite3 ./wave.sqlite3

USER node

EXPOSE 3000

CMD ["node", "dist/apps/trading-waves/main"]
