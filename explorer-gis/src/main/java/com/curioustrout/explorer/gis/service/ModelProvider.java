package com.curioustrout.explorer.gis.service;

import com.curioustrout.explorer.gis.geo.Area;
import com.curioustrout.explorer.gis.geo.Quad;
import com.curioustrout.explorer.gis.service.query.GeoQueryConfig;
import com.curioustrout.explorer.gis.util.Fetcher;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Maintains a quad-tree {@link Model} instances with a geolocation ready for use.
 * Will return a new Model covering the area requested. If this necessitates first
 * retrieving that models data from another source this will be attempted first.
 * Async methods are provided to prevent blocking calls and should be used where possible.
 *
 * Data for models is pulled from all Spring Beans of type {@link Fetcher<Model,GeoQueryConfig>}.
 */
@Service
public class ModelProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(ModelProvider.class);

    private final List<Fetcher<Model, GeoQueryConfig>> retrievers;
    private final Quad<ModelData> modelTree;

    public ModelProvider(List<Fetcher<Model, GeoQueryConfig>> retrievers) {
        this.retrievers = retrievers;
        this.modelTree = Quad.createRoot(new ModelData(null), 25);
    }

    /**
     * Get a geolocation specific model.
     * @param area The area over which this model should have data.
     * @return A potential union of multiple models.
     */
    public Model getModel(Area area){
        // Attempt to fetch existing models from the quad-tree.
        var models = modelTree
                .find(area, depthFromAreaSize(area))
                .stream().map(quad -> quad.get().getModel()).toList();

        // An empty list implies that there are no quadrants for this location, thus we must create them.
        if (models.isEmpty()){
            models = modelTree.findOrCreate(area, 12)
                    .parallelStream()
                    .map(this::updateQuadModel)
                    .map(quad -> quad.get().getModel()).toList();
        }

        // Models must be merged together for querying
        return models.get(0);
        //return mergeModels(models);
    }

    public CompletableFuture<Model> getModelAsync(Area area) {
        return CompletableFuture.supplyAsync( () -> getModel(area));
    }

    /**
     * Updates a {@link Quad <ModelData>} for the given {@link Area},
     * populates with data and adds it to the tree.
     * @param quad Quad to update
     * @return Reference to the Quad.
     */
    private Quad<ModelData> updateQuadModel(Quad<ModelData> quad) {
        var modelList = new ArrayList<Model>();

        var config = new GeoQueryConfig(null, quad.asArea(), quad.getDepth());

        retrievers.parallelStream().forEach(retriever -> {
            modelList.add(retriever.fetch(config));
        });

        var model = modelList.get(0);//mergeModels(modelList);
        quad.set(new ModelData(model));
        return quad;
    }

    /**
     * Get the minimum depth (detail) required for an area by the size
     * of its cross-section.
     * @return Depth index for use in modelTree
     */
    private int depthFromAreaSize(Area area){
        var distance = area.crossSection();
        if (distance > 1000) return 5;
        if (distance >  500) return 10;
        if (distance >  250) return 15;
        if (distance >  100) return 20;
        else return 0;
    }

    /**
     * Create a new Model that is a union of the provided models.
     * New model references old models and does not copy values.
     */
    private Model mergeModels(Collection<Model> models) {
        var newModel = ModelFactory.createDefaultModel();
        for (var model : models ){
            newModel = ModelFactory.createUnion(newModel, model);
        }
        return newModel;
    }
}
