import {
  App,
  f7,
  f7ready,
  Link,
  List,
  ListItem,
  Navbar,
  Page,
  PageContent,
  Panel,
  Toolbar,
  View,
  Views,
  Icon,
  Button,
} from "framework7-react";
// 프레임워크7이 web-app을 mobile-app으로 변환 가능한 이유는 내장된 component들을 사용하기 때문이다.

import "lodash";
import React, { useEffect, useState } from "react";
import { logout } from "../common/api";
import { destroyToken, getToken } from "../common/auth";
import store from "../common/store";
import { getDevice } from "../js/framework7-custom.js";
import routes from "../js/routes";
import i18n from "../lang/i18n";

// import { io } from 'socket.io-client';

// const socket = io('https://localhost:3000')

// recoil
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import {
  allTagState,
  contactsState,
  dibsState,
  itemState,
  orderListState,
  relationItemState,
  statisticState,
  userInfoState,
} from "../recoil/state";
import axios from "axios";

const ReviewTitle = ({ reviews, curItemInfo }) => {
  return (
    <>
      <section className="flex flex-row items-center m-0.5">
        <img
          src="https://image.flaticon.com/icons/png/128/1828/1828884.png"
          className="w-4 h-4 m-0.5"
        />
        {curItemInfo.rate > 3.5 ? (
          <p className="text-green-500 text-lg">{curItemInfo.rate}</p>
        ) : (
          <p className="text-red-500 text-lg">{curItemInfo.rate}</p>
        )}
        <span
          className="ml-1.5 text-lg"
          style={{ color: "#F3EAD7", opacity: "80%" }}
        ></span>
        {reviews.length}개
      </section>
    </>
  );
};

export default ReviewTitle;
