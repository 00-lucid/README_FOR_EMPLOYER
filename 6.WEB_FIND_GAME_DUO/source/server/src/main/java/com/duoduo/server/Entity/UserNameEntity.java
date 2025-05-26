package com.duoduo.server.Entity;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.apache.catalina.User;

import javax.persistence.*;

@Getter
@Entity(name = "username")
@NoArgsConstructor
public class UserNameEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user")
    private UserEntity userId;

    @Column
    private String username;

    @Builder
    public UserNameEntity(UserEntity userId, String username){
        this.userId = userId;
        this.username = username;
    }
}
