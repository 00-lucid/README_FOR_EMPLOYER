import {
  Block,
  BlockTitle,
  Button,
  Col,
  Link,
  List,
  ListItem,
  Navbar,
  NavLeft,
  NavRight,
  NavTitle,
  Page,
  Row,
  Searchbar,
  Card,
  Radio,
  Gauge,
  Fab,
  Icon,
  FabButtons,
  FabButton,
} from "framework7-react";
import React, { useEffect, useState } from "react";
import "../css/app.less";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  alarmsState,
  basketState,
  bellBedgeState,
  dibsState,
  isPopWriteState,
  orderListState,
  userInfoState,
} from "../recoil/state";
import axios from "axios";
import { getToken } from "../common/auth";
import MyCard from "../components/MyCard";

// custom component

const MyPage = () => {
  const handleBellBadges = useSetRecoilState(bellBedgeState);

  const [newName, handleNewName] = useState("");
  const [isConfig, handleIsConfig] = useState(false);
  const [alarms, handleAlarms] = useRecoilState(alarmsState);
  const [dibList, handleDibList] = useRecoilState(dibsState);
  const [userInfo, handleUserInfo] = useRecoilState(userInfoState);
  const [orderList, handleOrderList] = useRecoilState(orderListState);

  const requestChangeName = async () => {
    // TODO 사용자 이름을 변경하는 함수
    await axios.post(
      "https:localhost:3000/config-name",
      {
        newName: newName,
        // password
      },
      {
        headers: {
          authorization: `Bearer ${getToken().token}`,
        },
      }
    );
    handleAlarms((old) => {
      return [
        ...old,
        {
          text: "이름변경 성공!",
        },
      ];
    });
    setTimeout(() => {
      handleAlarms((old) => {
        return [...old].slice(1);
      });
    }, 1000);
    location.replace("/");
  };

  return (
    <Page name="basket">
      <Navbar sliding={false}>
        <NavTitle title="마이페이지"></NavTitle>
      </Navbar>
      {
        isConfig && (
          <Button
            className="absolute top-8 right-3 h-16 w-20"
            href="/config-pw"
          >
            비밀번호 변경
          </Button>
        )
        // <button class="col button button-fill open-password">Password</button>
      }
      {alarms.map((alarm, idx) => (
        <div key={idx} className="alarm-buy">
          {alarm.text}
        </div>
      ))}
      <div
        className="flex flex-col p-8 flex items-center flex justify-center"
        style={{ color: "#F3EAD7" }}
      >
        <div className="flex flex-col flex items-center">
          <img
            className="rounded-full w-32"
            style={{ borderColor: "#C79A3A", borderWidth: "2px" }}
            src="https://tistory4.daumcdn.net/tistory/3459371/attach/0c93fe49f9f14ceba804f63bdee55b30"
          ></img>
          {!isConfig ? (
            <div className="text-3xl mt-1" style={{ color: "#F3EAD7" }}>
              {userInfo.name}
            </div>
          ) : (
            <div
              className="text-3xl mt-1 flex flex-col"
              style={{ color: "#F3EAD7" }}
            >
              <input
                type="text"
                className="text-3xl"
                defaultValue={userInfo.name}
                onChange={(e) => handleNewName(e.target.value)}
                style={{
                  color: "#F3EAD7",
                  fontSize: "1.875rem",
                  textAlign: "center",
                  borderBottom: "1px solid white",
                }}
              />
              <section className="flex items-center justify-center">
                <Button
                  fill
                  className="mt-3 w-32"
                  style={{
                    background: "#f3ead7",
                    color: "black",
                  }}
                  onClick={requestChangeName}
                >
                  확인
                </Button>
              </section>
            </div>
          )}

          <div className="text-lg text-gray-400">{userInfo.email}</div>

          <div
            style={{ color: "#F3EAD7" }}
            className="text-xl flex flex-row m-2 items-center justify-center"
          >
            <img
              src="https://cdn.gamermarkt.com/files/images/lol/other/rp_logo.png"
              className="w-5 h-5 m-0.5"
            ></img>
            <span>{userInfo.rp}</span>
          </div>
        </div>
        <hr
          style={{
            borderColor: "#C79A3A",
            borderWidth: "0.1px",
            width: "100%",
          }}
        ></hr>

        <section className="flex flex-col justify-center items-center font-bold	text-lg p-8">
          <p className="">귀하의 등급은 {userInfo.tier} 입니다</p>
          <img src={userInfo.tierImg} className="w-4/5"></img>

          <p>{userInfo.tierNum} 번 더 주문시 등급 상승</p>
        </section>
        <hr
          className=""
          style={{ borderColor: "#C79A3A", borderWidth: "1px", width: "100%" }}
        ></hr>

        <p className="text-lg mt-9 font-bold">찜목록</p>
        <List className="flex flex-row overflow-scroll w-full">
          {dibList.length > 0
            ? dibList.map((dib, idx) => {
                // 최근 찜 아이탬이 앞으로 가야됨
                return (
                  <MyCard
                    idx={dib.id}
                    img={dib.Item.img}
                    name={dib.Item.name}
                    itemId={dib.itemId}
                    item={dib.Item}
                  />
                );
              })
            : "찜 목록이 없습니다"}
        </List>
      </div>

      <Fab position="right-bottom" slot="fixed" color="white">
        <Icon
          ios="f7:plus"
          aurora="f7:plus"
          md="material:add"
          color="black"
        ></Icon>
        <Icon
          ios="f7:xmark"
          aurora="f7:xmark"
          md="material:close"
          color="black"
        ></Icon>
        <FabButtons position="top">
          {/* 수정을 누르면 닉네임을 수정할 수 있어야 됨 */}
          <button onClick={() => handleIsConfig((old) => !old)}>
            <FabButton>
              <Icon ios="f7:pencil" aurora="f7:pencil" color="black"></Icon>
            </FabButton>
          </button>
          {/* <button className="mb-3" href="/delete-user"><FabButton label="탈퇴"><Icon ios="f7:trash" aurora="f7:trash"></Icon></FabButton></button> */}
          <a href="/delete-user" className="mb-3">
            <Icon ios="f7:trash" aurora="f7:trash" color="black"></Icon>
          </a>
        </FabButtons>
      </Fab>
    </Page>
  );
};
export default MyPage;
