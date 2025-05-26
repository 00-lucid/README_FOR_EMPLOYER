package com.duoduo.server.Repository;

import lombok.Data;

@Data
public class PostDTO {
    private Long id;
    private String title;
    private String body;
    private String nickname;
    private String createdAt;
    private int likeCount;
}
