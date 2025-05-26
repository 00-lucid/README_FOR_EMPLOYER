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

import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import {
  alarmsState,
  allTagState,
  basketState,
  bellBedgeState,
  bellState,
  contactsState,
  dibsState,
  isActionState,
  itemState,
  orderListState,
  relationItemState,
  selectContactsState,
  statisticState,
  userInfoState,
} from "../recoil/state";
import axios from "axios";
import helper from "../pages/modules/helper";
import Discount from "./Discount";

const BasketItem = ({ item, subTotal }) => {
  let total = 0;

  const [isSave, handleIsSave] = useState(false);

  const handleBells = useSetRecoilState(bellState);
  const handleBellBadges = useSetRecoilState(bellBedgeState);

  const [items, handleItems] = useRecoilState(basketState);
  const [alarms, handleAlarms] = useRecoilState(alarmsState);
  const [isAction, handleIsAction] = useRecoilState(isActionState);

  const outBasket = (item) => {
    // ListItem에 - 버튼을 눌렀을 때, 해당 ListItem을 삭제
    // LineItem table에서도 제거 되어야 함!

    if (!getToken().token) {
      handleItems((old) => old.filter((el) => el.name !== item.name));
      helper.saveLineItem(items.filter((el) => el.name !== item.name));
    } else {
      const { data } = axios.post(`${process.env.API_URL}/out-basket`, item, {
        headers: {
          authorization: `Bearer ${getToken().token}`,
        },
      });
      handleItems((old) => old.filter((el) => el.name !== item.name));
      helper.saveLineItem(items.filter((el) => el.name !== item.name));
    }
  };

  return (
    <>
      <section
        className="flex flex-col justify-center"
        style={{
          backgroundColor: "#02111b",
        }}
      >
        <img src={item.img} className="w-auto"></img>

        <ListItem
          key={item.id}
          // header={contact.name}
          // footer={`옵션: ${contact.optionBox} 수량: ${contact.countBox}개`}
          className="flex flex-col w-full"
          style={{
            color: "#F3EAD7",
            backgroundColor: "#02111b",
            borderBottomWidth: "1px",
            borderColor: "#C79A3A",
          }}
        >
          <section className="flex flex-col w-full">
            <section className="flex flex-row items-center">
              <p className="font-semibold">{item.name}</p>
            </section>
            <section className="flex flex-row absolute right-7 items-center">
              <img
                src="https://cdn.gamermarkt.com/files/images/lol/other/rp_logo.png"
                className="w-5 h-5"
              ></img>
              <p className="text-yellow-500  font-black">{subTotal}</p>
            </section>
            <p
              className="text-xs"
              style={{
                color: "gray",
              }}
            >{`옵션: ${item.optionBox} 수량: ${item.countBox}개`}</p>
            <p className="text-xs text-gray-500">{item.createdAt}</p>
          </section>
          <Button
            onClick={outBasket.bind(null, item)}
            className="bottom-16"
            style={{ color: "#e63946" }}
          >
            <Icon
              ios="f7:trash_fill"
              aurora="f7:trash_fill"
              md="material:close"
            ></Icon>
          </Button>
        </ListItem>
      </section>
    </>
  );
};

export default BasketItem;
