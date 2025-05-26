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

const PriceBox = ({ curItemInfo }) => {
  return (
    <>
      {curItemInfo.status === "on" ? (
        <section className="flex flex-row m-0.5 text-3xl items-center">
          <img
            src="https://cdn.gamermarkt.com/files/images/lol/other/rp_logo.png"
            className="w-5 h-5 m-0.5"
          ></img>
          <p
            className="font-bold"
            style={{
              color: "#F3EAD7",
            }}
          >
            {curItemInfo.price}
          </p>
        </section>
      ) : (
        <section className="flex flex-row m-0.5 text-3xl items-center">
          <img
            src="https://cdn.gamermarkt.com/files/images/lol/other/rp_logo.png"
            className="w-5 h-5 m-0.5"
          ></img>
          <p
            className="text-yellow-500  font-bold mr-2 opacity-30"
            style={{ color: "#bbbbbb" }}
          >
            <del>{curItemInfo.price}</del>
          </p>
          <p
            className="font-bold"
            style={{
              color: "#F3EAD7",
            }}
          >
            {curItemInfo.price - curItemInfo.price * (curItemInfo.sale * 0.01)}
          </p>
        </section>
      )}
    </>
  );
};

export default PriceBox;
