package com.curioustrout.explorer.gis.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "explorer.gis")
public class Properties {

    private String wikidataSparqlUrl;
    private String osmSparqlUrl;
    private String queryDir;
    private String prefixUriFile;

    public String getWikidataSparqlUrl() {
        return wikidataSparqlUrl;
    }

    public void setWikidataSparqlUrl(String wikidataSparqlUrl) {
        this.wikidataSparqlUrl = wikidataSparqlUrl;
    }

    public String getOsmSparqlUrl() {
        return osmSparqlUrl;
    }

    public void setOsmSparqlUrl(String osmSparqlUrl) {
        this.osmSparqlUrl = osmSparqlUrl;
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
}
