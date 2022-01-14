package com.curioustrout.explorer.server.user.controller;

import com.curioustrout.explorer.server.user.dto.UserDto;
import org.jboss.resteasy.client.jaxrs.ResteasyClientBuilder;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.CreatedResponseUtil;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.authorization.client.AuthzClient;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import java.util.*;

@RestController
@RequestMapping(value = "/public/user-admin")
public class UserAdminController {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserAdminController.class);

    @Value("${keycloak.auth-server-url}")
    private static String authServerUrl;

    @Value("${keycloak.realm}")
    private static String realmName;

    @Value("${keycloak.resource}")
    public static String clientId;

    private static String clientSecret = "yeet";

    /**
     * Register a new user
     * @param user
     * @return
     */
    @RolesAllowed("admin")
    @PostMapping(path = "/new")
    public ResponseEntity<UserDto> newUser(@RequestBody UserDto user, UserDetails userDetails){
        Keycloak keycloak = KeycloakBuilder.builder()
            .serverUrl(authServerUrl)
            .grantType(OAuth2Constants.PASSWORD).realm("todo").clientId("todo")
            .username("admin").password("password")
            .resteasyClient(new ResteasyClientBuilder().connectionPoolSize(10).build())
            .build();

        keycloak.tokenManager().getAccessToken();

        var keycloakUser = new UserRepresentation();
        keycloakUser.setEnabled(true);
        keycloakUser.setUsername(user.getUsername().orElseThrow(() -> new NoSuchElementException("Username not provided")));
        keycloakUser.setFirstName(user.getfName().orElseThrow(() -> new NoSuchElementException("First name not provided")));
        keycloakUser.setLastName(user.getlName().orElseThrow(() -> new NoSuchElementException("Last name not provided")));
        keycloakUser.setEmail(user.getEmail().orElseThrow(() -> new NoSuchElementException("Email not provided")));

        var realm = keycloak.realm(realmName);
        var users = realm.users();
        var response = users.create(keycloakUser);

        if (response.getStatus() == 200){
            String id = CreatedResponseUtil.getCreatedId(response);
            LOGGER.info("Created user ID:{}", id);

            // Make password
            CredentialRepresentation credentials = new CredentialRepresentation();
            credentials.setTemporary(false);
            credentials.setType(CredentialRepresentation.PASSWORD);
            credentials.setValue(user.getPassword().orElseThrow(() -> new NoSuchElementException("Password not provided")));//todo

            // Apply to user account
            var userResource = users.get(id);
            userResource.resetPassword(credentials);

            var userRoles = realm.roles().get("todo").toRepresentation();
            userResource.roles().realmLevel().add(List.of(userRoles));

            return ResponseEntity.of(Optional.of(user));
        }
        else return ResponseEntity.internalServerError().build();
    }

    @PostMapping(path = "/login")
    public ResponseEntity<Object> login(@RequestBody UserDto user){
        Map<String, Object> clientCredentials = new HashMap<>();
        clientCredentials.put("secret", clientSecret);
        clientCredentials.put("grant_type", "password");

        var config = new org.keycloak.authorization.client.Configuration(authServerUrl, realmName, "clientid", clientCredentials,null);
        AuthzClient authzClient = AuthzClient.create(config);
        var username = user.getUsername().or(user::getEmail).orElseThrow(() -> new NoSuchElementException("Username or email not provided"));
        var password = user.getPassword().orElseThrow(() -> new NoSuchElementException("Password not provided"));
        var response = authzClient.obtainAccessToken(username, password);

        return ResponseEntity.of(Optional.of(response));
    }

/*    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public void create(@RequestBody UserDto newUser){
        LOGGER.info("user {} created with id {}", newUser.getName(), newUser.getId());
    }*/
}
