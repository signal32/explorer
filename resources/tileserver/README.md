
## Providing vector tiles source
Source files for vector tiles are not provided by default. You will need to add your own.
- Use [OpenMapTiles](https://github.com/openmaptiles/openmaptiles) to generate a `tiles.mbtiles` file and place this within `./tiles`
- Make sure `tileserver.json` is pointing to your file:
```json
  "data": {
    "v3": {
      "mbtiles": "tiles.mbtiles"
    }
  }
```

## Using Styles with Maputnik

[Maputnik](https://github.com/maputnik/editor) is a free and open visual editor for the Mapbox GL styles.

To edit these style within maputnik some changes must be made to the style.json file.

Replace
```json
"sources": {
    "openmaptiles": {
      "type": "vector",
      "url": "mbtiles://{v3}"
    }
  },
  "glyphs": "{fontstack}/{range}.pbf",
  ```

with
  ```json
"sources": {
    "openmaptiles": {
        "type": "vector",
        "url": "http://localhost:8090/data/v3.json"
    }
  },
  "glyphs": "https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key={key}",
  ```

After editing in Maputnik, reverse this change within the exported file.