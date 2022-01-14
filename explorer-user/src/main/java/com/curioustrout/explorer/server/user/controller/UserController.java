package com.curioustrout.explorer.server.user.controller;

import com.curioustrout.explorer.server.user.model.User;
import com.curioustrout.explorer.server.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        //return ResponseEntity.ok(repository.findAll());
        return ResponseEntity.of(Optional.empty());

    }
}
