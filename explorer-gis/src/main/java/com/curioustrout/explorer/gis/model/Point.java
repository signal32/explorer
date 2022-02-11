package com.curioustrout.explorer.gis.model;

import com.curioustrout.explorer.gis.util.Position;
import org.apache.jena.datatypes.BaseDatatype;
import org.apache.jena.datatypes.DatatypeFormatException;
import org.apache.jena.datatypes.RDFDatatype;
import org.apache.jena.graph.impl.LiteralLabel;

import java.util.regex.Pattern;

/**
 * Custom RDF DataType use to automaticaly translate between a {@link Position}
 * and wktliteral ("Point(lng, lat)" syntax) in Apache Jena.
 */
public class Point extends BaseDatatype {

    public static final String TYPE_URI = "http://www.opengis.net/ont/geosparql#wktLiteral"; //todo tie this to sparql.properties file
    public static final String REGEX = "[\\d&.&-]+";
    public static final RDFDatatype INSTANCE = new Point();

    private final Pattern pattern;

    private Point() {
        super(TYPE_URI);

        this.pattern = Pattern.compile(REGEX, Pattern.MULTILINE);
    }

    @Override
    public String unparse(Object value) {
        Position pos = (Position) value;
        return String.format("Point(%s,%s)", pos.lat, pos.lng);
    }

    @Override
    public Position parse(String lexicalForm) throws DatatypeFormatException {
        var matcher = pattern.matcher(lexicalForm);
        double[] vec = {0,0};
        int i = -1;
        while (matcher.find() && 2 > ++i) {
            vec[i] = Double.parseDouble(matcher.group(0));
        }
        return new Position(vec[0], vec[1]);
    }

    @Override
    public Class<?> getJavaClass() {
        return Position.class;
    }

    @Override
    public boolean isEqual(LiteralLabel litLabel1, LiteralLabel litLabel2) {
        return super.isEqual(litLabel1, litLabel2);
    }
}
