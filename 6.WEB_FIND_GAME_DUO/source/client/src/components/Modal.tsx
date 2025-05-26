import axios from "axios";
import { useState } from "react";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";
import { getToken, setCookie } from "../common/auth";
import { Alarm, alarmModalState, isLoadingState } from "../state";
import { userInfoState } from "../state-persist";
import "../App.css";
import { setTimeRemoveAlarm } from "../common/api/page";

function Modal() {
  const [username, setUsername] = useState("");
  const setUserInfo = useSetRecoilState(userInfoState);
  const setAlarmModal = useSetRecoilState<Alarm[]>(alarmModalState);

  const postUsername = async () => {
    if (username.length > 2) {
      const { data } = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/username`,
        {
          username,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken().token}`,
          },
        }
      );

      if (data) {
        setCookie("isUsername", true);
        setUserInfo((old: object) => {
          return { ...old, username: username };
        });
        window.history.pushState("signin", "", "/");
        window.history.go(0);
      }
    } else {
      setAlarmModal((old) => [
        { text: "소환사명은 3글자 이상입니다", type: 0 },
        ...old,
      ]);
      setTimeRemoveAlarm(setAlarmModal);
    }
  };

  return (
    <div
      className="fixed z-40 overflow-y-auto md:w-full w-full flex justify-center items-center"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        aria-hidden="true"
      ></div>
      <div className="flex w-full h-screen justify-center items-center">
        {/* <span
          className="flex sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span> */}

        {/* focus */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-lg md:w-96 w-80">
          <div className="bg-white pt-6 pl-6 pr-6 ">
            <div className="sm:text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex justify-center items-center">
                <img
                  width="32"
                  height="32"
                  className="animate-bounce mt-1"
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnN2Z2pzPSJodHRwOi8vc3ZnanMuY29tL3N2Z2pzIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeD0iMCIgeT0iMCIgdmlld0JveD0iMCAwIDQxNy44MTMzMyA0MTciIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTIiIHhtbDpzcGFjZT0icHJlc2VydmUiIGNsYXNzPSIiPjxnPjxwYXRoIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZD0ibTE1OS45ODgyODEgMzE4LjU4MjAzMWMtMy45ODgyODEgNC4wMTE3MTktOS40Mjk2ODcgNi4yNS0xNS4wODIwMzEgNi4yNXMtMTEuMDkzNzUtMi4yMzgyODEtMTUuMDgyMDMxLTYuMjVsLTEyMC40NDkyMTktMTIwLjQ2ODc1Yy0xMi41LTEyLjUtMTIuNS0zMi43Njk1MzEgMC00NS4yNDYwOTNsMTUuMDgyMDMxLTE1LjA4NTkzOGMxMi41MDM5MDctMTIuNSAzMi43NS0xMi41IDQ1LjI1IDBsNzUuMTk5MjE5IDc1LjIwMzEyNSAyMDMuMTk5MjE5LTIwMy4yMDMxMjVjMTIuNTAzOTA2LTEyLjUgMzIuNzY5NTMxLTEyLjUgNDUuMjUgMGwxNS4wODIwMzEgMTUuMDg1OTM4YzEyLjUgMTIuNSAxMi41IDMyLjc2NTYyNCAwIDQ1LjI0NjA5M3ptMCAwIiBmaWxsPSIjMzRkMzk5IiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIiBzdHlsZT0iIiBjbGFzcz0iIj48L3BhdGg+PC9nPjwvc3ZnPg=="
                />
              </div>
              <h3
                className="mt-4 text-xl leading-6 font-medium text-gray-900 "
                id="modal-title"
              >
                거의 다 됐습니다!
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 font-semibold">
                  마지막으로 라이엇 계정명을 등록하세요 :D
                </p>
                <p className="text-xs text-gray-500">
                  추후 마이페이지에서 수정 가능합니다
                </p>
              </div>
              <div className="mt-2 md:w-full w-full">
                <Input
                  type="text"
                  className="w-full"
                  placeholder="ex) 소환사명"
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                ></Input>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 bg-green-400 text-base font-medium text-white hover:bg-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={postUsername}
            >
              완료
            </button>
            {/* <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={}
            >
              취소
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

const Input = styled.input({
  outline: "none",
  color: "#343a40",
  backgroundColor: "#e9ecef",
  fontSize: "1.1rem",
  padding: "0.9rem",
  borderRadius: "0.375rem",
  marginBottom: "0.7rem",
});

export default Modal;
