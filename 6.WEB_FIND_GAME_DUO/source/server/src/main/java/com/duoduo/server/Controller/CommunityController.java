package com.duoduo.server.Controller;

import ch.qos.logback.core.encoder.EchoEncoder;
import com.duoduo.server.Entity.*;
import com.duoduo.server.Repository.*;
import com.duoduo.server.Service.JsonWebTokenService;
import com.duoduo.server.Service.RedisService;
import io.jsonwebtoken.ExpiredJwtException;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
public class CommunityController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserPostRepositoy userPostRepositoy;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private RedisPostRepository redisPostRepository;

    @Autowired
    private RedisService redisService;

    @GetMapping(value = "/community/all/comment")
    private List<JSONObject> getComments(@RequestParam("postId") Long id) {
        List<JSONObject> jsonObjects = new ArrayList<>();
        try {
            List<CommentEntity> commentEntities = commentRepository.findAllByPostId(id);
            for (int i = 0; i < commentEntities.size(); i++) {
                JSONObject user = new JSONObject();
                JSONObject comment = new JSONObject();
                UserEntity userEntity = commentEntities.get(i).getUser();
                CommentEntity commentEntity = commentEntities.get(i);
                user.put("id", userEntity.getId());
                user.put("nickname", userEntity.getNickname());
                comment.put("user", user);
                comment.put("createdAt", commentEntity.getCreatedAt());
                comment.put("id", commentEntity.getId());
                comment.put("text", commentEntity.getText());
                jsonObjects.add(comment);
            }
            return jsonObjects;
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping(value = "/community/all")
    private List<JSONObject> getPost(@RequestParam("page") Long page, @RequestHeader("Authorization") String jwt) {
        try {
            if (jwt != null) {
                JsonWebTokenService jsonWebTokenService = new JsonWebTokenService();
                Long userId = jsonWebTokenService.decodeId(jwt);

                if (page != 0) {
                    return postRepository.findMoreTenWithLike(userId,page * 10);
                } else {
                    List postDTOList = postRepository.findRecentTenWithLike(userId);
                    return postDTOList;
                }
            } else {
                if (page != 0) {
                    return postRepository.findMoreTenWithLike(Long.valueOf(0),page * 10);
                } else {
                    List postDTOList = postRepository.findRecentTenWithLike(Long.valueOf(0));
                    return postDTOList;
                }
            }

        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    @PostMapping(value = "/community")
    private PostEntity createPost(@RequestBody JSONObject requestBody) {
        try {

            String title = requestBody.get("title").toString();
            String nickname = requestBody.get("nickname").toString();
            String body = requestBody.get("body").toString();

            PostEntity post = PostEntity.builder()
                            .title(title)
                            .nickname(nickname)
                            .body(body)
                            .build();
            postRepository.save(post);

            return post;
        } catch (Exception e) {
            return null;
        }
    }

    @PostMapping(value = "/community/like/1")
    private JSONObject createLike(@RequestParam("postId") Long id, @RequestHeader(value = "Authorization") String jwt) {
        JSONObject jsonObject = new JSONObject();
        try {
            JsonWebTokenService jsonWebTokenService = new JsonWebTokenService();
            Long userId = jsonWebTokenService.decodeId(jwt);
            Long postId = id;
            UserEntity user = userRepository.findById(userId).get();
            PostEntity post = postRepository.findById(postId).get();

            UserPostEntity userPostEntity = UserPostEntity.builder().user(user).post(post).build();
            userPostRepositoy.save(userPostEntity);
            jsonObject.put("state", "success");
            return jsonObject;
        } catch (Exception e) {
            return null;
        }
    }

    @DeleteMapping(value = "/community/like/0")
    private JSONObject removeLike(@RequestParam("postId") Long id, @RequestHeader("Authorization") String jwt) {
        JSONObject jsonObject = new JSONObject();
        try {
            JsonWebTokenService jsonWebTokenService = new JsonWebTokenService();
            Long userId = jsonWebTokenService.decodeId(jwt);
            Long postId = id;

            // remove logic
            userPostRepositoy.deleteUserPostByUserIdPostId(userId, postId);
            jsonObject.put("state", "success");
            return jsonObject;
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    @PostMapping(value = "/community/all/comment")
    private JSONObject addComment(@RequestBody JSONObject requestBody, @RequestParam("postId") Long id, @RequestHeader("Authorization") String jwt) {
        JSONObject jsonObject = new JSONObject();
        JSONObject userObject = new JSONObject();
        try {
            JsonWebTokenService jsonWebTokenService = new JsonWebTokenService();
            Long userId = jsonWebTokenService.decodeId(jwt);
            UserEntity user = userRepository.findById(userId).get();
            PostEntity post = postRepository.findById(id).get();
            CommentEntity commentEntity = CommentEntity.builder().user(user).post(post).text(requestBody.get("text").toString()).build();
            commentRepository.save(commentEntity);
            userObject.put("id", commentEntity.getUser().getId());
            userObject.put("nickname", commentEntity.getUser().getNickname());
            jsonObject.put("user", userObject);
            jsonObject.put("createdAt", commentEntity.getCreatedAt());
            jsonObject.put("id", commentEntity.getId());
            jsonObject.put("text", commentEntity.getText());
            return jsonObject;
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    @GetMapping(value = "/community/all/best")
    private List<JSONObject> getBestAll() {
        try {
            return postRepository.findBestAll();
        } catch (Exception e) {
            return null;
        }
    }


}
