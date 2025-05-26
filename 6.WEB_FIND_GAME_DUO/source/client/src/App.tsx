import "./App.css";
import styled from "styled-components";
import { Route, Switch } from "react-router-dom";
import Root from "./pages/Root";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import { useRecoilState, useSetRecoilState } from "recoil";
import Rooms from "./pages/Rooms";
import Bells from "./pages/Bells";
import { pathToFileURL } from "url";
import {
  Alarm,
  alarmModalState,
  ClientToServerEvents,
  ServerToClientEvents,
} from "./state";
import AlarmModal from "./components/AlarmModal";
import MyPage from "./pages/MyPage";
import MessageModal from "./components/MessageModal";
import Community from "./pages/Community";
import PostComment from "./pages/PostComment";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { chatsState, isModeState } from "./state-persist";
import axios from "axios";
import { destroyToken, getToken } from "./common/auth";
import Callback from "./pages/Callback";

function App() {
  // 매칭이 시작되면 자동으로 채팅창이 열려야됨
  const [alarmModals, setAlarmModal] = useRecoilState<Alarm[]>(alarmModalState);
  // none -> loading -> permission -> end
  const [isMode, setIsMode] = useRecoilState<string>(isModeState);
  const [chats, setChats] = useRecoilState<any[]>(chatsState);
  const [isMessage, setIsMessage] = useState(false);
  const [socket, setSocket] =
    useState<Socket<ServerToClientEvents, ClientToServerEvents>>();

  useEffect(() => {
    if (!socket) {
      setSocket(io(`${process.env.REACT_APP_SOCKET_SERVER_URL}`));
    }
    setChats([]);
    if (getToken().token) {
      axios
        .get(`${process.env.REACT_APP_SOCKET_SERVER_URL}/live`, {
          headers: {
            authorization: `Bearer ${getToken().token}`,
          },
        })
        .then(({ data }) => {
          const { mode } = data;
          switch (mode) {
            case "none":
              setIsMode("none");
              break;
            case "waitCreator":
              setIsMode("loading");
              break;
            case "end":
              setIsMode("end");
              break;
            case "waitJoiner":
              setIsMode("loading_permission");
              break;
            case "permission":
              setIsMode("permission");
              break;
          }
        });
    }
  }, []);

  return (
    <div className="App">
      {alarmModals?.map((alarm, idx) => (
        <AlarmModal key={idx} alarm={alarm} idx={idx} />
      ))}

      {socket && (
        <MessageModal
          chats={chats}
          setChats={setChats}
          setIsMessage={setIsMessage}
          socket={socket}
          isMode={isMode}
          setIsMode={setIsMode}
          isMessage={isMessage}
        />
      )}

      <Switch>
        <Route path="/" exact component={Root}></Route>
        <Route path="/signin" exact component={Signin}></Route>
        <Route path="/signup" exact component={Signup}></Route>
        <Route
          path="/rooms"
          exact
          render={() => (
            <Rooms
              socket={socket}
              setIsMessage={setIsMessage}
              isMode={isMode}
              setIsMode={setIsMode}
            />
          )}
        ></Route>
        <Route path="/bells" exact component={Bells}></Route>
        <Route path="/mypage" exact component={MyPage}></Route>
        <Route path="/community/all" exact component={Community}></Route>
        <Route path="/community/free" exact component={PostComment}></Route>
        <Route path="/account" exact component={Callback} />
      </Switch>
    </div>
  );
}

export default App;
