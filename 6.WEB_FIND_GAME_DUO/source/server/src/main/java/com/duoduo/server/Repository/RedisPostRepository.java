package com.duoduo.server.Repository;

import com.duoduo.server.Entity.RedisPostEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RedisPostRepository extends CrudRepository<RedisPostEntity, String> {

}
