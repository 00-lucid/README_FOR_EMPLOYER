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
  basketState,
  bellState,
  contactsState,
  curItemInfoState,
  dibsState,
  itemState,
  orderListState,
  recentItemState,
  relationItemState,
  reviewState,
  statisticState,
  tagState,
  userInfoState,
} from "../recoil/state";
import axios from "axios";
import Discount from "./Discount";

const NotGrid = ({ item }) => {
  const handleBells = useSetRecoilState(bellState);
  const handleItems = useSetRecoilState(basketState);
  const handleReview = useSetRecoilState(reviewState);
  const handleItemList = useSetRecoilState(itemState);
  const handleAllTag = useSetRecoilState(allTagState);
  const handleCurItemInfo = useSetRecoilState(curItemInfoState);

  const [tags, handleTag] = useRecoilState(tagState);
  const [recentItem, handleRecentItem] = useRecoilState(recentItemState);
  const [relationItems, handleRelationItemState] = useRecoilState(
    relationItemState
  );

  const requestCurItemInfo = async (itemId) => {
    // 카드의 id를 이용해서 알맞는 아이탬 내용을 가져와 state에 저장해야 합니다.
    // 해당 state는 ItemInfo page 랜더에 활용됩니다.
    if (getToken().token) {
      const { data } = await axios.post(
        `${process.env.API_URL}/get-item-info`,
        { id: itemId },
        { headers: { authorization: `Bearer ${getToken().token}` } }
      );

      handleReview(data.reviews);

      handleRelationItemState(data.relationItems);

      handleCurItemInfo(data);
    } else {
      const { data } = await axios.post(
        `${process.env.API_URL}/get-item-info`,
        {
          id: itemId,
        }
      );

      handleReview(data.reviews);

      handleCurItemInfo(data);

      handleRelationItemState(data.relationItems);
    }
  };

  return (
    <>
      <li
        key={item.id}
        className="mt-3 w-80 h-40 flex flex-col justify-end"
        style={{
          borderWidth: "0.1px",
          borderColor: "#C79A3A",
          backgroundImage: "url(" + `${item.img}` + ")",
          backgroundPosition: "top",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
        }}
      >
        {item.sale && <Discount discount={item.sale} />}
        <a
          className="w-full h-full flex flex-col items-center justify-center"
          href={`/item-info/${item.id}`}
          onClick={() => {
            requestCurItemInfo(item.id);
            handleRecentItem((old) => {
              const result = old.filter((el) => el.name !== item.name);
              return [item, ...result];
              // [item, ...old.slice(0, old.indexOf(item)), ...old.slice(old.indexOf(item) + 1)]
            });
          }}
        ></a>
        <div
          className="h-14 bg-black p-2"
          style={{
            background: "rgba(0, 0, 0, 0.6)",
          }}
        >
          <p>{item.name}</p>
          <section className="flex flex-row items-center">
            <img
              src="https://cdn.gamermarkt.com/files/images/lol/other/rp_logo.png"
              className="w-4 h-4"
            ></img>
            <p
              className="font-semiboldw ml-2"
              style={{
                color: "#fae6bd",
              }}
            >
              {item.price - item.price * (item.sale * 0.01)}
            </p>
          </section>
        </div>
      </li>
    </>
  );
};

export default NotGrid;
