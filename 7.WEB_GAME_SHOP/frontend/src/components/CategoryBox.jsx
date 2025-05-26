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
  categoryState,
  contactsState,
  dibsState,
  itemState,
  orderListState,
  relationItemState,
  statisticState,
  userInfoState,
} from "../recoil/state";
import axios from "axios";

const CategoryBox = ({ propCategory }) => {
  const [category, handleCategory] = useRecoilState(categoryState);

  return (
    <>
      <li
        className="w-1/4 h-24"
        style={{
          borderColor: "#C79A3A",
          borderWidth: "1px",
        }}
      >
        <a onClick={() => handleCategory(propCategory)} href="/category">
          <div className="flex flex-col items-center justify-center h-full">
            {propCategory === "세트" && (
              <Icon ios="f7:gift" aurora="f7:gift"></Icon>
            )}
            {propCategory === "스킨" && (
              <Icon ios="f7:hexagon" aurora="f7:hexagon"></Icon>
            )}
            {propCategory === "챔피언" && (
              <Icon ios="f7:person" aurora="f7:person"></Icon>
            )}
            {propCategory === "개발중" && (
              <Icon ios="f7:cube_box" aurora="f7:cube_box"></Icon>
            )}

            <p>{propCategory}</p>
          </div>
        </a>
      </li>
    </>
  );
};

export default CategoryBox;
