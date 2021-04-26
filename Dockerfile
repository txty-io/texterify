FROM ruby:2.7.1 AS production
SHELL ["/bin/bash", "-c"]

EXPOSE 3000

ARG RAILS_ENV_ARG=production
ARG NODE_ENV_ARG=production

ENV RAILS_ENV=$RAILS_ENV_ARG
ENV RAILS_ROOT /var/www/texterify

# Install essential libraries.
RUN apt-get update && apt-get install -y build-essential libpq-dev

# Set workdir.
RUN mkdir -p $RAILS_ROOT
WORKDIR $RAILS_ROOT

# Install gems.
COPY Gemfile Gemfile
COPY Gemfile.lock Gemfile.lock
RUN gem install bundler:2.1.4
RUN bundle install --jobs 20 --retry 5 --without development test

# Update the repository sources list
# and install dependencies.
RUN apt-get update \
    && apt-get install -y curl \
    && apt-get -y autoclean

# Install nvm.
ENV NVM_DIR /usr/local/nvm
RUN mkdir -p $NVM_DIR
ENV NODE_VERSION 14.13.1
ENV NODE_ENV=$NODE_ENV_ARG
ENV NODE_OPTIONS="--max_old_space_size=8192"
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

# Install node and npm.
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# Add node and npm to path so the commands are available.
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Install yarn.
RUN apt-get install apt-transport-https
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install yarn -y

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
    bundle exec rails assets:precompile

CMD ["rails", "server"]


FROM production AS testing

RUN bundle install --with test
RUN gem install mailcatcher
RUN yarn install --production=false
RUN apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb

CMD ["rails", "server"]
