package com.curioustrout.explorer.recommend.processing;

import java.util.Collection;

public interface IRRecommender {

    Collection<String> recommendFor(String entity, int limit);
}
