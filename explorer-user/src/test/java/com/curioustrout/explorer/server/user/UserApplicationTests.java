package com.curioustrout.explorer.server.user;

import io.restassured.RestAssured;
import io.restassured.response.Response;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.Map;

@SpringBootTest
class UserApplicationTests {
    private final static String AUTH_SERVER = "http://localhost:8083/auth/realms/baeldung/protocol/openid-connect";
    private final static String RESOURCE_SERVER = "http://localhost:8081/resource-server";
    private final static String REDIRECT_URL = "http://localhost:8082/new-client/login/oauth2/code/custom";
    private final static String CLIENT_ID = "newClient";
    private final static String USERNAME = "john@test.com";
    private final static String PASSWORD = "123";

/*    @Test
    public void yeet(){
        String accessToken =
    }*/

    private String obtainAccessToken(String clientId, String username, String password){
        String authUrl = AUTH_SERVER + "/auth";

        Map<String, String> loginParams = new HashMap<String, String>();
        loginParams.put("grant_type", "implicit");
        loginParams.put("client_id", clientId);
        loginParams.put("response_type", "token");
        loginParams.put("redirect_uri", REDIRECT_URL);
        loginParams.put("scope", "read write");

        Response response = RestAssured.given().formParams(loginParams).get(authUrl);
        String cookieValue = response.getCookie("AUTH_SESSION_ID");
        String authUrlCode = response.htmlPath().getString("'**'.find{node -> node.name()=='form'}*.@action"); //wtf is this???

        Map<String, String> tokenParams = new HashMap<>();
        tokenParams.put("username", username);
        tokenParams.put("password", password);
        tokenParams.put("client_id", clientId);
        tokenParams.put("redirect_uri", REDIRECT_URL);
        response = RestAssured.given().cookie("AUTH_SESSION_ID", cookieValue).formParams(tokenParams).post(authUrlCode);

        return response.jsonPath().getString("access_token");
    }
}
