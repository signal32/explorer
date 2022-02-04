package com.curioustrout.explorer.gis.util;

/**
 * Parse an input of I to provide output O.
 * @param <I> Input type
 * @param <O> Output type
 */
public interface Parser<I, O> {

    O parse(I input);

}