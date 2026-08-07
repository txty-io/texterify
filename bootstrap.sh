#!/bin/sh

set -e

bin/rails db:migrate

bundle exec sidekiq & bin/rails server
