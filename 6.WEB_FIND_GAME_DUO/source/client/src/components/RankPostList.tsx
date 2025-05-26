import moment from "moment";
import { useState } from "react";
import styled from "styled-components";
import moveHome, { movePage } from "../common/api/page";

function RankPostList({ idx, rank }: any) {
  const createdAt = moment(rank.createdAt).fromNow();

  return (
    // 클릭시 커뮤니티 페이지로 이동후 해당 게시글로 스크롤 됨
    <>
      <li className="h-auto flex flex-row items-center cursor-pointer">
        <section className="w-1/6">{idx + 1}</section>
        <section className="bg-gray-300 h-full md:w-24">
          <img></img>
        </section>
        <section className="flex-1 h-full flex flex-col justify-center items-start m-2">
          <div className="md:text-sm text-xs text-left">
            <span className="font-normal ">{rank.title}</span>
            <span className="font-normal text-green-400 ml-1">{`${rank.likeCount}`}</span>
          </div>
          <div className="text-xs flex flex-row w-full justify-between">
            <p className="text-gray-400">{createdAt}</p>
            <p className="text-gray-400">{rank.nickname}</p>
          </div>
        </section>
      </li>
    </>
  );
}

export default RankPostList;
