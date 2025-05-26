package com.duoduo.server.Entity;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.persistence.*;
import javax.xml.stream.events.Comment;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

@Entity(name = "comment")
@Getter
@NoArgsConstructor
@ToString
public class CommentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user")
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post")
    private PostEntity post;

    @Column
    private String text;

    @Column
    private String createdAt;

    @Builder
    public CommentEntity(UserEntity user, PostEntity post, String text) {
        this.user = user;
        this.post = post;
        this.text = text;
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss a", Locale.ENGLISH);
        this.createdAt = simpleDateFormat.format(new Date());
    }

}
