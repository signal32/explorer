package com.curioustrout.explorer.server.user.model;

import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.util.Optional;
import java.util.UUID;
//https://stackoverflow.com/questions/49105290/how-to-get-userinfo-in-springboot-using-keycloak
@Component
@RequestScope
public class ExplorerUserDetails {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExplorerUserDetails.class);
    
    private UUID id;
    private String username;
    private String email;


    public ExplorerUserDetails() {
        var context = SecurityContextHolder.getContext();
        var authToken = (KeycloakAuthenticationToken) context.getAuthentication();
        var accessToken = authToken.getAccount().getKeycloakSecurityContext().getToken();

        this.id = UUID.fromString(accessToken.getId());
        this.username = accessToken.getPreferredUsername();
        this.email = accessToken.getEmail();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Optional<String> getUsername() {
        return Optional.ofNullable(username);
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Optional<String> getEmail() {
        return Optional.ofNullable(email);
    }

    public void setEmail(String email) {
        this.email = email;
    }

/*    @Bean
    @RequestScope
    public UserDetails sessionUserDetails() {
        var context = SecurityContextHolder.getContext();
        var authToken = (KeycloakAuthenticationToken) context.getAuthentication();
        var accessToken = authToken.getAccount().getKeycloakSecurityContext().getToken();

        LOGGER.info("Running user bean");
    }*/
}
