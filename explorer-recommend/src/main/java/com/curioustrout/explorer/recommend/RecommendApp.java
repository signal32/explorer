package com.curioustrout.explorer.recommend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication(scanBasePackages = "com.curioustrout.explorer")
@ConfigurationPropertiesScan
public class RecommendApp {
    public static void main(String[] args) {
        SpringApplication.run(RecommendApp.class, args);
    }
}
