package com.duoduo.server.Controller;

import com.duoduo.server.Entity.UserEntity;
import com.duoduo.server.Entity.UserListEntity;
import com.duoduo.server.Repository.MostDTO;
import com.duoduo.server.Repository.UserListDTO;
import com.duoduo.server.Repository.UserListRepository;
import com.duoduo.server.Service.FindService;
import com.duoduo.server.Service.JsonWebTokenService;
import com.duoduo.server.Service.RiotService;
import io.jsonwebtoken.ExpiredJwtException;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Query;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.net.http.HttpHeaders;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.*;

@CrossOrigin(value = "*")
@RestController
public class UserListController {

    @Autowired
    private RiotService riotService;

    @Autowired
    private FindService findService;

    @Autowired
    private UserListRepository userListRepository;

    @Autowired
    private JsonWebTokenService jsonWebTokenService;

    @GetMapping(value = "/userlist/infinite")
    public List<HashMap> getUserListInfinite(@RequestHeader("Page") int id) {
        try {
            List<UserListEntity> userListEntities =  userListRepository.findMoreTen(id * 10);
            List<HashMap> result = new ArrayList<>();
            if (userListEntities.size() > 0) {
                for (int i = 0; i < userListEntities.size(); i++) {
                    UserListEntity obj = userListEntities.get(i);
                    String pre = obj.getMost();
                    String most_kda = obj.getMost_kda();
                    String most_rate = obj.getMost_rate();
                    String[] next_kda = most_kda.split(" ");
                    String[] next_rate = most_rate.split(" ");
                    String[] next = pre.split(" ");
                    HashMap userListResponse = new HashMap(){{
                        put("id", obj.getId());
                        put("username", obj.getUsername());
                        put("nickname", obj.getNickname());
                        put("position", obj.getPosition());
                        put("tier", obj.getTier());
                        put("recent_rate", obj.getRecent_rate());
                        put("most", next);
                        put("most_kda", next_kda);
                        put("most_rate", next_rate);
                        put("total_wins", obj.getTotal_wins());
                        put("total_losses", obj.getTotal_losses());
                        put("total_rate", obj.getTotal_rate());
                        put("profileIconId", obj.getProfileIconId());
                        put("summonerLevel", obj.getSummonerLevel());
                        put("createdAt",obj.getCreatedAt());
                        put("text", obj.getText());
                        put("mic", obj.isMic());
                    }};
                    result.add(userListResponse);
                }
                return result;
            } else {
                return null;
            }

        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    @GetMapping(value = "/userlist")
    public List<HashMap> getUserList() {
        List<UserListEntity> list = userListRepository.findRecentTen();
        List<HashMap> result = new ArrayList<>();
        for (int i = 0; i < list.size(); i++) {
            int finalI = i;
            UserListEntity obj = list.get(finalI);
            String pre = obj.getMost();
            String most_kda = obj.getMost_kda();
            String most_rate = obj.getMost_rate();
            String[] next = pre.split(" ");
            String[] next_kda = most_kda.split(" ");
            String[] next_rate = most_rate.split(" ");
            HashMap userListResponse = new HashMap(){{
                put("id", obj.getId());
                put("username", obj.getUsername());
                put("nickname", obj.getNickname());
                put("position", obj.getPosition());
                put("tier", obj.getTier());
                put("recent_rate", obj.getRecent_rate());
                put("most", next);
                put("most_kda", next_kda);
                put("most_rate", next_rate);
                put("total_wins", obj.getTotal_wins());
                put("total_losses", obj.getTotal_losses());
                put("total_rate", obj.getTotal_rate());
                put("profileIconId", obj.getProfileIconId());
                put("summonerLevel", obj.getSummonerLevel());
                put("createdAt",obj.getCreatedAt());
                put("text", obj.getText());
                put("mic", obj.isMic());
            }};
            result.add(userListResponse);
        }
        return result;
    }

    @PostMapping(value = "/userlist")
    public HashMap createUserList(@RequestBody(required = true) UserListDTO userListDTO, @RequestHeader("Authorization") String jwt) {
        ArrayList<MostDTO> championMost = new ArrayList<MostDTO>();
        try {
            int win = 0;
            System.out.println(userListDTO.toString());
            // 모듈 객체를 활용해서 ript api와 http 통신을 진행한 뒤 결과를 userlist에 담아 생성한다.
            JSONArray arrMatches = riotService.getMatches(userListDTO.getPuuid());

            for (int i = 0; i < arrMatches.size(); i++) {
                String match = arrMatches.get(i).toString();
                JSONObject objMatch = riotService.getMatch(match);

                JSONObject objMetadata =  (JSONObject) objMatch.get("metadata");
                JSONArray arrPlayer = (JSONArray) objMetadata.get("participants");
                int idxPlayer = arrPlayer.indexOf(userListDTO.getPuuid());
                JSONObject objInfo = (JSONObject) objMatch.get("info");
                JSONArray arrPlayerInfo = (JSONArray) objInfo.get("participants");
                JSONObject player = (JSONObject) arrPlayerInfo.get(idxPlayer);
                boolean isWin = (boolean) player.get("win");
                if (isWin) win++;
                String championName = (String) player.get("championName");
                Long championKill = (Long) player.get("kills");
                Long championDeaths = (Long) player.get("deaths");
                Long championAssists = (Long) player.get("assists");
                Boolean championWin = (Boolean) player.get("win");

                int idxChampion = findService.findChampionMost(championMost, championName);
                if (idxChampion == -1) {
                    MostDTO mostDTO = null;
                    if (championWin) {
                        mostDTO = new MostDTO(championName, 1, 1, championKill, championDeaths, championAssists);
                    } else {
                        mostDTO = new MostDTO(championName, 1, 0, championKill, championDeaths, championAssists);
                    }
                    championMost.add(mostDTO);

                } else {
                    MostDTO pre = championMost.get(idxChampion);
                    pre.setCount(pre.getCount() + 1);
                    if (championWin) {
                        pre.setWins(pre.getWins() + 1);
                    }
                    pre.setKills(pre.getKills() + championKill);
                    pre.setDeaths(pre.getDeaths() + championDeaths);
                    pre.setAssists(pre.getAssists() + championAssists);
                    championMost.set(idxChampion, pre);
                }
            }

            System.out.println(championMost.toString());

            Collections.sort(championMost, Collections.reverseOrder());

            List<MostDTO> onlyMost = new ArrayList<>();

            if (championMost.size() >= 3) {
                onlyMost = championMost.subList(0, 3);
            } else {
                int i = 0;
                while (i < championMost.size()) {
                    onlyMost.add(championMost.get(i));
                    i++;
                }
                while (i < 3) {
                    MostDTO none = new MostDTO("NONE", 0, 0,  0L, 0L, 0L);
                    onlyMost.add(none);
                    i++;
                }
            }


            System.out.println(onlyMost.toString());

            // cp_kda "2.75 3.45 15.00"
            // cp_win_rate "45 75 62"
            DecimalFormat df = new DecimalFormat("#.##");
            List<String> cp_kda = new ArrayList();
            List<String> cp_win_rate = new ArrayList();
            for (int i = 0; i < onlyMost.size(); i++) {
                MostDTO mostDTO = onlyMost.get(i);
                double kills = (double) mostDTO.getKills();
                String kda = df.format((kills + mostDTO.getAssists()) / mostDTO.getDeaths());
                cp_kda.add(kda);
                double wins = (double) mostDTO.getWins();
                long win_rate = Math.round((wins / mostDTO.getCount()) * 100);
                cp_win_rate.add(String.valueOf(win_rate));
            }

            List resultMost = new ArrayList();
            for (int i = 0; i < onlyMost.size(); i++) {
                resultMost.add(onlyMost.get(i).getChampionName());
            }
            String result = String.join(" ", resultMost);
            String result_kda = String.join(" ", cp_kda);
            String result_win_rate = String.join(" ", cp_win_rate);

            System.out.println("all done");

            Long id = jsonWebTokenService.decodeId(jwt);
            UserEntity user = jsonWebTokenService.verifyId(id);

            UserListEntity userList = UserListEntity.builder()
                    .userId(user)
                    .username(userListDTO.getUsername())
                    .nickname(userListDTO.getNickname())
                    .position(userListDTO.getPosition())
                    .tier(userListDTO.getTier())
                    .recent_rate(win * 5)
                    .most(result)
                    .kda(5)
                    .poro(50)
                    .synergy(50)
                    .most_kda(result_kda)
                    .most_rate(result_win_rate)
                    .total_wins(userListDTO.getTotal_wins())
                    .total_losses(userListDTO.getTotal_losses())
                    .total_rate(userListDTO.getTotal_rate())
                    .profileIconId(userListDTO.getProfileIconId())
                    .summonerLevel(userListDTO.getSummonerLevel())
                    .text(userListDTO.getText())
                    .mic(userListDTO.isMic())
                    .build();

            userListRepository.save(userList);
            int finalWin = win;
            SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss a", Locale.ENGLISH);
            HashMap userListResponse = new HashMap(){{
                put("id", userList.getId());
                put("username", userListDTO.getUsername());
                put("nickname", userListDTO.getNickname());
                put("position", userListDTO.getPosition());
                put("tier", userListDTO.getTier());
                put("recent_rate", finalWin * 10);
                put("most", resultMost);
                put("most_kda", cp_kda);
                put("most_rate", cp_win_rate);
                put("total_wins", userListDTO.getTotal_wins());
                put("total_losses", userListDTO.getTotal_losses());
                put("total_rate", userListDTO.getTotal_rate());
                put("profileIconId", userListDTO.getProfileIconId());
                put("summonerLevel", userListDTO.getSummonerLevel());
                put("createdAt", simpleDateFormat.format(new Date()));
                put("text", userListDTO.getText());
                put("mic", userListDTO.isMic());
            }};

            return userListResponse;
        } catch (ExpiredJwtException e) {
            return new HashMap(){{
                put("error", "token expired");
            }};
        } catch (Exception e) {
            StackTraceElement[] ste = e.getStackTrace();
            String className = ste[0].getClassName();
            String methodName = ste[0].getMethodName();
            int lineNumber = ste[0].getLineNumber();
            String fileName = ste[0].getFileName();
            System.out.println("Exception : " + e.getMessage());
            System.out.println(className + "." + methodName + " " + fileName + " " + lineNumber + "line");
            return null;
        }
    }

    @DeleteMapping(value = "userlist/{id}")
    public UserListEntity removeUserList(@PathVariable("id") Long listId, @RequestHeader("Authorization") String jwt) {
        try {
            Long userId = jsonWebTokenService.decodeId(jwt);
            UserListEntity target = userListRepository.findByIdAndId(userId, listId);
            userListRepository.delete(target);
            return target;
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    @DeleteMapping(value = "userlist/username/{username}")
    public JSONObject removeUserListOfName(@PathVariable("username") String username, @RequestHeader("Authorization") String jwt) {
        JSONObject jsonObject = new JSONObject();
        try {
            Long userId = jsonWebTokenService.decodeId(jwt);
            userListRepository.deleteAllByNameAndId(username, userId);
            jsonObject.put("state", "success");
            return jsonObject;
        } catch (Exception e) {
            jsonObject.put("state", "fail");
            return jsonObject;
        }
    }

    @GetMapping(value = "userlist/filter")
    public JSONObject getUserListFilter(@RequestParam(value = "tier", required = false) String tier, @RequestParam(value = "position", required = false) String position, @RequestParam(value = "page", required = false) Integer page) {
        List<UserListEntity> userList = new ArrayList();
        JSONArray jsonArray = new JSONArray();
        JSONObject result = new JSONObject();

        try {
            if (page == null) {
                page = 0;
            }
            if (tier != null && position != null) {
                userList = userListRepository.findByFilter(tier, position, page * 10);
            } else if (position != null && tier == null) {
                userList = userListRepository.findByPosition(position, page * 10);
            } else if (tier != null && position == null) {
                userList = userListRepository.findByTier(tier, page * 10);
            } else {
                result.put("result", "none");
                return null;
            }

            for (int i = 0; i < userList.size(); i++) {
                JSONObject jsonObject = new JSONObject();
                UserListEntity userListEntity = userList.get(i);
                jsonObject.put("createdAt", userListEntity.getCreatedAt());
                jsonObject.put("id", userListEntity.getId());
                jsonObject.put("kda", userListEntity.getKda());
                jsonObject.put("mic", userListEntity.isMic());
                jsonObject.put("most", userListEntity.getMost());
                jsonObject.put("most_kda", userListEntity.getMost_kda());
                jsonObject.put("most_rate", userListEntity.getMost_rate());
                jsonObject.put("nickname", userListEntity.getNickname());
                jsonObject.put("position", userListEntity.getPosition());
                jsonObject.put("profileIconId", userListEntity.getProfileIconId());
                jsonObject.put("recent_rate", userListEntity.getRecent_rate());
                jsonObject.put("summonerLevel", userListEntity.getSummonerLevel());
                jsonObject.put("text", userListEntity.getText());
                jsonObject.put("tier", userListEntity.getTier());
                jsonObject.put("total_losses", userListEntity.getTotal_losses());
                jsonObject.put("total_rate", userListEntity.getTotal_rate());
                jsonObject.put("total_wins", userListEntity.getTotal_wins());
                jsonObject.put("username", userListEntity.getUsername());


                jsonArray.add(jsonObject);
            }
            result.put("result", jsonArray);
            return result;
        } catch (Exception e) {
            result.put("state", "fail");
            return null;
        }
    }

}
