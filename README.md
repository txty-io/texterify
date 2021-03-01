 <p align="center">
  <p align="center">
    <a href="https://texterify.com/?utm_source=github&utm_medium=logo" target="_blank">
      <img src="https://raw.github.com/texterify/texterify/screenshots/logo.png?sanitize=true" alt="Texterify" height="72">
    </a>
  </p>
  <p align="center">
    The modern localization management system.
  </p>
</p>

[![Open Issues](https://img.shields.io/github/issues-raw/texterify/texterify.svg)](https://img.shields.io/github/issues-raw/texterify/texterify.svg)

<p align="center">
  <img src="https://raw.github.com/texterify/texterify/screenshots/example_1.png" width="290">
  <img src="https://raw.github.com/texterify/texterify/screenshots/example_2.png" width="290">
  <img src="https://raw.github.com/texterify/texterify/screenshots/example_3.png" width="290">
</p>

## Installation

The easiest way to get the software up and running is by using the official Docker image. We already have a ready to go `docker-compose` configuration for starting Texterify locally or on your server within seconds.

You only need to have `docker` and `docker-compose` installed on the system where Texterify will be running.

The process of starting the application is the following:

```sh
# Clone the docker-compose configuration.
git clone https://github.com/texterify/texterify-docker-compose-setup.git
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

- Texterify VSC Extension (https://github.com/texterify/texterify-vsc)
- Texterify CLI (https://github.com/texterify/texterify-cli)

## Contributing

Want to help build Texterify?

We are happy about every help.

## Troubleshooting

### Why is the watcher command failing randomly with exit code 137?

If you receive the error below try to increase the memory (e.g. `8 GB`) that docker can use. Webpacker unfortunately requires a lot of memory to compile all the assets.

```sh
> yarn start:watcher
...
Killed
error Command failed with exit code 137.
```

## Security

Found a security issue? Please **don't** create an issue on GitHub. Instead send an email with your findings to [security@texterify.com](mailto:security@texterify.com).

## License

See the [LICENSE](LICENSE) file for details.
