package com.curioustrout.explorer.gis.service;

import com.curioustrout.explorer.gis.model.Point;
import org.apache.jena.datatypes.RDFDatatype;
import org.apache.jena.datatypes.TypeMapper;
import org.apache.jena.sys.JenaSystem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class JenaService {

    private static final Logger LOGGER = LoggerFactory.getLogger(JenaService.class);

    private static final RDFDatatype[] CUSTOM_TYPES = { Point.INSTANCE };

    public final boolean initialised;

    public JenaService() {
        JenaSystem.init();
        initialised = true;
        LOGGER.info("Apache Jena Initialised");

        // Register custom rdf rational types
        for (var type : CUSTOM_TYPES) {
            TypeMapper.getInstance().registerDatatype(type);
        }
        LOGGER.info("Registered custom typed RDF literals with Jena instance");

    }
}
