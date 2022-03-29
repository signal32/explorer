package com.curioustrout.explorer.recommend.processing;

import com.curioustrout.explorer.recommend.importer.AreaImporter;
import org.apache.jena.rdf.model.Model;
import org.deeplearning4j.models.embeddings.loader.WordVectorSerializer;
import org.deeplearning4j.models.word2vec.Word2Vec;
import org.deeplearning4j.text.sentenceiterator.CollectionSentenceIterator;
import org.deeplearning4j.text.sentenceiterator.SentencePreProcessor;
import org.deeplearning4j.text.tokenization.tokenizerfactory.DefaultTokenizerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.text.CharacterIterator;
import java.text.StringCharacterIterator;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

import org.deeplearning4j.models.word2vec.Word2Vec.Builder;

import javax.annotation.PostConstruct;

@Service
public class Word2VecRecommender implements IRRecommender {

    private static final Logger LOGGER = LoggerFactory.getLogger(Word2VecRecommender.class);
    public static final Pattern PATTERN = Pattern.compile("[QP]\\d*$");
    public static final String EXPORT_FILE_NAME = "cache.bin";

    private Word2Vec word2VecModel;
    private final String cachePath;
    private final AreaImporter areaImporter;

    public Word2VecRecommender(
            AreaImporter areaImporter,
            @Value("#{${explorer.recommend.cache-dir}}") String cachePath) {
        this.areaImporter = areaImporter;
        this.cachePath = cachePath + "word2vec/";
    }

    @PostConstruct
    public void postConstruct() {
        var model = areaImporter.get();
        setup(model);
    }

    public void setup(Model model) {
        // try to load from local
        System.out.println(cachePath + EXPORT_FILE_NAME);
        var file = new File(cachePath + EXPORT_FILE_NAME);

        try {
            if (false/*file.exists()*/) { //TODO disabled until some cache busting mechanism is added
                LOGGER.info("Using cached model found at {}{}", cachePath, EXPORT_FILE_NAME);
                word2VecModel = WordVectorSerializer.readWord2VecModel(file);
            } else {
                LOGGER.info("Cached model not found");
                train(model);
                file.getParentFile().mkdirs();
                if (file.createNewFile()) {
                    LOGGER.info("Saving model cache to {}{}", cachePath, EXPORT_FILE_NAME);
                    WordVectorSerializer.writeWord2VecModel(word2VecModel, file);
                    WordVectorSerializer.writeWordVectors(word2VecModel, cachePath + "vectors.txt");
                }
                else {
                    LOGGER.warn("Using in-memory only model: Unable to save");
                }
            }
        } catch (IOException e) {
            LOGGER.error("Could not setup model: {}", e.getMessage());
        }

    }

    public void train(Model model) throws IOException {
        var iter = new CollectionSentenceIterator(extractSentences(model));
        iter.setPreProcessor((SentencePreProcessor) (v) -> {return v;});

        var tokenizer = new DefaultTokenizerFactory();
        tokenizer.setTokenPreProcessor(this::encode);

        word2VecModel = new Builder()
                .minWordFrequency(5)
                .batchSize(5)
                .layerSize(512)
                //.seed(42)
                .windowSize(10)
                .iterate(iter)
                .tokenizerFactory(tokenizer)
                .build();

        LOGGER.info("Training Word2Vec model");
        word2VecModel.fit();
    }


    private List<String> extractSentences(Model model) {

        var list = new ArrayList<String>();

        model.getGraph().stream().forEach(t -> {
            try{

                if (stripIdFromUrl(t.getPredicate().toString()).orElseThrow().contains("P276")){
                    LOGGER.info("Skipping location property");
                }
                else {

                    list.add(
                            stripIdFromUrl(t.getObject().toString()).orElseThrow() + " " +
                                    stripIdFromUrl(t.getPredicate().toString()).orElseThrow() + " " +
                                    stripIdFromUrl(t.getObject().toString()).orElseThrow());
                }
            }
            catch (Exception ignored) {} //suppress
        });

        //list.forEach(System.out::println);
        LOGGER.info("Extracted {} triples sentences", list.size());

        return list;
    }

    private String encode(String input) {
        var builder = new StringBuilder();
        var it = new StringCharacterIterator(input);
        while (it.current() != CharacterIterator.DONE) {
            char c = it.current();
            builder.append(switch (c) {
                case '0' -> 'a';
                case '1' -> 'b';
                case '2' -> 'c';
                case '4' -> 'd';
                case '5' -> 'e';
                case '6' -> 'f';
                case '7' -> 'g';
                case '8' -> 'h';
                case '9' -> 'i';
                default -> Character.toLowerCase(c);
            });
            it.next();
        }
        return builder.toString();
    }

    private String decode(String input) {
        var builder = new StringBuilder();
        var it = new StringCharacterIterator(input);
        while (it.current() != CharacterIterator.DONE) {
            char c = it.current();
            builder.append(switch (c) {
                case 'a' -> '0';
                case 'b' -> '1';
                case 'c' -> '2';
                case 'd' -> '4';
                case 'e' -> '5';
                case 'f' -> '6';
                case 'g' -> '7';
                case 'h' -> '8';
                case 'i' -> '9';
                default -> Character.toUpperCase(c);
            });
            it.next();
        }
        return builder.toString();
    }

    private Optional<String> stripIdFromUrl(String url) {
        var m = PATTERN.matcher(url);

        if (m.find()) {
            return Optional.ofNullable(m.group());
        }
        else return Optional.empty();
    }

    @Override
    public Collection<String> recommendFor(String entity, int limit) {
        if (word2VecModel == null) {
            LOGGER.warn("Word2Vec model has not been initialised");
            return List.of();
        }

        return word2VecModel.wordsNearest(encode(entity), limit)
                .stream()
                .map(this::decode)
                .toList();
    }

    public static void main(String[] args) {
        var instance = new Word2VecRecommender(null, "");
        //instance.encode('Q17770890')
    }
}
