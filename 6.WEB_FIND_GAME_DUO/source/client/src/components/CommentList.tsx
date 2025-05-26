import moment from "moment";
import { useState } from "react";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";
import { setTimeRemoveAlarm } from "../common/api/page";
import { Alarm, alarmModalState } from "../state";

function CommentList({ comment }: any) {
  const [isReport, setIsReport] = useState(false);
  const [isSympathy, setIsSympathy] = useState(false);
  const createdAt = moment(comment.createdAt).fromNow();

  const report = () => {
    // 신고하기
    setIsReport(true);
  };

  const sympathy = () => {
    // 공감하기
    setIsSympathy(true);
  };

  return (
    <>
      <section className="w-full h-auto border-green-400 flex flex-col text-sm mb-4">
        <section className="w-full flex flex-row justify-between itmes-center">
          <section className="flex flex-row items-center">
            <div className="mr-1 font-bold">{comment.user.nickname}</div>
            <div className="text-gray-400 text-xs">{createdAt}</div>
          </section>
          {isReport ? (
            <button
              className="w-6 h-6 text-xs text-red-400 font-bold"
              onClick={report}
            >
              신고
            </button>
          ) : (
            <button
              className="w-6 h-6 text-xs text-gray-400 font-bold"
              onClick={report}
            >
              신고
            </button>
          )}
        </section>
        <section className="flex flex-row text-left">
          <p>{comment.text}</p>
        </section>
        <section className="flex flex-row borer h-4 ">
          {isSympathy ? (
            <p
              className="text-green-400 text-xs cursor-pointer font-bold"
              onClick={sympathy}
            >
              공감하기
            </p>
          ) : (
            <p
              className="text-gray-400 text-xs cursor-pointer font-bold"
              onClick={sympathy}
            >
              공감하기
            </p>
          )}
        </section>
      </section>
    </>
  );
}

export default CommentList;
