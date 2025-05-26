package com.duoduo.server.Service;


import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;

@Service
public class RiotService {
    @Value("${api.key.riot}")
    String API_KEY;

    public JSONArray getMatches(String puuid) {

        HttpURLConnection connection = null;
        JSONArray responseJsonArr = null;

        try {

            URL requestURL = new URL("https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/"+puuid+"/ids?start=0&count=20&api_key=" + API_KEY);
            connection = (HttpURLConnection) requestURL.openConnection();
            connection.setRequestMethod("GET");
            int responseCode = connection.getResponseCode();

            if (responseCode == 200) {
                BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuffer sb = new StringBuffer();
                String line = "";
                while ((line = br.readLine()) != null) {
                    sb.append(line);
                }
                br.close();

                JSONParser parser = new JSONParser();
                responseJsonArr = (JSONArray) parser.parse(sb.toString());

                return responseJsonArr;
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public JSONObject getMatch(String matchId) {

        HttpURLConnection connection = null;
        JSONObject responseJsonObj = null;

        try {
            URL requestURL = new URL("https://asia.api.riotgames.com/lol/match/v5/matches/" + matchId + "?api_key=" + API_KEY);
            connection = (HttpURLConnection) requestURL.openConnection();
            connection.setRequestMethod("GET");

            int responseCode = connection.getResponseCode();
            if (responseCode == 200) {
                BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuffer sb = new StringBuffer();
                String line = "";
                while ((line = br.readLine()) != null) {
                    sb.append(line);
                }
                br.close();

                JSONParser parser = new JSONParser();
                responseJsonObj = (JSONObject) parser.parse(sb.toString());
                return responseJsonObj;
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public void getRecentRate() {

    }

    public void getMost() {

    }

    public void getKda() {

    }
}
