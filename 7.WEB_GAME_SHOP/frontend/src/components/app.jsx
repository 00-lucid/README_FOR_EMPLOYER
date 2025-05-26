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
  Badge,
} from "framework7-react";
// 프레임워크7이 web-app을 mobile-app으로 변환 가능한 이유는 내장된 component들을 사용하기 때문이다.
// test
import "lodash";
import React, { useEffect } from "react";
import { logout } from "../common/api";
import { destroyToken, getToken, saveToken } from "../common/auth";
import store from "../common/store";
import { getDevice } from "../js/framework7-custom.js";
import routes from "../js/routes";
import i18n from "../lang/i18n";

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
  contactsState,
  dibsState,
  itemState,
  orderListState,
  relationItemState,
  statisticState,
  userInfoState,
} from "../recoil/state";
import axios from "axios";
import MessageCircle from "./message";
import { data } from "dom7";
import helper from "../pages/modules/helper";
import { useCookies } from "react-cookie";

global.i18next = i18n;

const MyApp = ({ socket }) => {
  const contacts = useRecoilValue(contactsState);

  const handleDibList = useSetRecoilState(dibsState);
  const handleAllTag = useSetRecoilState(allTagState);
  const handleContacts = useSetRecoilState(contactsState);
  const handleOrderList = useSetRecoilState(orderListState);

  const [items, handleItems] = useRecoilState(basketState);
  const [userInfo, handleUserInfo] = useRecoilState(userInfoState);
  const [statistic, handleStatistic] = useRecoilState(statisticState);

  const [cookies, setCookie, removeCookie] = useCookies([
    "rememberEmail",
    "rememberPassword",
  ]);

  const autoLogin = async () => {
    if (cookies.rememberEmail && cookies.rememberPassword) {
      const { data } = await axios.post(`${process.env.API_URL}/signin`, {
        email: cookies.rememberEmail,
        password: cookies.rememberPassword,
      });
      saveToken({ token: data.accToken, csrf: null });
    }
  };

  useEffect(() => {
    // 오류가 나면 invalid token이기 때문에 로그인 유도

    if (!loggedIn) {
      autoLogin();
    } else {
      requestUserInfo();
    }
    const data = helper.getLineItem();
    handleItems(data);
  }, []);

  useEffect(() => {
    if (loggedIn) {
      items.forEach(async (item) => {
        await axios.post(
          `${process.env.API_URL}/add-line-item`,
          {
            name: item.name,
            img: item.img,
            // lineTotal: subTotal,
            // buyOption: arrVal[0],
            // buyCount: arrVal[1],
            itemId: item.id,
          },
          {
            headers: { authorization: `Bearer ${getToken().token}` },
          }
        );
      });
    }
  }, [loggedIn]);
  // Login screen demo data
  let loggedIn = !!getToken().token;
  const handleLogout = async () => {
    await logout();
    location.replace("/");
  };

  const requestContacts = async () => {
    // access token을 함께 보내야 됨
    const { data } = await axios.get(`${process.env.API_URL}/contacts`, {
      headers: {
        authorization: `Bearer ${getToken().token}`,
      },
    });

    handleContacts([...data]);
  };

  const requestDibList = async () => {
    const { data } = await axios.get(`${process.env.API_URL}/dibs`, {
      headers: {
        authorization: `Bearer ${getToken().token}`,
      },
    });

    handleDibList([...data].reverse());
  };

  // const requestLineItem = async () => {
  //   const { data } = await axios.get(`${process.env.API_URL}/get-line-item`, {
  //     headers: {
  //       authorization: `Bearer ${getToken().token}`,
  //     },
  //   });
  //   // handleItems((old) => [...old, ...data]);
  // };

  const requestUserInfo = async () => {
    const { data } = await axios.get(`${process.env.API_URL}/user-info`, {
      headers: {
        authorization: `Bearer ${getToken().token}`,
      },
    });

    handleUserInfo(data);
  };

  const requestStatistics = async () => {
    const { data } = await axios.get(`${process.env.API_URL}/statistics`, {
      headers: {
        authorization: `Bearer ${getToken().token}`,
      },
    });

    handleStatistic(data);
  };

  const requestAllTag = async () => {
    const { data } = await axios.get(`${process.env.API_URL}/get-all-tag`);

    handleAllTag(data);
  };

  const device = getDevice();
  // const items = useRecoilValue(itemState);
  // Framework7 Parameters
  const f7params = {
    name: "Practice", // App name
    theme: "ios", // Automatic theme detection
    id: "com.insomenia.practice", // App bundle ID
    // App store
    store: store,
    // App routes
    routes: routes,
    // Input settings
    view: {
      iosDynamicNavbar: getDevice().ios,
    },
  };
  return (
    <App {...f7params}>
      {/* Left panel with cover effect*/}
      <Panel left cover>
        <Page>
          <Navbar title="메뉴" />
          <PageContent>
            <List>
              {loggedIn && (
                <ListItem
                  title="Admin"
                  link="/admin/"
                  icon=""
                  panelClose
                  onClick={requestStatistics}
                ></ListItem>
              )}
            </List>
          </PageContent>
        </Page>
      </Panel>
      <Views tabs className="safe-areas">
        {/* Tabbar for switching views-tabs */}
        <Toolbar tabbar labels bottom>
          <Link
            tabLink="#view-home"
            tabLinkActive
            icon="las la-home"
            text="홈"
          />
          {loggedIn && (
            <Link
              tabLink="#view-contacts"
              icon="las la-edit"
              text="주문내역"
              onClick={requestContacts}
            />
          )}
          <Link
            tabLink="#view-carts"
            icon="las la-shopping-cart"
            badgeColor="red"
            iconBadge={items && items.length > 0 ? items.length : null}
            text="장바구니"
            onClick={() => helper.saveLineItem(items)}
          ></Link>
          {
            loggedIn && (
              <Link
                tabLink="#view-my"
                icon="las la-user"
                text="내정보"
                onClick={() => {
                  requestDibList();
                  requestUserInfo();
                }}
              />
            )
            // <Icon ios="f7:multiply" aurora="f7:multiply" md="material:close"></Icon>
          }
          {loggedIn &&
            (userInfo.tier === "GrandMaster" ||
              userInfo.tier === "Challenger") && (
              <Link
                tabLink="#view-admin"
                icon="las la-calculator"
                text="관리"
                onClick={() => {
                  requestStatistics();
                  requestAllTag();
                }}
              />
            )}
        </Toolbar>
        <View
          id="view-home"
          props={socket}
          main
          tab
          tabActive
          url="/"
          iosDynamicNavbar={false}
          browserHistory="true"
          browserHistorySeparator=""
        />
        <View id="view-contacts" name="contacts" tab url="/contacts" />
        <View id="view-carts" name="basket" tab url="/basket" />
        <View id="view-signin" name="signin" tab url="/users/sign_in" />
        <View id="view-signup" name="signup" tab url="/users/sign_up" />
        <View id="view-my" name="my" tab url="/my" />
        <View id="view-item-info" name="item-info" tab url="/item-info" />
        <View id="view-write" name="write" tab url="/write" />
        <View id="view-admin" name="admin" tab url="/admin" />
      </Views>
    </App>
  );
};
export default MyApp;
