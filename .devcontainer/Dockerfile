FROM ruby:2.7.5-bullseye
SHELL ["/bin/bash", "-c"]

EXPOSE 3000
EXPOSE 3011
EXPOSE 1080

ENV RAILS_ENV="development"
ENV RAILS_ROOT /workspace

# Install essential libraries.
RUN apt-get update && apt-get install --no-install-recommends -y \
    build-essential \
    libpq-dev \
    curl \
    iproute2 \
    # Install cypress libraries
    libgtk2.0-0 \
    libgtk-3-0 \
    libnotify-dev \
    libgconf-2-4 \
    libgbm-dev \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb

# Set workdir.
RUN mkdir -p $RAILS_ROOT
WORKDIR $RAILS_ROOT

# Install gems.
COPY Gemfile Gemfile
COPY Gemfile.lock Gemfile.lock
# Fixes bug with nokogiri.
RUN bundle config set force_ruby_platform true
RUN gem install bundler:2.1.4
RUN bundle install --jobs 20 --retry 5

# Install nvm.
ENV NVM_DIR /usr/local/nvm
RUN mkdir -p $NVM_DIR
ENV NODE_VERSION 14.21.3
ENV NODE_ENV="development"
ENV NODE_OPTIONS="--max_old_space_size=8192"
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

# Install node and npm.
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# Install Python 2.
RUN apt-get install -y python2

# Add node and npm to path so the commands are available.
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Install yarn.
RUN npm install -g yarn

# Keep bash history between runs.
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/command-history/.bash_history" \
    && echo $SNIPPET >> "/root/.bashrc"

# Install mailcatcher.
# RUN gem install mailcatcher

RUN echo 'alias ys="yarn start"' >> ~/.bashrc
RUN echo 'alias ysw="yarn start:watcher"' >> ~/.bashrc
