package com.curioustrout.explorer.server.user.model;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.SessionScope;

import java.io.Serializable;

@Component
@SessionScope
public class SessionTest implements Serializable {
    private static final Logger LOGGER = LoggerFactory.getLogger(SessionTest.class);
    private static int counter = 0;

    public String yeet() {
        return "yeet";
    }

    public SessionTest() {
        LOGGER.error("Hello from new session! {}", counter++);
    }
}
