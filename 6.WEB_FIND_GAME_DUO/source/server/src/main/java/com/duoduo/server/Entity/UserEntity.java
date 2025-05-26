package com.duoduo.server.Entity;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.apache.catalina.User;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Getter
@Entity(name = "user")
@NoArgsConstructor
@ToString
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String email;

    @Column
    private String password;

    @Column
    private String nickname;

    @OneToMany(mappedBy = "username")
    private List<UserNameEntity> usernames = new ArrayList<>();

    @Builder
    public UserEntity(Long id, String email, String password, String nickname) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.nickname = nickname;
    }
}
