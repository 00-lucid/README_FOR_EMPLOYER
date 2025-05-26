package com.duoduo.server.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

@Service
public class SecurityService {

    public String hashing(String password) {

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        return encoder.encode(password);
    }

    public boolean matches(String password, String hashed) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        return encoder.matches(password, hashed);
    }

}
