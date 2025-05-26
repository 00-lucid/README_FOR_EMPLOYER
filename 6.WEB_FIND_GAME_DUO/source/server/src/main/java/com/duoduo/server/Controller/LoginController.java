package com.duoduo.server.Controller;

import com.duoduo.server.Entity.UserEntity;
import com.duoduo.server.Entity.UserNameEntity;
import com.duoduo.server.Repository.LoginDTO;
import com.duoduo.server.Repository.UserNameRepository;
import com.duoduo.server.Repository.UserRepository;
import com.duoduo.server.Service.JsonWebTokenService;
import com.duoduo.server.Service.SecurityService;
import io.jsonwebtoken.*;
import org.json.simple.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.Date;
import java.util.HashMap;


@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
public class LoginController {

    @Autowired
    private JsonWebTokenService jsonWebTokenService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserNameRepository userNameRepository;

    @GetMapping(value = "/")
    public String getVoid() {
        return "hello duoduo server";
    }

    @PostMapping(value = "/signin")
    public JSONObject signin(@RequestBody(required = true) LoginDTO data, HttpServletResponse response) {
        SecurityService securityService = new SecurityService();

        try {
            Date now = new Date();
            // TODO: password에 hashing 적용해야 됨
            UserEntity user = userRepository.findByEmail(data.getEmail());
            boolean isOk = securityService.matches(data.getPassword(), user.getPassword());
            if (isOk) {
                JSONObject jsonObject = new JSONObject();

                String jwt =  Jwts.builder()
                        .setHeaderParam(Header.TYPE, Header.JWT_TYPE)
                        .setIssuer("duoduo")
                        .setIssuedAt(now)
                        .setExpiration(new Date(now.getTime() + Duration.ofHours(12).toMillis()))
                        .claim("id", user.getId())
                        .signWith(SignatureAlgorithm.HS256, "secret")
                        .compact();


                jsonObject.put("token", jwt);
                jsonObject.put("nickname", user.getNickname());
                System.out.println(jsonObject);
                return jsonObject;
            }
            return null;
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    @PostMapping(value = "/signup")
    public String signup(@RequestBody(required = true) LoginDTO data) {
        SecurityService securityService = new SecurityService();
        try {

            if (userRepository.findByEmail(data.getEmail()) != null || userRepository.findByNickname(data.getNickname()) != null) {
                return null;
            }

            UserEntity user = UserEntity.builder()
                    .email(data.getEmail())
                    .password(securityService.hashing(data.getPassword()))
                    .nickname(data.getNickname())
                    .build();

            userRepository.save(user);
            return "success";
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    @PostMapping(value = "/username")
    public JSONObject createUsername(@RequestBody(required = true) HashMap<String, String> map, @RequestHeader("Authorization") String data) {
        JSONObject jsonObject = new JSONObject();
        try{
            Long id = jsonWebTokenService.decodeId(data);
            // createusernameentity
            UserEntity user =  jsonWebTokenService.verifyId(id);
            UserNameEntity userName =  UserNameEntity.builder()
                            .userId(user)
                            .username(map.get("username"))
                            .build();
            userNameRepository.save(userName);

            jsonObject.put("username", userName.getUsername());
            return jsonObject;
        } catch (Exception e) {
            return null;
        }
    }

    @PostMapping("/emailConfirm")
    public ResponseEntity emailConfirm(@RequestBody(required = true) JSONObject data) throws Exception {
        return null;
    };

}

