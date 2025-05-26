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

const MessageCircle = () => {
  // socket.on('messageToClient', (msg) => {
  //     receiveMessage(msg);
  // })

  const [isClick, handleClick] = useState(false);
  // const [text, handleText] = useState("");
  // const [messages, handleMessages] = useState(['some message', 'some message']);

  const requestChat = () => {
    // axios.get("https://localhost:3000").then((res) => console.log(res.data));
  };

  return (
    <>
      {isClick && (
        // #4A26FF
        <>
          <div
            className="flex flex-col fixed right-5 bottom-20 w-2/3 h-1/2 bg-white z-50 rounded-lg p-3"
            style={{
              backgroundColor: "#4A26FF",
            }}
          >
            <buttom onClick={() => handleClick(false)}>
              <Icon ios="f7:multiply" aurora="f7:multiply" color="white"></Icon>
            </buttom>
            <div className="flex-1 mb-1 bg-white rounded-md pt-3">
              <Button
                className="w-2/5 external"
                color="black"
                style={{
                  borderWidth: "1.5px",
                  borderRadius: "20px",
                  borderColor: "gray",
                  position: "absolute",
                  right: "7%",
                  fontSize: "1rem",
                }}
                onClick={requestChat}
                href="https://localhost:3000"
              >
                🚀 문의하기
              </Button>
              {/* <a href="https://localhost:3000" className="external">sssr</a> */}
              <ul></ul>
            </div>
          </div>
        </>
      )}
      {!isClick && (
        <div
          className="fixed w-20 h-20 bottom-20 right-5 z-50 rounded-full"
          style={{
            backgroundImage:
              "url(" +
              `https://scontent-ssn1-1.xx.fbcdn.net/v/t1.6435-9/53292213_1166966183464325_4655932127265685504_n.jpg?_nc_cat=102&ccb=1-3&_nc_sid=973b4a&_nc_ohc=cYG8KqQ-xdgAX8UApOL&_nc_ht=scontent-ssn1-1.xx&oh=0c3861e6bfc6621b35c740a4b7f7cd29&oe=609E1F0A` +
              ")",
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          onClick={() => handleClick(true)}
        ></div>
      )}
    </>
  );
};

export default MessageCircle;
