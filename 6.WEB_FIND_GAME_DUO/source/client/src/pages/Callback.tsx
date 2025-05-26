import axios from "axios";
import { useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import styled from "styled-components";
import moveHome from "../common/api/page";
import { saveToken, setCookie } from "../common/auth";
import { isLoadingState } from "../state";
import { userInfoState } from "../state-persist";
import Loading from "./Loading";

function Callback() {
  const [isLoading, setIsLoading] = useRecoilState(isLoadingState);
  const setUserInfo = useSetRecoilState(userInfoState);
  useEffect(() => {
    setIsLoading(true);
    let auth_code = new URL(window.location.href).searchParams.get("code");
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/oauth/kakao?code=${auth_code}`)
      .then(({ data }) => {
        const token = data.token;
        saveToken({ token: token, csrf: null });
        setUserInfo((old: object) => {
          {
            return {
              ...old,
              nickname: data.nickname,
              // username: res.data.username,
            };
          }
        });
        if (data.signup) {
          setCookie("isUsername", false);
        }
        moveHome();
      });
  }, []);
  return (
    <>
      <img src="background_account.svg"></img>
    </>
  );
}

export default Callback;
