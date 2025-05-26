package com.duoduo.server.Repository;

import com.duoduo.server.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    UserEntity findByEmail(String email);
    UserEntity findByNickname(String nickname);
    UserEntity findByPassword(String password);

    @Transactional
    @Modifying
    @Query(value = "UPDATE user u SET u.email = :nextEmail WHERE u.id = :id")
    void patchNextEmailByPreEmail(@Param("nextEmail") String nextEmail, @Param("id") Long id);

}