import axios from "axios";
import {
  Button,
  f7ready,
  Page,
  Navbar,
  Swiper,
  SwiperSlide,
  Toolbar,
  Block,
  NavTitle,
  List,
  ListItem,
  NavRight,
  Link,
  Icon,
  Subnavbar,
  Segmented,
  Tab,
  Tabs,
} from "framework7-react";
import React, { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Pagination } from "swiper";
import { getToken } from "../common/auth";
import sanitizeHtml from "../js/utils/sanitizeHtml";
import { bellBedgeState, bellState } from "../recoil/state";

const BellPage = (props) => {
  const [bells, handleBells] = useRecoilState(bellState);
  const handleBellBadges = useSetRecoilState(bellBedgeState);

  const deleteBells = async () => {
    // TODO 벨 데이터를 삭제하는 함수
    // ! 미완성
    handleBells([]);
    const { data } = await axios.delete("https://localhost:3000/delete-bells", {
      headers: {
        authrization: `Bearer ${getToken().token}`,
      },
    });
  };

  useEffect(() => {
    handleBellBadges([]);
  });

  const arrBells = [...bells];
  arrBells.reverse();
  return (
    <Page
      noToolbar
      style={{
        color: "#F3EAD7",
      }}
    >
      <Navbar title="알림" backLink>
        <NavRight>
          <Link onClick={deleteBells}>
            <Icon ios="f7:trash" aurora="f7:trash"></Icon>
          </Link>
        </NavRight>
      </Navbar>
      <List className="overflow-scroll h-screen">
        {arrBells.length > 0 &&
          arrBells.map((bell, idx) => {
            return bell.read ? (
              <ListItem
                key={idx}
                title={bell.text}
                header={bell.createdAt}
                style={{
                  backgroundColor: "#02111b",
                }}
              />
            ) : (
              <ListItem
                key={idx}
                title={bell.text}
                header={bell.createdAt}
                style={{
                  backgroundColor: "#02111b",
                }}
              >
                <div className="bg-red-500 w-3 h-3 rounded-full"></div>
              </ListItem>
            );
          })}
      </List>
    </Page>
  );
};
export default BellPage;
