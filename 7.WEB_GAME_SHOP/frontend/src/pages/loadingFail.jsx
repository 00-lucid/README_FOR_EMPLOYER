import axios from "axios";
import {
  Button,
  f7ready,
  Page,
  Navbar,
  Swiper,
  SwiperSlide,
  Toolbar,
  NavTitle,
  f7,
} from "framework7-react";
import React, { useEffect, useState } from "react";
import { Pagination } from "swiper";
import { getToken } from "../common/auth";
import sanitizeHtml from "../js/utils/sanitizeHtml";

const LoadingFailPage = () => {
  return (
    <>
      <Page
        noToolbar
        style={{
          color: "#F3EAD7",
        }}
      >
        <Navbar sliding={false}>
          <NavTitle></NavTitle>
        </Navbar>
        <section className="flex flex-col justify-center items-center">
          <p className="text-3xl mt-10 ">☠ 결제실패 ☠</p>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm5bNTxpk9R4uJ-TxLAG0SlnO7ONRWsKKGCg&usqp=CAU"
            className="mt-10 w-screen"
          ></img>
          <a
            href="/"
            className="fixed h-16 z-50 text-lg font-semibold flex justify-center items-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            style={{
              bottom: "60px",
              width: "335px",
              left: "16.5px",
            }}
          >
            홈으로 돌아가기
          </a>
        </section>
      </Page>
    </>
  );
};
export default LoadingFailPage;
