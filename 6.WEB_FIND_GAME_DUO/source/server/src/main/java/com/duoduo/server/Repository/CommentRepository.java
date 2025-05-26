package com.duoduo.server.Repository;

import com.duoduo.server.Entity.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Long> {

    @Query(value = "SELECT * FROM comment cm WHERE cm.post = :postId", nativeQuery = true)
    List<CommentEntity> findAllByPostId(@Param("postId") Long postId);

}
