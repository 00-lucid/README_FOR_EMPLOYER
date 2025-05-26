package com.duoduo.server.Entity;

import lombok.*;

import javax.persistence.*;

@Entity(name = "userpost")
@Getter
@NoArgsConstructor
@ToString
public class UserPostEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user")
    private UserEntity userId;

    @ManyToOne
    @JoinColumn(name = "post")
    private PostEntity postId;

    @Builder
    public UserPostEntity(UserEntity user, PostEntity post) {
        this.userId = user;
        this.postId = post;
    }
}
