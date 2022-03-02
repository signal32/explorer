package com.curioustrout.explorer.gis;

import com.curioustrout.explorer.gis.config.Properties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication(scanBasePackages = "com.curioustrout.explorer.core.query.service")
@EnableConfigurationProperties(Properties.class)
public class GisServer {
    public static void main(String[] args) {
        SpringApplication.run(GisServer.class, args);
    }
}
