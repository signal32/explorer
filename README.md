# Explorer
[![Java CI with Maven](https://github.com/signal32/explorer/actions/workflows/maven.yml/badge.svg?branch=master)](https://github.com/signal32/explorer/actions/workflows/maven.yml)

Exploring the world with open data.

# Installation & Deployment
- Use [OpenMapTiles](https://github.com/openmaptiles/openmaptiles) to generate map tiles.
  For default configuration these must be names `tiles.mbtiles` and placed within `./resources/tileserver/tiles`.
  Alternatively set env variable `TILESERVER_TILE_DIR` to point at your tiles directory.
- Modify configuration in `.env.dev` and `./explorer-app/.env` to your requirements. (optional)
- Run `$ sh mvnw clean install`
- Run `$ docker-compose up`
- Add `$ python ./scripts/update.py` to crontab for automatic updates (optional, not recommended)

# Building from source
Explorer uses the Maven build system throughout with modules for:
- `explorer-app` Frontend client for web and mobile built with Vue.JS
- `explorer-auth` Authentication services
- `explorer-keycloak` Authentication server
- `explorer-user` User related services

To build use `mvn build` or `mvn -pl <modules> build` where projects is a comma separated list of individual modules.
