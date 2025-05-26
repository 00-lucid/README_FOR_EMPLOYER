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

const Star = ({ star, handleStar }) => {
  return (
    <section className="flex flex-row justify-center">
      {star > 0 ? (
        <button className="w-8" onClick={() => handleStar(1)}>
          <Icon aurora="f7:star_fill" ios="f7:star_fill" />
        </button>
      ) : (
        <button className="w-8" onClick={() => handleStar(1)}>
          <Icon aurora="f7:star" ios="f7:star" />
        </button>
      )}
      {star > 1 ? (
        <button className="w-8" onClick={() => handleStar(2)}>
          <Icon aurora="f7:star_fill" ios="f7:star_fill" />
        </button>
      ) : (
        <button className="w-8" onClick={() => handleStar(2)}>
          <Icon aurora="f7:star" ios="f7:star" />
        </button>
      )}
      {star > 2 ? (
        <button className="w-8" onClick={() => handleStar(3)}>
          <Icon aurora="f7:star_fill" ios="f7:star_fill" />
        </button>
      ) : (
        <button className="w-8" onClick={() => handleStar(3)}>
          <Icon aurora="f7:star" ios="f7:star" />
        </button>
      )}
      {star > 3 ? (
        <button className="w-8" onClick={() => handleStar(4)}>
          <Icon aurora="f7:star_fill" ios="f7:star_fill" />
        </button>
      ) : (
        <button className="w-8" onClick={() => handleStar(4)}>
          <Icon aurora="f7:star" ios="f7:star" />
        </button>
      )}
      {star > 4 ? (
        <button className="w-8" onClick={() => handleStar(5)}>
          <Icon aurora="f7:star_fill" ios="f7:star_fill" />
        </button>
      ) : (
        <button className="w-8" onClick={() => handleStar(5)}>
          <Icon aurora="f7:star" ios="f7:star" />
        </button>
      )}
    </section>
  );
};

export default Star;
