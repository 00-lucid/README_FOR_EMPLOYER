import axios from "axios";
import moment from "moment";
import { useState } from "react";
import styled from "styled-components";
import { movePage } from "../common/api/page";
import { getToken } from "../common/auth";
import CommentList from "./CommentList";
import CommentWrite from "./CommentWrite";
import PostBtn from "./PostBtn";

function Post() {
  return (
    <>
      <section className="flex flex-col shadow-sm h-auto p-4 mb-2 bg-white ">
        <section className="flex font-bold text-sm text-gray-300 justify-between items-center">
          <p className="bg-gray-300 rounded">로딩중입니다</p>
          <p className="pt-1 pb-1 pl-2 pr-2 bg-gray-300 rounded text-gray-300 rounded">
            로딩
          </p>
        </section>
        <section className="flex flex-start font-semibold text-lg h-28 text-gray-300">
          <p className="bg-gray-300 rounded h-8">로딩중입니다로딩중입니다</p>
        </section>
        <section className="flex justify-between items-center flex text-sm text-gray-300 font-bold">
          <section className="flex flex-1">
            {/* icon is freepik */}
            <section className="cursor-pointer mr-6 bg-gray-300 rounded">
              로딩중입니다
            </section>
            <section className="cursor-pointer bg-gray-300 rounded">
              로딩중입니다
            </section>
          </section>
          <section className="flex flex-row items-center justify-between w-32 text-xs">
            <p className="bg-gray-300 rounded">로딩중입니다</p>
            <p className="bg-gray-300 rounded">로딩중입니다</p>
          </section>
        </section>
      </section>
    </>
  );
}

export default Post;
