package com.curioustrout.explorer.server.auth;

import com.curioustrout.explorer.server.auth.config.KeycloakServerProperties;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseAutoConfiguration;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Bean;

/**
 * Embedded Keycloak server.
 * Inspired by:
 * https://www.baeldung.com/keycloak-embedded-in-spring-boot-app
 * https://github.com/Baeldung/spring-security-oauth/tree/master/oauth-rest/oauth-authorization-server
 */
@SpringBootApplication(exclude = LiquibaseAutoConfiguration.class)
@EnableConfigurationProperties(KeycloakServerProperties.class)
public class AuthenticationApplication {

    private static final Logger LOGGER = LogManager.getLogger(AuthenticationApplication.class);
    
    public static void main(String[] args) {
        SpringApplication.run(AuthenticationApplication.class, args);
    }

    @Bean
    ApplicationListener<ApplicationReadyEvent> onAppReadyListener(ServerProperties properties, KeycloakServerProperties kcProperties) {
        return (evt) -> {
            var port = properties.getPort();
            var path = kcProperties.getContextPath();

            LOGGER.info("Embedded Keycloak has started: http://localhost:{}{}", port,path);
        };
    }
}
