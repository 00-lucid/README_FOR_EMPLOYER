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
  ListInput,
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
import Star from "./Star";

const ReviewBox = ({ star, handleText, handleStar }) => {
  return (
    <>
      <div
        className="absolute w-full flex flex-col item-center p-5"
        style={{
          height: "290px",
          backgroundColor: "rgba(0, 0, 0, 0.75)",
        }}
      >
        <section className="mt-7">
          <Star star={star} handleStar={handleStar} />
          <ListInput
            type="text"
            onChange={(e) => handleText(e.target.value)}
            className="w-full mt-6 border-b-2 border-white"
            placeholder="예) 상품 예쁘고 귀여워요 :D"
          ></ListInput>
        </section>
      </div>
    </>
  );
};

export default ReviewBox;
