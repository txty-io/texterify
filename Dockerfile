FROM ruby:2.7.1-alpine AS production

EXPOSE 3000

ARG RAILS_ENV_ARG=production
ARG NODE_ENV_ARG=production
ARG BUILD_PACKAGES="build-base curl-dev git"
ARG RUN_PACKAGES="tzdata postgresql-dev yaml-dev zlib-dev"

ENV RAILS_ENV=$RAILS_ENV_ARG
ENV RAILS_ROOT /var/www/texterify
RUN mkdir -p $RAILS_ROOT
WORKDIR $RAILS_ROOT

# Install essential libraries.
RUN apk update \
    && apk upgrade \
    && apk add --update --no-cache $BUILD_PACKAGES $RUN_PACKAGES

# Install node.
RUN apk add --repository http://dl-cdn.alpinelinux.org/alpine/v3.14/main nodejs yarn

# Install gems.
COPY Gemfile Gemfile
COPY Gemfile.lock Gemfile.lock
RUN gem install bundler:2.1.4
RUN gem install nokogiri
RUN bundle config --global frozen 1 \
    && bundle install --without development test --jobs 20 --retry 5

# Copy project files.
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

FROM production AS testing

RUN bundle install --with test
RUN gem install mailcatcher
RUN yarn install --production=false
RUN apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb

CMD ["rails", "server"]
