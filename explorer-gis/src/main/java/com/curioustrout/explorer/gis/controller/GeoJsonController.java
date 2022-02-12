package com.curioustrout.explorer.gis.controller;

import com.curioustrout.explorer.gis.service.LocationInfoService;
import com.mapbox.geojson.Feature;
import com.mapbox.geojson.FeatureCollection;
import com.mapbox.geojson.Point;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Endpoint for serving geoJson from WikiData
 */
@RestController
@RequestMapping("/geoJson")
@CrossOrigin(origins = "*", maxAge = 3600)
public class GeoJsonController {

    private static final Logger LOGGER = LoggerFactory.getLogger(GeoJsonController.class);

    @Autowired
    private LocationInfoService locationInfoService;

    @GetMapping("/{z}/{x}/{y}")
    public ResponseEntity<String> getTile(@PathVariable double z, @PathVariable double x, @PathVariable double y) {
        LOGGER.info("Request recvieved for tile at position z:{} x: {}, y: {}", z,x,y);

        var features = new ArrayList<Feature>();
        for (var location: locationInfoService.getInRadius(x,y,1)) {
            var feature = Feature.fromGeometry(Point.fromLngLat(location.getCoordinate().x, location.getCoordinate().y));
            feature.addStringProperty("name", location.getName());
            features.add(feature);
        }

        return ResponseEntity.ok(FeatureCollection.fromFeatures(features).toJson());
    }


    @GetMapping("/test/{z}/{x}/{y}")
    public ResponseEntity<List<Map<String, String>>> getTileTest(@PathVariable double z, @PathVariable double x, @PathVariable double y) {
        LOGGER.info("Request recvieved for tile at position z:{} x: {}, y: {}", z,x,y);

        var results = locationInfoService.getInRad(z, x, y);


        return ResponseEntity.ok(results);
    }

}

