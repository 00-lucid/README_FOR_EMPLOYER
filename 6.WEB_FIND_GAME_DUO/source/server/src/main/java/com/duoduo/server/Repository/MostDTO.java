package com.duoduo.server.Repository;

import lombok.Data;

@Data
public class MostDTO implements Comparable<MostDTO>{
    private String championName;
    private int count;
    private int wins;
    private Long kills;
    private Long deaths;
    private Long assists;

    public MostDTO(String championName, int count, int wins, Long kills, Long deaths, Long assists) {
        this.championName = championName;
        this.count = count;
        this.wins = wins;
        this.kills = kills;
        this.deaths = deaths;
        this.assists = assists;
    }

    @Override
    public int compareTo(MostDTO o) {
        if (o.count < count) {
            return 1;
        } else if (o.count > count) {
            return -1;
        }

        return 0;
    }
}
