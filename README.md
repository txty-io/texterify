# Texterify

[![Build Status](https://travis-ci.org/chrztoph/texterify.svg?branch=master)](https://travis-ci.org/chrztoph/texterify) [![License](https://img.shields.io/github/license/chrztoph/texterify.svg)](https://img.shields.io/github/license/chrztoph/texterify.svg) [![Open Issues](https://img.shields.io/github/issues-raw/chrztoph/texterify.svg)](https://img.shields.io/github/issues-raw/chrztoph/texterify.svg)

**Texterify is an open source localization management system.**

It is completely free and open-source so you can host it on your own server or just run it locally.

## Installation

The easiest way to get the software up and running is by using the official Docker image. We already have a ready to go `docker-compose` configuration for starting Texterify locally or on your server within seconds.

You only need to have `docker` and `docker-compose` installed on the system where Texterify will be running.

The process of starting the application is the following:

```sh
# Generate a secret key for the app.
# Make sure to keep this private.
export TEXTERIFY_SECRET_KEY=`openssl rand -hex 64`

# Clone the docker-compose configuration and start the service.
git clone https://github.com/chrztoph/texterify-docker-compose-setup.git
cd texterify-docker-compose-setup
docker volume create --name=texterify-database
docker-compose up

# Create the database.
docker-compose exec app bin/rails db:create db:migrate

# Service should now be available on http://localhost.
```

This will install the latest version of the service available at the time of setting up. You can also start the service in the background by providing the `-d` flag to the `docker-compose up` command.

## Contributing

Want to help build Texterify?

We are happy about every help.

## License

[![License](https://img.shields.io/github/license/chrztoph/texterify.svg)](https://img.shields.io/github/license/chrztoph/texterify.svg)

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
