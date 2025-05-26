import axios from "axios";
import React, { useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import styled from "styled-components";
import { setTimeRemoveAlarm } from "../common/api/page";
import { getToken } from "../common/auth";
import { Alarm, alarmModalState } from "../state";
import { userInfoState } from "../state-persist";

function MyPageInfoBlockSK() {
  return (
    <div className="mb-2">
      <p className="flex flex-row justify-start font-bold text-lg bg-gray-300 text-gray-300 rounded w-14">
        로딩중
      </p>
      <hr className="mt-2 mb-2"></hr>
      <div className="flex flex-row justify-between">
        <p className="bg-gray-300 text-gray-300 rounded">
          로딩중입니다로딩중입니다
        </p>
      </div>
    </div>
  );
}

export default MyPageInfoBlockSK;
