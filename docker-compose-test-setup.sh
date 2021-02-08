#!/bin/sh
echo "Executing docker-compose-test-setup.sh..."

# bundle exec rails db:create db:migrate db:seed RAILS_ENV=test
# bundle install --with test
# yarn install --production=false
# apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb

echo "Finished executing docker-compose-test-setup.sh..."

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"
