package com.curioustrout.explorer.server.user.repository;

import com.curioustrout.explorer.server.user.model.UserResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserResourceRepository extends CrudRepository<UserResource, UUID> {
}
