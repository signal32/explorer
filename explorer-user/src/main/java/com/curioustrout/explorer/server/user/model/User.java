package com.curioustrout.explorer.server.user.model;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.*;

/**
 * Represents user details specific to Explorer.
 * Core personal information such as name, username, email etc. should be retrieved from the authentication provider and not stored here.
 */
@Entity
public class User {

    @Id
    private UUID id;

    @Size(max = 255)
    private String biography;

    @ManyToOne
    @JoinColumn(name = "user_resource_id")
    private UserResource profileImage;

    @OneToMany(mappedBy = "id")
    private List<UserResource> resources = new ArrayList<>();

    public User(UUID id, String biography, UserResource profileImage, List<UserResource> resources) {
        this.id = id;
        this.biography = biography;
        this.profileImage = profileImage;
        this.resources = resources;
    }

    public User() { }

    public static User withId(UUID id) {
        var user = new User();
        user.id = id;
        return user;
    }


    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getId() {
        return id;
    }

    public Optional<String> getBiography() {
        return Optional.ofNullable(biography);
    }

    public void setBiography(String biography) {
        this.biography = biography;
    }

    public Optional<UserResource> getProfileImage() {
        return Optional.ofNullable(profileImage);
    }

    public void setProfileImage(UserResource profileImage) {
        this.profileImage = profileImage;
    }

    public Optional<List<UserResource>> getResources() {
        return Optional.ofNullable(resources);
    }

    public void setResources(List<UserResource> resources) {
        this.resources = resources;
    }
}
