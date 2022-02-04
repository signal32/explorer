package com.curioustrout.explorer.gis.util;

import java.util.concurrent.CompletableFuture;


/**
 * Fetch and return an abstract result using provided config.
 * @param <R> Result type
 * @param <C> Fetch request configuration type
 */
public interface Fetcher<R, C> {

    R fetch(C config);

    default <P> P fetchAndParse(C config, Parser<R, P> parser) {
        var result = fetch(config);
        return parser.parse(result);
    }

    default CompletableFuture<R> fetchAsync(C config) {
        return CompletableFuture.supplyAsync(() -> fetch(config));
    }

}

/**
 * Fetch and return an abstract result using provided config.
 * Can use default parser to process results.
 * @param <R> Result type
 * @param <C> Fetch request configuration type
 * @param <O> Output type of default parser
 */
interface FetcherParser<R, C, O> extends Fetcher<R, C> {

    Parser<R, O> getDefaultParser();

    default O fetchAndParse(C config) {
        return fetchAndParse(config, getDefaultParser());
    }

}
