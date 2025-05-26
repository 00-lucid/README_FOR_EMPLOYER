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
  Block,
  Gauge,
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
  selectContactsState,
  statisticState,
  userInfoState,
} from "../recoil/state";
import axios from "axios";
import "../css/custom.css";
const Discount = ({ discount }) => {
  return (
    <>
      <div
        className="w-10 h-10 m-1 text-xs rounded-full bg-red-500 flex items-center justify-center"
        id="discount"
        style={{
          color: "#F3EAD7",
        }}
      >
        -<p className="text-sm font-bold">{discount}</p>%
      </div>
    </>
  );
};

export default Discount;
