package com.curioustrout.explorer.server.user.controller;

import com.curioustrout.explorer.server.user.model.User;
import com.curioustrout.explorer.server.user.model.ExplorerUserDetails;
import com.curioustrout.explorer.server.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

/**
 *
 */
@RestController
@RequestMapping(value = "/public/user")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserController.class);

    private final UserRepository repository;

    public UserController(UserRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<User> PostUser(Principal principal, ExplorerUserDetails explorerUserDetails) {
        LOGGER.info(explorerUserDetails.getUsername().orElse("nope"));
        var user = repository.findById(explorerUserDetails.getId()).orElseGet(() -> User.withId(explorerUserDetails.getId()));
        user.setBiography("whooo");
        repository.save(user);

        return ResponseEntity.ok(user);
    }

    @PostMapping("/bio")
    public ResponseEntity<User> PostUserBio(@RequestBody String bio, ExplorerUserDetails explorerUserDetails) {
        var user = repository.findById(explorerUserDetails.getId()).orElseGet(() -> User.withId(explorerUserDetails.getId()));
        user.setBiography(bio);
        repository.save(user);

        return ResponseEntity.ok(user);
    }



    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        //return ResponseEntity.ok(repository.findAll());
        return ResponseEntity.of(Optional.empty());

    }
}
