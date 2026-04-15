 <p align="center">
  <a href="https://texterify.com/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://raw.github.com/texterify/texterify/master/app/assets/images/logo_white_background_rounded.png?sanitize=true" alt="Texterify logo" height="160">
  </a>
</p>

[![website](https://img.shields.io/badge/website-texterify.com-blue.svg)](https://texterify.com)
[![stars](https://img.shields.io/github/stars/texterify/texterify)](https://github.com/texterify/texterify)
[![docker pulls](https://img.shields.io/docker/pulls/chrztoph/texterify)](https://hub.docker.com/r/chrztoph/texterify)

[Texterify](https://texterify.com) is a localization management platform designed to simplify software localization. It features a clean, fast, and user-friendly interface that makes it easy to use, while still offering the flexibility and powerful tools needed to seamlessly integrate into your workflow.

Find out more at [texterify.com](https://texterify.com) or [sign up](https://app.texterify.com/signup) here.

<h2 id="getting-started">Getting started</h2>

<h3>Installation</h3>

If you want to try out Texterify you can sign up at [texterify.com](https://texterify.com) and use the cloud version of Texterify without having to setup anything yourself.

If you want to set it up yourself the easiest way to get the software up and running is by using the official [Docker image](https://hub.docker.com/r/chrztoph/texterify). We provide a `docker-compose` configuration for starting Texterify locally or on your server within seconds.

You only need to have `docker` and `docker-compose` installed.

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
docker-compose up

# After everything has started create the database in another terminal.
# Make sure you are still in the `texterify-docker-compose-setup` directory.
docker-compose exec app bin/rails db:create db:migrate db:seed

# Service is now available at http://localhost.
```

This will install the latest version of the service available at the time of setting up.


<h3>Update</h3>

You can update to a newer version by following our upgrade guide [here](https://docs.texterify.com/installation/updating-the-service).

<h2 id="contributing">Contributing</h2>

Want to help build Texterify?

We are happy about every help. For major changes, please [open an issue](https://github.com/texterify/texterify/issues/new) first to discuss what you would like to change.

The easiest way to get started working on Texterify is by using [Visual Studio Code Remote Containers](https://code.visualstudio.com/docs/remote/containers). Follow the guide and open the dev container. After the container has started open a terminal inside of VSC and run the following commands:

```sh
yarn
bundle install
bundle exec rails db:create db:migrate db:seed
```

This will install dependencies, create the database and add some [test data](db/seeds/development.rb) like users for you. After that execute the following commands in two different terminals:

```sh
# terminal 1
yarn start

# terminal 2
yarn start:watcher
```

Having done that you can open [http://localhost:3000](http://localhost:3000) and see your local development instance of Texterify.

Make sure to also check out our development docs page at [https://docs.texterify.com/development](https://docs.texterify.com/development).

<h2 id="troubleshooting">Troubleshooting</h2>

### Why is the watcher command failing randomly with exit code 137?

If you receive the error below try to increase the memory (e.g. `8 GB`) that docker can use. Webpacker unfortunately requires a lot of memory to compile all the assets.

```sh
> yarn start:watcher
...
Killed
error Command failed with exit code 137.
```

### After starting the server I get Webpacker::Manifest::MissingEntryError?

This usually happens when you start the development server for the first time and webpack has not yet compiled the required frontend assets and therefore some files can not be found. Run `yarn start` in a terminal and `yarn start:watcher` in another one and wait for the `yarn start:watcher` command to finish initial compilation (the terminal outputs `Compiled successfully`). Then reload the site. This can take some minutes initially.

### I get the error "common.rb:156:in `parse': 783: unexpected token at '' (JSON::ParserError)" when starting the server during development?

Try to run the following command:

```sh
rails webpacker:compile
```

<h2 id="security">Security</h2>

Found a security issue? Please **don't** create an issue on GitHub. Instead send an email with your findings to [security@texterify.com](mailto:security@texterify.com) so a bugfix can be developed before the security flaw is publicly disclosed. We take security very seriously.

See [SECURITY](SECURITY.md) for details.

<h2 id="license">License</h2>

See the [LICENSE](LICENSE) file for details.

You can find more information at [texterify.com/pricing](https://texterify.com/pricing).
