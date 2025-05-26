import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import styled from "styled-components";
import Loading from "./Loading";
import { Alarm, alarmModalState, isLoadingState } from "../state";
import { saveToken } from "../common/auth";
import { userInfoState } from "../state-persist";
import moveHome, { setTimeRemoveAlarm } from "../common/api/page";
import TopMenu from "../components/TopMenu";

function Signin() {
  const setAlarmModal = useSetRecoilState<Alarm[]>(alarmModalState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useRecoilState(isLoadingState);
  const setUserInfo = useSetRecoilState(userInfoState);
  const client_id = process.env.REACT_APP_API_KEY_KAKAO;
  const redirect_url = process.env.REACT_APP_OAUTH_REDIRECT_URL;
  const postSignin = async () => {
    setIsLoading(true);
    const res = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/signin`,
      {
        email,
        password,
      },
      {
        withCredentials: true,
      }
    );
    if (!res.data) {
      setAlarmModal((old) => [
        { text: "잘못된 이메일 또는 비밀번호", type: 0 },
        ...old,
      ]);
      setTimeRemoveAlarm(setAlarmModal);

      setIsLoading(false);
      return;
    }
    saveToken({ token: res.data.token, csrf: null });
    setUserInfo((old: object) => {
      {
        return {
          ...old,
          nickname: res.data.nickname,
          username: res.data.username,
        };
      }
    });
    setIsLoading(false);
    window.history.pushState("signin", "", "/");
    window.history.go(0);
  };

  return (
    <>
      <section className="flex flex-col items-center">
        <TopMenu />
        <main className="flex flex-row  w-full h-full items-center justify-center mt-24">
          {/* <Card className="flex justify-center items-center">
          <img className="w-full" src="umi-removebg.png" alt="umi"></img>
        </Card> */}
          <Card className="bg-white rounded-xl p-10">
            <p className="text-3xl font-bold mb-6">SignIn</p>
            <Input
              type="text"
              placeholder="email"
              onChange={(e) => setEmail(e.target.value)}
            ></Input>
            <Input
              type="password"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            ></Input>
            <section className="flex flex-col">
              <SocialLoginBtn
                className="bg-green-400 flex justify-center items-center"
                onClick={postSignin}
              >
                {isLoading ? <Loading></Loading> : "OK"}
              </SocialLoginBtn>
              <SocialLoginBtn
                className="bg-yellow-300"
                href={`https://kauth.kakao.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_url}&response_type=code`}
              >
                <img src="icon_kakao_btn.png" className="w-full h-full" />
              </SocialLoginBtn>
              <Link to="/signup" className="font-semibold">
                create duoduo account
              </Link>
            </section>
          </Card>
        </main>
      </section>
    </>
  );
}

const Top = styled.header({
  width: "100%",
  height: "4rem",
  color: "white",
  backgroundColor: "#2b2d42",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
});

const Card = styled.div({
  width: "30rem",
  height: "30rem",
  display: "flex",
  flexDirection: "column",
});

const Input = styled.input({
  outline: "none",
  color: "#343a40",
  backgroundColor: "#e9ecef",
  fontSize: "1.1rem",
  padding: "0.9rem",
  borderRadius: "0.375rem",
  marginBottom: "0.7rem",
});

const SocialLoginBtn = styled.a({
  display: "flex",
  color: "white",
  height: "55.17px",
  cursor: "pointer",
  marginBottom: "0.3rem",
  fontSize: "1.1rem",
  fontWeight: 600,
  borderRadius: "0.375rem",
  justifyContent: "center",
  alignItems: "center",
});

export default Signin;
