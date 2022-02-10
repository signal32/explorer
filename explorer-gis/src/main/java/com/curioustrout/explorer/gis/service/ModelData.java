package com.curioustrout.explorer.gis.service;

import org.apache.jena.rdf.model.Model;


/**
 * An RDF model that tracks its state with position on globe
 */
public class ModelData {

    private final Model model;
    private long lastAccess;

    public ModelData(Model model) {
        this.model = model;
        this.lastAccess = System.currentTimeMillis();

    }

    public Model getModel() {
        lastAccess = System.currentTimeMillis();
        return model;
    }

    public long getLastAccess() {
        return lastAccess;
    }
}

