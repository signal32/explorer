package com.curioustrout.explorer.gis.service;

import com.curioustrout.explorer.gis.model.LocationInfo;
import com.curioustrout.explorer.gis.model.SimpleLocationInfo;
import org.apache.jena.rdfconnection.RDFConnection;
import org.locationtech.jts.geom.Coordinate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class LocationInfoService {

    private static final String WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";

    private final QueryProvider queryProvider;

    public LocationInfoService(QueryProvider queryProvider) {
        this.queryProvider = queryProvider;
    }

    public List<LocationInfo> getInRadius(double lng, double lat, double radius) {
        var q = queryProvider.getQuery("radius_from_center.sparql", Map.ofEntries(
                Map.entry("pointValue", String.format("Point(%s,%s)", lng, lat)),
                Map.entry("radius", "1")
                //Map.entry("language", "en")
        ));

        System.out.println(q.toString());

        var results = new ArrayList<LocationInfo>();

        try (var conn = RDFConnection.connect(WIKIDATA_ENDPOINT)) {
            conn.querySelect(q, (result) -> {
                System.out.println("Finished");
                var subject = result.getLiteral("placeLabel");
                var location = result.getLiteral("location").toString();
                System.out.println(subject.toString());
                results.add(new SimpleLocationInfo(subject.toString(), "none", getCoordinate(location)));
            });
        }

        return results;

    }

    private Coordinate getCoordinate(String point){
        final String regex = "[\\d&.&-]+";

        final Pattern pattern = Pattern.compile(regex, Pattern.MULTILINE);
        final Matcher matcher = pattern.matcher(point);

        var x = new ArrayList<String>();
        while (matcher.find()) {
            System.out.println("Full match: " + matcher.group(0));
            x.add(matcher.group(0));
        }

        return new Coordinate(Double.parseDouble(x.get(0)), Double.parseDouble(x.get(1)));
    }

}