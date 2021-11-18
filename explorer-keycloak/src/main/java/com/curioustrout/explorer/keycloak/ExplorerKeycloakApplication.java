package com.curioustrout.explorer.keycloak;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseAutoConfiguration;

/**
 * Embedded Keycloak server.
 * Configuration inspired by https://gist.github.com/thomasdarimont/7f9fb18c5176f6364fbbb13f5e7cd214
 */
@SpringBootApplication(exclude = LiquibaseAutoConfiguration.class)
public class ExplorerKeycloakApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExplorerKeycloakApplication.class, args);
    }

}
