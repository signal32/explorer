package com.curioustrout.explorer.recommend;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "explorer.recommend")
@ConstructorBinding
public record ConfigProperties (
        String chunkSize,
        String cacheDir
){ }
