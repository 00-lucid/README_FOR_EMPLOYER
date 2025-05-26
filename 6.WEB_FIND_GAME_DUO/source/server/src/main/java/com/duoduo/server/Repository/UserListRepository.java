package com.duoduo.server.Repository;

import com.duoduo.server.Entity.UserListEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface UserListRepository extends JpaRepository<UserListEntity, Long> {
    List<UserListEntity> findByIdBetweenOrderByIdDesc(Long fromId, Long toId);
    List<UserListEntity> findByIdLessThanEqualOrderByIdDesc(Long id);

    @Query(value = "SELECT * FROM userlist ORDER BY id DESC limit 10 offset 0", nativeQuery = true)
    List<UserListEntity> findRecentTen();

    @Query(value = "SELECT * FROM userlist ORDER BY id DESC limit 10 offset :page", nativeQuery = true)
    List<UserListEntity> findMoreTen(@Param("page") int page);

    @Query(value = "SELECT * FROM userlist ul WHERE ul.user = :userId AND ul.id = :id", nativeQuery = true)
    UserListEntity findByIdAndId(@Param("userId") Long userId, @Param("id") Long id);

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM userlist ul WHERE ul.username = :username AND ul.user = :userId", nativeQuery = true)
    void deleteAllByNameAndId(@Param("username") String username, @Param("userId") Long userId);

    @Query(value = "SELECT * FROM userlist ul WHERE ul.tier REGEXP :tier AND ul.position = :position ORDER BY id DESC limit 10 offset :page", nativeQuery = true)
    List<UserListEntity> findByFilter(@Param("tier") String tier, @Param("position") String position, @Param("page") int page);

    @Query(value = "SELECT * FROM userlist ul WHERE ul.tier REGEXP :tier ORDER BY id DESC limit 10 offset :page", nativeQuery = true)
    List<UserListEntity> findByTier(@Param("tier") String tier, @Param("page") int page);

    @Query(value = "SELECT * FROM userlist ul WHERE ul.position = :position ORDER BY id DESC limit 10 offset :page", nativeQuery = true)
    List<UserListEntity> findByPosition(@Param("position") String position, @Param("page") int page);
}
