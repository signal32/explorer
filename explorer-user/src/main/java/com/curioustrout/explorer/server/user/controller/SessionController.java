package com.curioustrout.explorer.server.user.controller;

import com.curioustrout.explorer.server.user.model.SessionTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController()
@RequestMapping("/session")
public class SessionController {

    @Autowired
    SessionTest sessionTest;


    @GetMapping()
    public String get(){
        return "no" + sessionTest.yeet();
    }

}
