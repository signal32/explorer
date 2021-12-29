package com.curioustrout.explorer.server.user.controller;

import com.curioustrout.explorer.server.user.model.User;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.jboss.resteasy.client.jaxrs.ResteasyClientBuilder;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.CreatedResponseUtil;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.authorization.client.AuthzClient;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(value = "/user")
public class UserController {

    private static final Logger LOGGER = LogManager.getLogger(UserController.class);

    @Value("${keycloak.auth-server-url}")
    private static String authServerUrl;

    @Value("${keycloak.realm}")
    private static String realmName;

    @Value("${keycloak.resource}")
    public static String clientId;

    private static String clientSecret = "yeet";

    @PostMapping(path = "/new")
    public ResponseEntity<User> newUser(@RequestBody User user){
        Keycloak keycloak = KeycloakBuilder.builder().serverUrl(authServerUrl)
                .grantType(OAuth2Constants.PASSWORD).realm("todo").clientId("todo")
                .username("admin").password("password")
                .resteasyClient(new ResteasyClientBuilder().connectionPoolSize(10).build())
                .build();

        keycloak.tokenManager().getAccessToken();

        var keycloakUser = new UserRepresentation();
        keycloakUser.setEnabled(true);
        keycloakUser.setUsername(user.getName());
        keycloakUser.setFirstName("Fname");
        keycloakUser.setLastName("Lname");
        keycloakUser.setEmail("test@example.com");

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
            credentials.setValue("yeet");//todo

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
    public ResponseEntity<Object> login(@RequestBody User user){
        Map<String, Object> clientCredentials = new HashMap<>();
        clientCredentials.put("secret", clientSecret);
        clientCredentials.put("grant_type", "password");

        var config = new org.keycloak.authorization.client.Configuration(authServerUrl, realmName, "clientid", clientCredentials,null);
        AuthzClient authzClient = AuthzClient.create(config);
        var response = authzClient.obtainAccessToken("email", "password");

        return ResponseEntity.of(Optional.of(response));
    }

    @GetMapping
    public List<User> getAll(){
        var users = new ArrayList<User>();
        users.add(new User(1,"one"));
        users.add(new User(2,"four"));
        users.add(new User(3,"three"));
        return users;
    }

    @GetMapping(value = "/{id}")
    public User findOne(@PathVariable Long id){
        return new User(id, "test");
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public void create(@RequestBody User newUser){
        LOGGER.info("user {} created with id {}", newUser.getName(), newUser.getId());
    }
}
