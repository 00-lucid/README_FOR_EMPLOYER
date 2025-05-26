package com.duoduo.server.Repository;

import com.duoduo.server.Entity.UserPostEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

// like logic
@Repository
public interface UserPostRepositoy extends JpaRepository<UserPostEntity, Long> {

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM userpost up WHERE up.user = :userId AND up.post = :postId", nativeQuery = true)
    void deleteUserPostByUserIdPostId(@Param("userId") Long userId, @Param("postId") Long postId);

    @Query(value = "SELECT COUNT(*) FROM userpost up WHERE up.post = :postId", nativeQuery = true)
    int findCountByPostId(@Param("postId") Long postId);

}
