# STAGE 0: Install base dependencies

FROM node:16.15.1-alpine@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b AS dependencies

LABEL maintainer="Minh Hang Nguyen <mhnguyen16@myseneca.ca>" \
      description="fragments-ui web app for testing"

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn
# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

ENV NODE_ENV=production

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

###################################################################

# STAGE 1: built the site

FROM node:16.15.1-alpine@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b AS build

WORKDIR /app

COPY --from=dependencies /app /app

COPY . . 

RUN yarn build

####################################################################

# STAGE 2: serve the built site

FROM nginx:stable-alpine@sha256:74694f2de64c44787a81f0554aa45b281e468c0c58b8665fafceda624d31e556 AS deploy

WORKDIR /app

ENV PORT=80

COPY --from=build /app/dist /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
  CMD curl --fail localhost:${PORT} || exit 1
