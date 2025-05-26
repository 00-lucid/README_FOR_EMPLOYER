package com.duoduo.server.Repository;

import lombok.Data;

@Data
public class UserListDTO {
    private String puuid;
    private String username;
    private String nickname;
    private String position;
    private String tier;
    private Integer total_wins;
    private Integer total_losses;
    private Integer total_rate;
    private Integer profileIconId;
    private Integer summonerLevel;
    private String text;
    private boolean mic;
}
