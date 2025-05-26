import styled from "styled-components";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  isReceiveMessageState,
  permissionListState,
  userInfoState,
  userListCooldownState,
} from "../state-persist";
import { getToken } from "../common/auth";
import Chat from "./Chat";
import "../App.css";
import PermissionList from "./PermissionList";
import moment from "moment";
import axios from "axios";

function MessageModal({
  setIsMessage,
  socket,
  isMode,
  setIsMode,
  chats,
  setChats,
  isMessage,
}: any) {
  const [userListCooldown, setUserListCooldown] = useRecoilState<string>(
    userListCooldownState
  );
  const [isReceiveMessage, setIsReceiveMessage] = useRecoilState<boolean>(
    isReceiveMessageState
  );
  const [permissions, setPermissions] =
    useRecoilState<any[]>(permissionListState);
  const [text, setText] = useState("");
  const userInfo = useRecoilValue(userInfoState);
  const isLogin = getToken().token ? true : false;
  const [width, setWidth] = useState(window.innerWidth);

  const openMessage = () => {
    setIsReceiveMessage(false);
    setIsMessage(true);
  };

  const closeMessage = () => {
    setIsReceiveMessage(false);
    setIsMessage(false);
  };

  const leaveRoom = async () => {
    const { data } = await axios.delete(
      `${process.env.REACT_APP_SERVER_URL}/userlist/username/${userInfo.username}`,
      {
        headers: {
          Authorization: `Bearer ${getToken().token}`,
        },
      }
    );

    socket.emit("leave room", {
      from: userInfo.nickname,
    });
    setIsMode("none");
    setChats([]);
  };

  useEffect(() => {
    window.addEventListener("unload", leaveRoom);

    window.addEventListener("resize", () => {
      setWidth(window.innerWidth);
    });

    socket.on("receiveMessage", ({ from, message }: any) => {
      setChats((old: any) => [...old, { text: `${from}: ${message}` }]);
      setIsReceiveMessage(true);
    });

    socket.on("notice", ({ message }: any) => {
      setChats((old: any) => [...old, { text: message }]);
    });

    socket.on("loading", () => {
      setIsMode("loading");
    });

    socket.on("end", () => {
      setIsMode("end");
    });

    socket.on("res reject permission", () => {
      setIsMode("none");
    });

    socket.on("res accept permisson", ({ username }: any) => {
      socket.emit("join room", { from: userInfo.nickname, room: username });
    });

    socket.emit("check", { nickname: userInfo.nickname });
  }, []);

  useEffect(() => {
    if (!(permissions.length === 0)) {
      setIsMode("permission");
    } else if (permissions.length === 0 && isMode === "permission") {
      setIsMode("loading");
    }
    socket.on("res permission", ({ username, fromSocket }: any) => {
      setPermissions((old: any) => [
        ...old,
        { username, socketId: fromSocket },
      ]);
    });
  }, [permissions]);

  const submitMessage = () => {
    if (text) {
      socket.emit("send message", {
        message: text,
        from: userInfo.nickname,
      });
      setText("");
    }
  };

  const onEnter = (e: any) => {
    if (e.key === "Enter") {
      submitMessage();
    }
  };

  return (
    <>
      {isMessage ? (
        width > 767 ? (
          <div className="fixed bg-white w-80 xl:w-96 md:w-72 right-0 bottom-0 border h-96 flex flex-col rounded-t-lg overflow-hidden mr-4 shadow-2xl z-40 ">
            <button
              className="bg-green-400 h-10"
              onClick={closeMessage}
            ></button>
            <ul className="flex flex-col p-4 overflow-y-scroll w-full flex-1 text-left">
              {isLogin ? (
                isMode === "none" ? (
                  <section className="flex justify-center items-center h-full">
                    <p className="text-gray-400">매칭된 유저가 없습니다 :D</p>
                  </section>
                ) : isMode === "loading" ? (
                  <section className="flex flex-col justify-center items-center h-full">
                    <p className="text-gray-400">듀오를 찾는 중...</p>
                    <div className="loadingio-spinner-ripple-pv7k9jcs3qq">
                      <div className="ldio-2d8mpw24xf9">
                        <div></div>
                        <div></div>
                      </div>
                    </div>
                    <p
                      className="text-gray-400 text-sm cursor-pointer hover:bg-gray-100"
                      onClick={leaveRoom}
                    >
                      취소
                    </p>
                  </section>
                ) : isMode === "permission" ? (
                  <>
                    {permissions.map((el: any, idx) => (
                      <PermissionList
                        ket={idx}
                        id={idx}
                        idx={idx}
                        username={el.username}
                        socket={socket}
                        socketId={el.socketId}
                        setPermissions={setPermissions}
                        setIsMode={setIsMode}
                      />
                    ))}
                    <section className="flex flex-col justify-center items-center h-full">
                      <div className="loadingio-spinner-ripple-pv7k9jcs3qq">
                        <div className="ldio-2d8mpw24xf9">
                          <div></div>
                          <div></div>
                        </div>
                      </div>
                    </section>
                  </>
                ) : isMode === "loading_permission" ? (
                  <section className="flex flex-col justify-center items-center h-full">
                    <p className="text-gray-400">수락을 기다리는 중...</p>
                    <div className="loadingio-spinner-ripple-pv7k9jcs3qq">
                      <div className="ldio-2d8mpw24xf9">
                        <div></div>
                        <div></div>
                      </div>
                    </div>
                  </section>
                ) : (
                  chats.map((el: any) => <Chat text={el.text} />)
                )
              ) : (
                <p className="text-gray-400">로그인이 필요한 서비스입니다</p>
              )}
            </ul>
            {isMode === "end" && (
              <p
                className="text-gray-400 text-base cursor-pointer"
                onClick={leaveRoom}
              >
                나가기
              </p>
            )}
            <section className="border-t h-10 flex flex-row">
              <Input
                type="text"
                className="flex-1"
                onKeyPress={onEnter}
                onChange={(e) => setText(e.target.value)}
                value={text}
              ></Input>
              <button
                className="bg-green-400 w-1/6 text-white"
                onClick={submitMessage}
              >
                전송
              </button>
            </section>
          </div>
        ) : (
          // mobile on
          <div
            className="fixed w-full h-full bottom-0 z-30"
            style={{
              backgroundColor: "rgba(0,0,0,0.7)",
            }}
          >
            <div className="fixed bg-white w-full bottom-0 h-3/4 flex flex-col rounded-t-xl overflow-hidden mr-4 shadow-2xl border z-40">
              <button
                className="bg-green-400 h-10"
                onClick={closeMessage}
              ></button>
              <ul className="flex flex-col p-4 overflow-y-scroll w-full flex-1 text-left">
                {isLogin ? (
                  isMode === "none" ? (
                    <section className="flex justify-center items-center h-full">
                      <p className="text-gray-400">매칭된 유저가 없습니다 :D</p>
                    </section>
                  ) : isMode === "loading" ? (
                    <section className="flex flex-col justify-center items-center h-full">
                      <p className="text-gray-400">듀오를 찾는 중...</p>
                      <div className="loadingio-spinner-ripple-pv7k9jcs3qq">
                        <div className="ldio-2d8mpw24xf9">
                          <div></div>
                          <div></div>
                        </div>
                      </div>
                      <p
                        className="text-gray-400 text-sm cursor-pointer"
                        onClick={leaveRoom}
                      >
                        취소
                      </p>
                    </section>
                  ) : isMode === "permission" ? (
                    <>
                      {permissions.map((el: any, idx) => (
                        <PermissionList
                          id={idx}
                          idx={idx}
                          username={el.username}
                          socket={socket}
                          socketId={el.socketId}
                          setPermissions={setPermissions}
                          setIsMode={setIsMode}
                        />
                      ))}
                      <section className="flex flex-col justify-center items-center h-full">
                        <div className="loadingio-spinner-ripple-pv7k9jcs3qq">
                          <div className="ldio-2d8mpw24xf9">
                            <div></div>
                            <div></div>
                          </div>
                        </div>
                      </section>
                    </>
                  ) : isMode === "loading_permission" ? (
                    <section className="flex flex-col justify-center items-center h-full">
                      <p className="text-gray-400">수락을 기다리는 중...</p>
                      <div className="loadingio-spinner-ripple-pv7k9jcs3qq">
                        <div className="ldio-2d8mpw24xf9">
                          <div></div>
                          <div></div>
                        </div>
                      </div>
                    </section>
                  ) : (
                    chats.map((el: any) => <Chat text={el.text} />)
                  )
                ) : (
                  <p className="text-gray-400">로그인이 필요한 서비스입니다</p>
                )}
              </ul>
              {isMode === "end" && (
                <p
                  className="text-gray-400 text-base cursor-pointer"
                  onClick={leaveRoom}
                >
                  나가기
                </p>
              )}
              <section className="border-t h-10 flex flex-row">
                <Input
                  type="text"
                  className="flex-1"
                  onKeyPress={onEnter}
                  onChange={(e) => setText(e.target.value)}
                  value={text}
                ></Input>
                <button
                  className="bg-green-400 w-1/6 text-white"
                  onClick={submitMessage}
                >
                  전송
                </button>
              </section>
            </div>
          </div>
        )
      ) : width > 767 ? (
        // web && off
        isReceiveMessage ? (
          <div className="animate-bounce fixed bg-white w-80 xl:w-96 md:w-72 right-0 bottom-0 border z-40 flex flex-col rounded-t-lg overflow-hidden mr-4 shadow-2xl">
            <button
              className="bg-yellow-300 h-10"
              onClick={openMessage}
            ></button>
          </div>
        ) : (
          <div className="fixed bg-white w-80 xl:w-96 md:w-72 right-0 bottom-0 border z-40 flex flex-col rounded-t-lg overflow-hidden mr-4 shadow-2xl">
            <button
              className="bg-green-400 h-10"
              onClick={openMessage}
            ></button>
          </div>
        )
      ) : isReceiveMessage ? (
        // mobile && off
        <button
          className="animate-bounce fixed bg-yellow-300 w-16 h-16 right-4 bottom-4 border z-40 flex flex-col rounded-full overflow-hidden shadow-2xl justify-center items-center text-white"
          onClick={openMessage}
        >
          <img
            src={`${process.env.PUBLIC_URL}/icon_message.png`}
            width={35}
            height={35}
          />
        </button>
      ) : (
        <button
          className="fixed bg-green-400 w-16 h-16 right-4 bottom-4 border z-40 flex flex-col rounded-full overflow-hidden shadow-2xl justify-center items-center text-white"
          onClick={openMessage}
        >
          <img
            src={`${process.env.PUBLIC_URL}/icon_message.png`}
            width={35}
            height={35}
          />
        </button>
      )}
    </>
  );
}

export default MessageModal;

const Input = styled.input({
  outline: "none",
  color: "#343a40",
  backgroundColor: "#e9ecef",
  fontSize: "1.1rem",
  padding: "0.9rem",
});
