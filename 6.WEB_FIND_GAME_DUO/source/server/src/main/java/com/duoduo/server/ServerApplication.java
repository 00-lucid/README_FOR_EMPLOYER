package com.duoduo.server;

import com.duoduo.server.Entity.PostEntity;
import com.duoduo.server.Entity.UserEntity;
import com.duoduo.server.Repository.PostRepository;
import com.duoduo.server.Repository.UserListRepository;
import com.duoduo.server.Repository.UserNameRepository;
import com.duoduo.server.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import javax.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
@EntityScan
@EnableJpaRepositories
@PropertySource("classpath:/key.properties")
public class ServerApplication {

	// version beta_0.2
	public static void main(String[] args) {
		SpringApplication.run(ServerApplication.class, args);
	}

	@PostConstruct
	public void started(){
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
	}

}
