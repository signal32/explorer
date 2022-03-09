package com.curioustrout.explorer.recommend.importer;

import com.curioustrout.explorer.core.geo.Area;
import com.curioustrout.explorer.core.geo.GeoPosition;
import com.curioustrout.explorer.core.query.QueryConfig;
import com.curioustrout.explorer.core.query.SparqlQuery;
import com.curioustrout.explorer.core.query.service.JenaService;
import com.curioustrout.explorer.core.query.service.QueryProvider;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdfconnection.RDFConnection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.support.ResourcePatternUtils;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class AreaImporter {

    @SparqlQuery(fileName = "describeArea.sparql")
    public record ImportQuery (
            GeoPosition ne,
            GeoPosition sw
    ) implements QueryConfig {}

    @ConfigurationProperties(prefix = "explorer.recommend.area-importer")
    @ConstructorBinding
    public record ConfigProperties (
            double neLat,
            double neLng,
            double swLat,
            double swLng,
            double chunkSize
    ){ }

    private static final Logger LOGGER = LoggerFactory.getLogger(AreaImporter.class);

    private QueryProvider queryProvider;
    private ResourceLoader resourceLoader;
    private Area defaultArea;
    private Model areaModel;
    private String endpoint;
    private String cachePath;
    private double chunkSize;

    public AreaImporter(
            ResourceLoader resourceLoader,
            JenaService jenaService,
            QueryProvider queryProvider,
            ConfigProperties props,
            @Value("#{${explorer.core.query.sparql-endpoint}}") String endpoint,
            @Value("#{${explorer.recommend.cache-dir}}") String cachePath) {
        this.queryProvider = queryProvider;
        this.resourceLoader = resourceLoader;
        this.endpoint = endpoint;
        this.cachePath = cachePath;
        this.chunkSize = props.chunkSize;
        this.defaultArea = Area.of(props.neLat, props.neLng, props.swLat, props.swLng);
    }

    public Model get(Area area) {

        if (areaModel == null) {
            var cachedFilesLoaded = loadCache();
            if (cachedFilesLoaded < 1) {
                loadExternal(area);
            }
        }

        return areaModel;
    }

    public Model get() {
        return get(defaultArea);
    }

    private void loadExternal(Area area) {
        areaModel = ModelFactory.createDefaultModel();
        var subAreas = createSubAreas(area, chunkSize);

        for (int i = 0; i < subAreas.size(); i++) {
            if (i > 2) break;

            try {
                LOGGER.info("Retrieving info: {}/{}", i, subAreas.size());
                var model = describeArea(subAreas.get(i));

                if (cachePath != null && !cachePath.isEmpty()) {
                    new File(cachePath).mkdirs();
                    model.write(new FileOutputStream(cachePath + "/" + subAreas.get(i).midPoint().lat + " " + subAreas.get(i).midPoint().lng + ".nt"), "N-TRIPLE");
                }

                areaModel = ModelFactory.createUnion(areaModel, model);

            } catch (Exception e) {
                LOGGER.warn("Skipped sub area {}: {}", subAreas.get(i).midPoint(), e.getMessage());
            }
        }
    }

    private int loadCache() {
        areaModel = ModelFactory.createDefaultModel();
        try {
            new File(cachePath).mkdirs();
            var areaCache = ResourcePatternUtils.getResourcePatternResolver(resourceLoader).getResources("file:" + cachePath + "/**/*.nt");
            for (int i = 0, areaCacheLength = areaCache.length; i < areaCacheLength; i++) {
                Resource area = areaCache[i];
                LOGGER.info("Loading cache {}/{}: {}",i, areaCacheLength, area.getFilename());
                var stream = new FileInputStream(area.getFile());
                areaModel.read(stream, "", "N-TRIPLE");
                //var model = ModelFactory.createDefaultModel().read(stream, "", "N-TRIPLE");
                //areaModel = ModelFactory.createUnion(areaModel, model);
            }
            return areaCache.length;
        } catch (IOException e) {
            LOGGER.warn("Unable to load cache due to IO exception: {}", e.getMessage());
        }
        return 0;
    }

    private Model describeArea(Area area) {

        var query = queryProvider.getQuery(new ImportQuery(area.getNe(), area.getSw()));
        //return ModelFactory.createDefaultModel();
        try (var con = RDFConnection.connect(endpoint)) {
            return con.query(query).execDescribe();
        }
    }

    private int getTreeDepth(Area area) {
        var cs = (int) area.crossSection();
        return Math.floorDiv(cs, 5);
    }


    private List<Area> createSubAreas(Area container, double csTarget) {
        // if container is larger than target cross section break into smaller chunks and recurse
        if (container.crossSection() > csTarget) {

            // Divide into sections
            var middle = container.midPoint();
            var subAreas = List.of(
                    Area.of(container.getNe().lat, container.getNe().lng, middle.lat, middle.lng), //ne
                    Area.of(middle.lat, container.getNe().lng, container.getSw().lat, middle.lng), //se
                    Area.of(middle.lat, middle.lng, container.getSw().lat, container.getSw().lng), //sw
                    Area.of(container.getNe().lat, middle.lng, middle.lat, container.getSw().lng) //nw
            );

            var areas = new ArrayList<Area>();
            for (var a : subAreas) {
                areas.addAll(createSubAreas(a, csTarget));
            }

            return areas;
        }

        else return List.of(container);
    }

/*    public static void main(String[] args) {
        var i = new AreaImporter(null, 4000);
       //i.get(Area.of(10,10,0,0));
        var area = Area.of(57.1443733,-2.096472,57.1132776, -2.1501791);
       var s= i.createSubAreas(area, 2000);

        for (var sa : s) {
            System.out.println(area.intersects(sa));
        }

    }*/

}
