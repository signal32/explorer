package com.curioustrout.explorer.recommend.processing;

import java.util.Collection;

public interface IRecomender {

    Collection<String> recommendFor(String entity, int limit);
}
