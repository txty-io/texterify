FROM ruby:2.7.1-alpine AS builder

ARG RAILS_ENV_ARG=production
ARG NODE_ENV_ARG=production
ARG BUILD_PACKAGES="build-base curl-dev git"
ARG RUN_PACKAGES="tzdata postgresql-dev yaml-dev zlib-dev"

ENV RAILS_ENV=$RAILS_ENV_ARG
ENV RAILS_ROOT /var/www/texterify
RUN mkdir -p $RAILS_ROOT
WORKDIR $RAILS_ROOT

ENV BUNDLE_APP_CONFIG="$RAILS_ROOT/.bundle"

RUN apk update \
    && apk upgrade \
    && apk add --update --no-cache $BUILD_PACKAGES $RUN_PACKAGES

RUN apk add --repository http://dl-cdn.alpinelinux.org/alpine/v3.14/main nodejs yarn

COPY Gemfile Gemfile
COPY Gemfile.lock Gemfile.lock
RUN gem install bundler:2.1.4
RUN gem install nokogiri
RUN bundle config set without development test
RUN bundle config --global frozen 1 \
    && bundle install --jobs 20 --retry 5 --path=vendor/bundle

COPY . .

ARG COMMIT_HASH
ARG SENTRY_SOURCE_MAPS_AUTH_TOKEN
ARG SENTRY_SOURCE_MAPS_ORGANIZATION
ARG SENTRY_SOURCE_MAPS_PROJECT
ARG PROPRIETARY_MODE
ARG STRIPE_PUBLIC_API_KEY
ARG TEXTERIFY_PAYMENT_SERVER
ARG SENTRY_DSN_FRONTEND

ENV COMMIT $COMMIT_HASH

RUN echo $COMMIT_HASH
RUN echo $COMMIT

# Compile assets.
RUN SECRET_KEY_BASE=`bin/rails secret` \
    RAILS_ENV=$RAILS_ENV \
    COMMIT_HASH=$COMMIT_HASH \
    SENTRY_SOURCE_MAPS_AUTH_TOKEN=$SENTRY_SOURCE_MAPS_AUTH_TOKEN \
    SENTRY_SOURCE_MAPS_ORGANIZATION=$SENTRY_SOURCE_MAPS_ORGANIZATION \
    SENTRY_SOURCE_MAPS_PROJECT=$SENTRY_SOURCE_MAPS_PROJECT \
    PROPRIETARY_MODE=$PROPRIETARY_MODE \
    STRIPE_PUBLIC_API_KEY=$STRIPE_PUBLIC_API_KEY \
    TEXTERIFY_PAYMENT_SERVER=$TEXTERIFY_PAYMENT_SERVER \
    SENTRY_DSN_FRONTEND=$SENTRY_DSN_FRONTEND \
    bin/rails assets:precompile

CMD ["rails", "server"]

FROM ruby:2.7.1-alpine AS production

ARG RAILS_ENV_ARG=production
ARG NODE_ENV_ARG=production
ARG RUN_PACKAGES="tzdata postgresql-dev yaml-dev zlib-dev"

ENV RAILS_ENV=$RAILS_ENV_ARG
ENV RAILS_ROOT /var/www/texterify
RUN mkdir -p $RAILS_ROOT
WORKDIR $RAILS_ROOT

ENV BUNDLE_APP_CONFIG="$RAILS_ROOT/.bundle"

RUN apk update \
    && apk upgrade \
    && apk add --update --no-cache $RUN_PACKAGES

COPY --from=builder $RAILS_ROOT $RAILS_ROOT

EXPOSE 3000

CMD ["bin/rails", "server"]

FROM builder AS testing

RUN bundle config --delete without
RUN bundle install
# RUN gem install mailcatcher -v 0.8.2
RUN yarn install --production=false
# RUN apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb

CMD ["bin/rails", "server"]
