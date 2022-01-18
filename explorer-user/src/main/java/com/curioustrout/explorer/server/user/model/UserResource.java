package com.curioustrout.explorer.server.user.model;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.net.URI;
import java.util.UUID;

/**
 * A resource that belongs to a user
 */
@Entity
public class UserResource {

    public enum ResourceType {
        /**
         * Shared resources may be depended upon by multiple agents.
         */
        SHARED,
        /**
         * An owned resource is depended upon only by its owner.
         */
        OWNED,
    }

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Size(max = 50)
    @Column(name = "name", nullable = false)
    private String name;

    @NotBlank
    @Column(name = "type", nullable = false)
    private ResourceType type;

    @Column(name = "resource_server", nullable = false)
    private URI resourceServer;

    public UserResource(UUID id, String name, ResourceType type, URI resourceServer) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.resourceServer = resourceServer;
    }

    public UserResource() { }


    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public URI getResourceServer() {
        return resourceServer;
    }

    public void setResourceServer(URI resourceServer) {
        this.resourceServer = resourceServer;
    }
}
