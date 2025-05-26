package com.duoduo.server.Repository;

import com.duoduo.server.Entity.PostEntity;
import com.duoduo.server.Entity.UserListEntity;
import org.json.simple.JSONObject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<PostEntity, Long> {
    @Query(value = "SELECT * FROM post ORDER BY id DESC limit 10 offset 0", nativeQuery = true)
    List<PostEntity> findRecentTen();

    @Query(value = "SELECT * FROM post ORDER BY id DESC limit 10 offset :page", nativeQuery = true)
    List<PostEntity> findMoreTen(@Param("page") int page);

//    SELECT post.*, COUNT(userpost.post) AS "likeCount" FROM post JOIN userpost ON post.id = userpost.post GROUP BY post.id ORDER BY post.id DESC limit 10 offset 0;
    @Query(value = "SELECT post.*, COUNT(userpost.post) AS \"likeCount\", EXISTS(SELECT 1 FROM userpost WHERE userpost.user = :userId AND post.id = userpost.post) AS \"liked\" FROM post LEFT JOIN userpost ON post.id = userpost.post GROUP BY post.id ORDER BY post.id DESC limit 10 offset 0", nativeQuery = true)
    List<JSONObject> findRecentTenWithLike(@Param("userId") Long userId);

    @Query(value ="SELECT post.*, COUNT(userpost.post) AS \"likeCount\", EXISTS(SELECT 1 FROM userpost WHERE userpost.user = :userId AND post.id = userpost.post) AS \"liked\" FROM post LEFT JOIN userpost ON post.id = userpost.post GROUP BY post.id ORDER BY post.id DESC limit 10 offset :page", nativeQuery = true)
    List<JSONObject> findMoreTenWithLike(@Param("userId") Long userId, @Param("page") Long page);

    @Query(value = "SELECT post.*, COUNT(userpost.post) AS \"likeCount\" FROM post LEFT JOIN userpost ON post.id = userpost.post GROUP BY post.id ORDER BY likeCount DESC LIMIT 8", nativeQuery = true)
    List<JSONObject> findBestAll();
}
