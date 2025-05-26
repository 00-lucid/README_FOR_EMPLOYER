package com.duoduo.server.Service;

import com.duoduo.server.Repository.MostDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class FindService {
    public int findChampionMost(ArrayList<MostDTO> championMost, String championName) {
        // [MostDTO: {championName, count}, {...}, ..., {...}]
        int isFind = -1;
        for (int i = 0; i < championMost.size(); i++) {
            MostDTO el = championMost.get(i);
            if (el.getChampionName().equals(championName)) {
                isFind = i;
                break;
            }
        }
        return isFind;
    }
}
