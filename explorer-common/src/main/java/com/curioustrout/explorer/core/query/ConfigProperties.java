package com.curioustrout.explorer.core.query;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "explorer.core.query")
public class ConfigProperties {
    String sparqlEndpoint;
    String queryDir;
    String prefixUriFile;
    Map<String, Integer> prefixes;

    public ConfigProperties() {
    }

    public String getSparqlEndpoint() {
        return sparqlEndpoint;
    }

    public void setSparqlEndpoint(String sparqlEndpoint) {
        this.sparqlEndpoint = sparqlEndpoint;
    }

    public String getQueryDir() {
        return queryDir;
    }

    public void setQueryDir(String queryDir) {
        this.queryDir = queryDir;
    }

    public String getPrefixUriFile() {
        return prefixUriFile;
    }

    public void setPrefixUriFile(String prefixUriFile) {
        this.prefixUriFile = prefixUriFile;
    }

    public Map<String, Integer> getPrefixes() {
        return prefixes;
    }

    public void setPrefixes(Map<String, Integer> prefixes) {
        this.prefixes = prefixes;
    }

}
