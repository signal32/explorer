package com.curioustrout.explorer.server.user.model;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.*;


@Entity
public class User {

    @Id
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_resource_id")
    private UserResource profileImage;

    @OneToMany(mappedBy = "id")
    private List<UserResource> resources = new ArrayList<>();

    public User(UUID id, String fName, String lName, String username, String email, UserResource profileImage, List<UserResource> resources) {
        this.id = id;
        this.profileImage = profileImage;
        this.resources = resources;
    }

    public User(String fname, String lName, String username) {
        this(UUID.randomUUID(), fname, lName, username, "", null, null);
    }

    public User() { }


    public void setId(UUID id) {
        this.id = id;
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
