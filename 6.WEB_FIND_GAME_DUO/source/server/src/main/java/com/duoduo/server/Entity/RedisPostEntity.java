package com.duoduo.server.Entity;

import lombok.Getter;
import org.springframework.data.redis.core.RedisHash;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

@Getter
@RedisHash(value = "post")
public class RedisPostEntity {

    @Id
    private Long id;
    private String title;
    private String nickname;
    private String body;
    private String createdAt;

    public RedisPostEntity(String title, String nickname, String body) {
        this.title = title;
        this.nickname = nickname;
        this.body = body;
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss a", Locale.ENGLISH);
        this.createdAt = simpleDateFormat.format(new Date());
    }

}
