package com.curioustrout.explorer.server.user.controller;

import com.curioustrout.explorer.server.user.model.User;
import com.curioustrout.explorer.server.user.model.UserResource;
import org.keycloak.adapters.spi.KeycloakAccount;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.security.Principal;
import java.util.UUID;

@RestController
public class AuthTestController {

    @GetMapping(path = "/test")
    //@PreAuthorize("hasRole('USER')") //todo fix inability to authenticate issue when using pre/post auth annotations
    //@Secured("ROLE_explorer-user")
    public ResponseEntity<User> test(Principal principal){
        System.out.println(principal.getName());
        new UserResource(UUID.randomUUID(), "name", UserResource.ResourceType.SHARED, URI.create("ok"));
        return ResponseEntity.ok(new User("John", "Smith", "johnyboy69"));
    }

    @GetMapping(path = "/hello")
    public ResponseEntity<String> hello(Authentication auth) {
        return ResponseEntity.ok(auth.getName());
    }
}
