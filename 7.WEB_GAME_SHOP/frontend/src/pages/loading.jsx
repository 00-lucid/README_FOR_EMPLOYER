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

const LoadingPage = () => {
  const token = getToken().token;
  useEffect(async () => {
    const query = location.search.split("&");
    await axios.post(
      `${process.env.API_URL}/success`,
      { query: query },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
  }, []);
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
          <p className="text-3xl mt-10 ">🎉 결제성공 🎉</p>
          <img
            src="https://img1.daumcdn.net/thumb/R720x0/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fliveboard%2Fgameabout%2F367608094338425382150c9575318db5.jpg"
            className="mt-10"
          ></img>
          <a
            href="/"
            className="fixed h-16 z-50 text-lg font-semibold flex justify-center items-center bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
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
export default LoadingPage;
