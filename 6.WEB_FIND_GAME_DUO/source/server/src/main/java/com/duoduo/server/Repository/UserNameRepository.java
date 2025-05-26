package com.duoduo.server.Repository;

import com.duoduo.server.Entity.UserNameEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Repository
public interface UserNameRepository extends JpaRepository<UserNameEntity, Long> {

    @Transactional
    @Modifying
    @Query(value = "UPDATE username un SET un.username = :nextUserName WHERE un.user = :userId", nativeQuery = true)
    void patchNextUserNameByPreUserName(@Param("nextUserName") String nextUserName, @Param("userId") Long userId);

}
