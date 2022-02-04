package com.curioustrout.explorer.gis.service;

import com.curioustrout.explorer.gis.util.Fetcher;
import com.curioustrout.explorer.gis.util.GeoArea;
import com.curioustrout.explorer.gis.util.Quad;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.locationtech.jts.geom.Coordinate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.SessionScope;

import java.util.Objects;
import java.util.Set;


@Component
@SessionScope
public class SessionRdfModel {

    private record QuadDetails(
            boolean loaded,
            Set<Integer> queryHashes
    ){}

    private final Model model;
    private final Quad<GeoArea, QuadDetails> quadTree;
    //todo quadtree of booleans to keep track of whether model represents an area fully

    public SessionRdfModel(JenaService jenaService) {
        // Jena is outside spring's dependency injection and initialised independently before we use it
        if (!jenaService.initialised) throw new IllegalStateException("Jena service is not initialised");

        this.model = ModelFactory.createDefaultModel();
        this.quadTree = new Quad<>(25);
    }

    public Model getModel() {
        return model;
    }

    /**
     * @param query
     * @param area
     * @return True if the given query has been run on this area
     */
    public boolean contains(Query query, GeoArea area) {
        var location = quadTree.find(area.getNe());
        return location.getData().queryHashes.contains(Objects.hashCode(query));
    }

    public QueryExecution query(Query query, GeoArea area, Fetcher<?, ?>... fetchers) {

        // find location
        var location = quadTree.find(area.getNe());

        // Check is query has been run here before
        if (location.getData().queryHashes.contains(Objects.hashCode(query))){
        }
        // if not run query externaly


        return QueryExecution.create(query, this.model);
    }

    private void test() {
        var x = quadTree.find(new Coordinate());
    }
}
