package com.curioustrout.explorer.data_handling.importer;

import org.apache.jena.graph.Triple;

import java.util.Set;

public interface Importer {
    Set<Triple> getTruthy();
}
