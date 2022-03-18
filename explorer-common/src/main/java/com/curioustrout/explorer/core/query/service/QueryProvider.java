package com.curioustrout.explorer.core.query.service;

import com.curioustrout.explorer.core.query.QueryConfig;
import org.apache.jena.ext.com.google.common.io.Resources;
import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryException;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.support.ResourcePatternUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.Charset;
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
    private final String queryLocationPattern;
    private final String prefixDefinitionPath;

    private final Map<String, ParameterizedSparqlString> queryStrings;
    private final Model model = ModelFactory.createDefaultModel();

    @Value("${explorer.core.query.sparql-endpoint}")
    private String test;

    public QueryProvider(
            ResourceLoader resourceLoader,
            @Value("${explorer.core.query.query-dir}") String queryLocationPattern,
            @Value("${explorer.core.query.prefix-uri-file}") String prefixDefinitionPath)
            throws IOException {

        this.queryLocationPattern = queryLocationPattern;
        this.prefixDefinitionPath = prefixDefinitionPath;
        this.resourceLoader = resourceLoader;
        this.queryStrings = new HashMap<>();

        LOGGER.info("Loading queries from {} with prefixes from {}", queryLocationPattern, prefixDefinitionPath);

        var properties = new Properties();
        properties.load(resourceLoader.getResource(prefixDefinitionPath).getInputStream());

        for (var queryResource : loadQueries()) {
            var fileContents = StreamUtils.copyToString(queryResource.getInputStream(), Charset.defaultCharset());
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
    public Query getQuery(String name, Map<String, Object> config) {

        var queryString = queryStrings.get(name).copy();
        for (var entry : config.entrySet()) {
            queryString.setLiteral(entry.getKey(), model.createTypedLiteral(entry.getValue()));
        }

        try {
            return queryString.asQuery();
        }
        catch (QueryException e) {
            var message = e.getMessage();
            if (message.contains("don't know how to parse")) {
                var offendingClass = message.substring(message.lastIndexOf('.') + 1);
                throw new IllegalArgumentException("Could not convert Java Object <" + offendingClass + "> to TypedLiteral as it is not referenced within a registered RDFDataType instance", e);
            }
        }
        return null;
    }

    public Query getQuery(QueryConfig queryConfig) {
        try {
            return getQuery(QueryConfig.getQueryName(queryConfig), QueryConfig.getConfig(queryConfig));
        } catch (IllegalAccessException e) {
            LOGGER.warn("Could not parse query config {}: {}", queryConfig, e.getMessage());
            return QueryFactory.create();
        }
    }

    private Resource[] loadQueries() throws IOException {
        return ResourcePatternUtils.getResourcePatternResolver(resourceLoader).getResources(queryLocationPattern);
    }

}
