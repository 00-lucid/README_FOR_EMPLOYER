package com.duoduo.server.Repository;

import lombok.Data;

@Data
public class LoginDTO {
    private String email;
    private String password;
    private String nickname;
    private String riotname;
}