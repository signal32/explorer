package com.curioustrout.explorer.server.auth.config;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.keycloak.Config;
import org.keycloak.models.KeycloakSession;
import org.keycloak.representations.idm.RealmRepresentation;
import org.keycloak.services.managers.ApplianceBootstrap;
import org.keycloak.services.managers.RealmManager;
import org.keycloak.services.resources.KeycloakApplication;
import org.keycloak.services.util.JsonConfigProviderFactory;
import org.keycloak.util.JsonSerialization;
import org.springframework.core.io.ClassPathResource;

import java.util.NoSuchElementException;


public class EmbeddedKeycloakApplication extends KeycloakApplication {

    private static final Logger LOGGER = LogManager.getLogger(EmbeddedKeycloakApplication.class);
    static KeycloakServerProperties serverProperties;

    @Override
    protected void loadConfig() {
        JsonConfigProviderFactory factory = new EmptyJsonConfigProviderFactory();
        Config.init(factory.create().orElseThrow(() -> new NoSuchElementException("No value present")));
    }

    /**
     * Default initialisation of Explorer Keycloak application.
     */
    public EmbeddedKeycloakApplication(){
        createMasterRealmAdminUser();
        createRealm();
    }

    /**
     * Creates an admin user for keycloak from configuration files.
     */
    private void createMasterRealmAdminUser(){
        var session = getSessionFactory().create();
        var applianceBootstrap = new ApplianceBootstrap(session);
        var admin = serverProperties.getAdminUser();
        try {
            LOGGER.info("admin: {}, password: {}", admin.getUsername(), admin.getPassword());
            session.getTransactionManager().begin();
            applianceBootstrap.createMasterRealmUser(admin.getUsername(), admin.getPassword());
            session.getTransactionManager().commit();
        }
        catch (Exception e){
            LOGGER.warn("Failed to create keycloak master admin user: {}", e.getMessage());
            session.getTransactionManager().rollback();
        }
        session.close();
    }

    /**
     * Creates realm for Explorer using JSON configuration.
     */
    private void createRealm(){
        KeycloakSession session = getSessionFactory().create();
        try{
            session.getTransactionManager().begin();
            var manager = new RealmManager(session);
            var realmImport = new ClassPathResource(serverProperties.getRealmImportFile());

            manager.importRealm(JsonSerialization.readValue(realmImport.getInputStream(), RealmRepresentation.class));
            session.getTransactionManager().commit();

        }
        catch (Exception e){
            LOGGER.warn("Failed to import Realm json file: {}", e.getMessage());
        }
        session.close();
    }
}
