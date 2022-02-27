package com.curioustrout.explorer.gis.util;

import com.curioustrout.explorer.core.query.SparqlQuery;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

public interface QueryConfig {

    default String getQueryName() {
        return this.getClass().getAnnotation(SparqlQuery.class).fileName();
    }

    static String getQueryName(Object object) {
        return object.getClass().getAnnotation(SparqlQuery.class).fileName();
    }


    default Map<String, Object> getConfig() throws IllegalAccessException {
        return getConfigUnsafe(this);
    }

    static Map<String,Object> getConfig(Object object) throws IllegalAccessException {

        assert (object.getClass().isAnnotationPresent(SparqlQuery.class));

        return getConfigUnsafe(object);

    }

    private static Map<String,Object> getConfigUnsafe(Object object) throws IllegalAccessException {
        Map<String, Object> map = new HashMap<>();

        Field[] fields = object.getClass().getDeclaredFields();
        for (var field : fields) {
            field.setAccessible(true);
            Object value = field.get(object);
            map.put(field.getName(), value);
        }

        return map;
    }
}

