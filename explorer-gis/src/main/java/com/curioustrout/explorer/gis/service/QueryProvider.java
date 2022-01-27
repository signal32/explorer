package com.curioustrout.explorer.gis.service;

import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.query.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.support.ResourcePatternUtils;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Reads sparql queries from classpath and injects available prefixes.
 */
@Component
public class QueryProvider {

    private final ResourceLoader resourceLoader;
    private static final Logger LOGGER = LoggerFactory.getLogger(QueryProvider.class);
    //todo fix value injection
    //@Value("${explorer.gis.query-dir}")
    private String queryLocationPattern = "classpath:sparql/**/*.sparql";
    //todo fix value injection
    //@Value("${explorer.gis.prefix-uri-file}")
    private String prefixDefinitionPath = "classpath:sparql.properties";

    private final Map<String, ParameterizedSparqlString> queryStrings;


    public QueryProvider(ResourceLoader resourceLoader) throws IOException {
        this.resourceLoader = resourceLoader;
        this.queryStrings = new HashMap<>();

        var properties = new Properties();
        properties.load(resourceLoader.getResource(prefixDefinitionPath).getInputStream());

        for (var queryResource : loadQueries()) {
            var fileContents = Files.readString(queryResource.getFile().toPath());
            var queryString = new ParameterizedSparqlString(fileContents);

            for (var prefix : properties.entrySet()){
                queryString.setIri(prefix.getKey().toString(), prefix.getValue().toString());
            }

            queryStrings.put(queryResource.getFilename(), queryString);
        }

        LOGGER.info("Initialised sqarql queries: count = {} ", queryStrings.size());
    }

    /**
     * Get a new query, guaranteed as ready to use.
     * @param name Filename of the query
     * @param config Values to be injected into query
     */
    public Query getQuery(String name, Map<String, String> config) {
        var queryString = queryStrings.get(name).copy();
        for (var entry : config.entrySet()) {
            queryString.setLiteral(entry.getKey(), entry.getValue());
        }
        return queryString.asQuery();
    }

    private Resource[] loadQueries() throws IOException {
        return ResourcePatternUtils.getResourcePatternResolver(resourceLoader).getResources(queryLocationPattern);
    }

}
