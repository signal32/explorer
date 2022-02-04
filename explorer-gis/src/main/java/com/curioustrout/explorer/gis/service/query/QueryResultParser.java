package com.curioustrout.explorer.gis.service.query;

import com.curioustrout.explorer.gis.util.Parser;
import org.apache.jena.query.ResultSet;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QueryResultParser implements Parser<ResultSet, List<Map<String, String>>> {

    @Override
    public List<Map<String, String>> parse(ResultSet solution) {
        List<Map<String, String>> items = new ArrayList<>();

        while (solution.hasNext()) {
            Map<String, String> map = new HashMap<>();
            var item = solution.next();
            var props = item.varNames();

            while (props.hasNext()){
                var prop = props.next();
                map.put(prop, item.get(prop).toString());
            }

            items.add(map);
        }
        return items;
    }
}
