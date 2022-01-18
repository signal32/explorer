package com.curioustrout.explorer.server.user.dto;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Scope;

import java.util.Optional;
import java.util.UUID;

public class UserDto {

    private UUID id;
    private String fName;
    private String lName;
    private String username;
    private String email;
    private String password;


    public UserDto(UUID id, String fName, String lName, String username, String email, String password) {
        this.id = id;
        this.fName = fName;
        this.lName = lName;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    public UserDto() { }

    @Bean()
    @Scope("session")
    public UserDto userBean() {
        return new UserDto();
    }


    public Optional<UUID> getId() {
        return Optional.ofNullable(id);
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Optional<String> getfName() {
        return Optional.ofNullable(fName);
    }

    public void setfName(String fName) {
        this.fName = fName;
    }

    public Optional<String> getlName() {
        return Optional.ofNullable(lName);
    }

    public void setlName(String lName) {
        this.lName = lName;
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

    public Optional<String> getPassword() {
        return Optional.ofNullable(password);
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
