# Explorer
[![Java CI with Maven](https://github.com/signal32/explorer/actions/workflows/maven.yml/badge.svg?branch=master)](https://github.com/signal32/explorer/actions/workflows/maven.yml)

An app for exploring your world.

# Building from source
Explorer uses the Maven build system throughout with modules for:
- `explorer-app` Frontend client for web and mobile built with Vue.JS
- `explorer-auth` Authentication services
- `explorer-keycloak` Authentication server
- `explorer-user` User related services

To build use `mvn build` or `mvn -pl <modules> build` where projects is a comma separated list of individual modules.
