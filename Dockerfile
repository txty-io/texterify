# Required environment variables:
# - SECRET_KEY_BASE

FROM ruby:2.7.1
SHELL ["/bin/bash", "-c"]

EXPOSE 3000

ARG COMMIT_HASH
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORGANIZATION_BACKEND
ARG SENTRY_PROJECT_BACKEND

ENV RAILS_ENV="production"
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
ENV NODE_ENV="production"
ENV NODE_OPTIONS=--max_old_space_size=8192
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

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

# Compile assets.
RUN SECRET_KEY_BASE=`bin/rails secret` RAILS_ENV=production COMMIT_HASH=$COMMIT_HASH SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN SENTRY_ORGANIZATION_BACKEND=$SENTRY_ORGANIZATION_BACKEND SENTRY_PROJECT_BACKEND=$SENTRY_PROJECT_BACKEND bundle exec rails assets:precompile

CMD ["bundle", "exec", "rails", "server"]
