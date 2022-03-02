package com.curioustrout.explorer.recommend.controller;

import com.curioustrout.explorer.recommend.processing.Word2VecRecommender;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Optional;

@RestController
@RequestMapping(value = "/public/recommend")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RecommendController {

    Word2VecRecommender recommender;

    public RecommendController(Word2VecRecommender recommender) {
        this.recommender = recommender;
    }

    @GetMapping()
    public ResponseEntity<Collection<String>> getRecommendForEntity(@RequestParam String entity, @RequestParam Optional<Integer> limit) {
        var result = recommender.recommendFor(entity, limit.orElse(10));
        return ResponseEntity.ok(result);
    }
}
