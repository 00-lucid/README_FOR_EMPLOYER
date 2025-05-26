import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import styled from "styled-components";
import moveHome, { setTimeRemoveAlarm } from "../common/api/page";
import { setCookie } from "../common/auth";
import Modal from "../components/Modal";
import TopMenu from "../components/TopMenu";
import { Alarm, alarmModalState, isLoadingState } from "../state";
import Loading from "./Loading";

function Signup() {
  const setAlarmModal = useSetRecoilState<Alarm[]>(alarmModalState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useRecoilState(isLoadingState);

  const isPasswordCheck = () => {
    return password === passwordCheck;
  };

  const isAll = () => {
    return isEmail() && isPassword() && isNickname();
  };

  const isEmail = () => {
    const emailRule =
      /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
    return emailRule.test(email);
  };

  const isPassword = () => {
    // 특수문자 / 대문자 1개이상 && 8자리 이상
    const passwordRule =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    return passwordRule.test(password);
  };

  const isNickname = () => {
    // 한 / 영 / 수 두자리 이상 9자리 이하
    const nicknameRule = /^([a-zA-Z0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣]).{1,10}$/;
    return nicknameRule.test(nickname);
  };

  const feedback = (callback: Function, style: any) => {
    if (!callback()) {
      style.border = "2px solid red";
    } else {
      style.border = "none";
    }
  };

  const postSignup = async () => {
    if (isPasswordCheck() && isAll()) {
      setIsLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/signup`,
        {
          email,
          password,
          nickname,
        }
      );

      if (!data) {
        // 실패시
        alert("exist account of email");
        setIsLoading(false);
        return;
      }
      // 로딩이 너무 빠른 관계로 오히려 시간을 늘림

      // TODO: cookie logic
      setCookie("isUsername", false);

      setIsLoading(false);

      window.history.pushState("signup", "", "/signin");
      window.history.go(0);
    } else {
      setAlarmModal((old) => [
        { text: "잘못된 이메일 또는 비밀번호 또는 비밀번호 확인", type: 0 },
        ...old,
      ]);
      setTimeRemoveAlarm(setAlarmModal);
    }
  };

  return (
    <>
      <section className="flex flex-col items-center">
        <TopMenu />
        <main className="flex flex-row w-full h-full items-center justify-center mt-24">
          <Card className="bg-white rounded-xl">
            <p className="text-3xl font-bold mb-6">SignUp</p>
            <Input
              type="text"
              placeholder="email"
              onChange={(e) => {
                setEmail(e.target.value);
                feedback(isEmail, e.target.style);
              }}
            ></Input>
            <Input
              type="password"
              placeholder="password"
              onChange={(e) => {
                setPassword(e.target.value);
                feedback(isPassword, e.target.style);
              }}
            ></Input>
            <Input
              type="password"
              placeholder="password check"
              onChange={(e) => setPasswordCheck(e.target.value)}
            ></Input>
            <Input
              type="text"
              placeholder="nickname (not game name)"
              onChange={(e) => {
                setNickname(e.target.value);
                feedback(isNickname, e.target.style);
              }}
            ></Input>
            <section>
              <SocialLoginBtn
                className="bg-green-400 flex justify-center items-center w-full"
                onClick={postSignup}
              >
                {isLoading ? <Loading></Loading> : "완료"}
              </SocialLoginBtn>
              <Link to="/signin" className="font-semibold">
                i have account or social login
              </Link>
            </section>
          </Card>
        </main>
      </section>
    </>
  );
}

const Card = styled.div({
  padding: "2.5rem",
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

const SocialLoginBtn = styled.button({
  color: "white",
  height: "55.17px",
  cursor: "pointer",
  marginBottom: "0.3rem",
  fontSize: "1.1rem",
  fontWeight: 600,
  borderRadius: "0.375rem",
});

export default Signup;
