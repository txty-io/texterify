 <p align="center">
  <a href="https://texterify.com/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://raw.github.com/texterify/texterify/master/app/assets/images/logo_white_background_rounded.png?sanitize=true" alt="Texterify logo" height="160">
  </a>
</p>

[![website](https://img.shields.io/badge/website-texterify.com-blue.svg?style=flat-square)](https://texterify.com)
[![license](https://img.shields.io/github/license/txty-io/txty-cli?style=flat-square)](https://github.com/txty-io/texterify/blob/master/LICENSE)
[![stars](https://img.shields.io/github/stars/texterify/texterify)](https://github.com/txty-io/texterify)
[![docker pulls](https://img.shields.io/docker/pulls/chrztoph/texterify)](https://hub.docker.com/r/chrztoph/texterify)

[Texterify](https://texterify.com) is a localization management platform which aims to make software localization as easy as possible. A very clean, fast and user friendly interface makes it super easy to use while providing full flexibility and powerful tools to perfectly integrate it into your workflow.

- Beautiful light and dark mode for every situation
- Built-in WYSIWYG HTML editor for easy rich content editing
- Language inheritance and post processing
- Flexible ways to export your translations
- Translation and activity history
- Collaboration features for teams
- Over the air translations for fast app translation updates
- A big selection of integrations
- Cloud and on-premise options

For future features see our [public roadmap](https://github.com/texterify/texterify/projects/1).

Find out more at [texterify.com](https://texterify.com) or [sign up](https://app.texterify.com/signup) here.

<p align="center">
  <img src="https://raw.github.com/texterify/texterify/screenshots/example_1.png" width="290">
  <img src="https://raw.github.com/texterify/texterify/screenshots/example_2.png" width="290">
  <img src="https://raw.github.com/texterify/texterify/screenshots/example_3.png" width="290">
</p>

<h2>Table of contents</h2>

- [Getting started](#getting-started)
- [Tools & Integrations](#tools-and-integrations)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)
- [Security](#security)
- [License](#license)

<h2 id="getting-started">🚀 Getting started</h2>

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
docker-compose exec app bin/rails db:create db:migrate db:seed

# Service is now available at http://localhost. 🎉
```

This will install the latest version of the service available at the time of setting up.


<h3>Update</h3>

You can update to a newer version by following our upgrade guide [here](https://docs.texterify.com/installation/updating-the-service).

<h2 id="tools-and-integrations">🛠️ Tools & Integrations</h2>

We provide several different tools and integrations to make localization as easy as possible. If you are missing anything you would love to have create a ticket [here](https://github.com/texterify/texterify/issues) and let us know or tell us what you created and we will include it here.

- Texterify VSC Extension (https://github.com/texterify/texterify-vsc)
- Texterify CLI (https://github.com/texterify/texterify-cli)
- Texterify Android SDK (https://github.com/texterify/texterify-android)
- Texterify iOS SDK (https://github.com/texterify/texterify-ios)
- Texterify API Node (https://github.com/texterify/texterify-api-node)

<h2 id="contributing">🤝 Contributing</h2>

Want to help build Texterify?

We are happy about every help. For major changes, please [open an issue](https://github.com/texterify/texterify/issues/new) first to discuss what you would like to change.

The easiest way to get started working on Texterify is by using [Visual Studio Code Remote Containers](https://code.visualstudio.com/docs/remote/containers) and Docker.

First create a Docker network by running:

```sh
docker network create txty-network
```

Then follow the [Visual Studio Code Remote Containers](https://code.visualstudio.com/docs/remote/containers) guide and open the dev container. After the container has started open a terminal inside of VSC and run the following commands:

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

<h2 id="troubleshooting">👀 Troubleshooting</h2>

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

<h2 id="changelog">📋 Changelog</h2>

See [CHANGELOG](CHANGELOG.md) for changelog.

<h2 id="security">🔒 Security</h2>

Found a security issue? Please **don't** create an issue on GitHub. Instead send an email with your findings to [security@texterify.com](mailto:security@texterify.com) so a bugfix can be developed before the security flaw is publicly disclosed.

See [SECURITY](SECURITY.md) for details.

<h2 id="license">📝 License</h2>

See the [LICENSE](LICENSE) file for details.

You can find more information at [texterify.com/pricing](https://texterify.com/pricing).
