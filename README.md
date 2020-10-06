<img src="https://raw.github.com/chrztoph/texterify/screenshots/logo.svg?sanitize=true" width="240" alt="Texterify Logo" />

[![Build Status](https://travis-ci.org/chrztoph/texterify.svg?branch=master)](https://travis-ci.org/chrztoph/texterify) [![License](https://img.shields.io/github/license/chrztoph/texterify.svg)](https://img.shields.io/github/license/chrztoph/texterify.svg) [![Open Issues](https://img.shields.io/github/issues-raw/chrztoph/texterify.svg)](https://img.shields.io/github/issues-raw/chrztoph/texterify.svg)

**Texterify is a modern localization management system.**

![Example image](https://raw.github.com/chrztoph/texterify/screenshots/example.png)

## Installation

The easiest way to get the software up and running is by using the official Docker image. We already have a ready to go `docker-compose` configuration for starting Texterify locally or on your server within seconds.

You only need to have `docker` and `docker-compose` installed on the system where Texterify will be running.

The process of starting the application is the following:

```sh
# Clone the docker-compose configuration.
git clone https://github.com/chrztoph/texterify-docker-compose-setup.git
cd texterify-docker-compose-setup

# Generate a secret key for the app.
# Make sure to keep this private.
echo SECRET_KEY_BASE=`openssl rand -hex 64` > secrets.env

# Start the service.
docker volume create --name=texterify-database
docker volume create --name=texterify-assets
docker-compose up -d

# Create the database.
docker-compose exec app bin/rails db:create db:migrate db:seed

# Service should now be available on http://localhost.
```

This will install the latest version of the service available at the time of setting up.

## Tools & Integrations

- Texterify VSC Extension (https://github.com/chrztoph/texterify-vsc)
- Texterify CLI (https://github.com/chrztoph/texterify-cli)

## Contributing

Want to help build Texterify?

We are happy about every help.

## License

[![License](https://img.shields.io/github/license/chrztoph/texterify.svg)](https://img.shields.io/github/license/chrztoph/texterify.svg)

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
