package com.duoduo.server.Controller;

import com.duoduo.server.Entity.UserEntity;
import com.duoduo.server.Repository.UserRepository;
import io.jsonwebtoken.Header;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;
import java.util.Date;
import java.util.Map;

@CrossOrigin(value = "*")
@RestController
public class OauthController {

    @Value("${spring.redis.host}")
    private String redirect_uri;

    @Autowired
    private UserRepository userRepository;

    @GetMapping(value = "/oauth/kakao")
    public JSONObject kakaoSignin(@RequestParam("code") String code) {
        try {
            System.out.println("ok");

            // create body
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "authorization_code");
            params.add("client_id", "5e490246777566659770531cd8719927");
            params.add("redirect_uri", redirect_uri);
            params.add("code", code);

            // create header
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Type", "application/x-www-form-urlencoded");
            // combine
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);
            RestTemplate rt = new RestTemplate();
            ResponseEntity<JSONObject> response = rt.exchange(
                    "https://kauth.kakao.com/oauth/token", //{요청할 서버 주소}
                    HttpMethod.POST, //{요청할 방식}
                    entity, // {요청할 때 보낼 데이터}
                    JSONObject.class
            );

            HttpHeaders headers1 = new HttpHeaders();
            headers1.add("Authorization", "Bearer " + response.getBody().get("access_token"));
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers1);
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<JSONObject> responseEntity = restTemplate.exchange("https://kapi.kakao.com/v2/user/me", HttpMethod.GET, requestEntity, JSONObject.class);
            System.out.println("#####################################");
            System.out.println(responseEntity.getBody().toString());
            JSONObject properties = new JSONObject((Map) responseEntity.getBody().get("properties"));
            System.out.println(properties);
            JSONObject kakao_account = new JSONObject((Map) responseEntity.getBody().get("kakao_account"));
            System.out.println(kakao_account);
            String kakaoEmail = (String) kakao_account.get("email");
            System.out.println(kakaoEmail);

            // 회원가입일 경우
//            // kakao (email, nickname) 정보를 이용해서 회원을 생성해야됨
            if (userRepository.findByEmail(kakaoEmail) == null) {
                System.out.println("SIGNUP");
                UserEntity user = UserEntity.builder()
                        .email(kakaoEmail)
                        .password("")
                        .nickname((String) properties.get("nickname"))
                        .build();
                userRepository.save(user);
                Date now = new Date();
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
                jsonObject.put("signup", true);
                return jsonObject;
            } else {
                System.out.println("SIGNIN");
                // 로그인일 경우
                // access
                UserEntity user = userRepository.findByEmail(kakaoEmail);
                Date now = new Date();
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
                jsonObject.put("signup", false);
                return jsonObject;
            }
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }


    }

}
