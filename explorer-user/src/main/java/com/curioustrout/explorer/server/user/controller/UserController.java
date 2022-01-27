package com.curioustrout.explorer.server.user.controller;

import com.curioustrout.explorer.server.user.model.User;
import com.curioustrout.explorer.server.user.model.ExplorerUserDetails;
import com.curioustrout.explorer.server.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import java.security.Principal;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

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
        var user = repository.findById(explorerUserDetails.getId().orElseThrow()).orElseGet(() -> User.withId(explorerUserDetails.getId().orElseThrow()));
        user.setBiography("whooo");
        repository.save(user);

        return ResponseEntity.ok(user);
    }

    /**
     * Set new or update existing {@link User} biography attribute
     * @param bio Biography of max 255 characters
     * @return Updated {@link User} instance
     */
    @RolesAllowed("app-user")
    @PostMapping("/bio")
    public ResponseEntity<User> PostUserBio(@RequestBody String bio, ExplorerUserDetails explorerUserDetails) {
        var user = repository.findById(explorerUserDetails.getId().orElseThrow()).orElseGet(() -> User.withId(explorerUserDetails.getId().orElseThrow()));
        user.setBiography(bio);
        repository.save(user);

        return ResponseEntity.ok(user);
    }

    /**
     * Get user details
     * @param userDetails
     * @return
     */
    @RolesAllowed("app-user")
    @GetMapping
    public ResponseEntity<User> getUserDetails(ExplorerUserDetails userDetails) {
        LOGGER.info("Hello from protected endpoint!");
        var user = repository.findById(userDetails.getId().orElseThrow()).orElseThrow(NoSuchElementException::new);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/id")
    public ResponseEntity<User> getUserDetailsById(@RequestParam UUID id) {
        var user = repository.findById(id).orElseThrow(NoSuchElementException::new);
        return ResponseEntity.ok(user);
    }



/*    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        //return ResponseEntity.ok(repository.findAll());
        return ResponseEntity.of(Optional.empty());

    }*/
}
