import React, { useEffect, useState } from "react";
import {
  f7,
  Page,
  Navbar,
  List,
  ListInput,
  Button,
  Checkbox,
  Link,
} from "framework7-react";
import { login } from "@/common/api";
import { toast, sleep } from "../../../js/utils.js";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { getToken, saveToken } from "../../../common/auth";
import helper from "../../modules/helper.js";
import { useSetRecoilState } from "recoil";
import { basketState, userInfoState } from "../../../recoil/state.js";
import { useCookies } from "react-cookie";

const SignInSchema = Yup.object().shape({
  email: Yup.string().email().required("필수 입력사항 입니다"),
  password: Yup.string()
    .min(4, "길이가 너무 짧습니다")
    .max(50, "길이가 너무 깁니다")
    .required("필수 입력사항 입니다"),
});

const SessionNewPage = () => {
  const handleItems = useSetRecoilState(basketState);
  const handleUserInfo = useSetRecoilState(userInfoState);
  const requestUserInfo = async () => {
    const { data } = await axios.get(`${process.env.API_URL}/user-info`, {
      headers: {
        authorization: `Bearer ${getToken().token}`,
      },
    });

    handleUserInfo(data);
  };
  // const [email, handleEmail] = useState("");

  // auto setting 정보는 loacalstorage에 저장되어야 함
  const [isAutoId, handleAutoId] = useState(false);
  const [isAutoLogin, handleAutoLogin] = useState(false);

  const [allowCookie, handleAllowCookie] = useState(true);
  const [cookies, setCookie, removeCookie] = useCookies([
    "rememberEmail",
    "rememberPassword",
  ]);

  useEffect(() => {
    // 체크박스 체크 정보를 가져온다
    const autoId = localStorage.getItem("autoId");
    const autoLogin = localStorage.getItem("autoLogin");

    if (autoLogin === "true") {
      // 체크박스 두개다 온시켜야됨
      handleAutoLogin(true);
      handleAutoId(true);
    } else if (autoId === "true") {
      // 체크박스 하나만 온시켜야됨
      handleAutoId(true);
    }
  }, []);

  useEffect(() => {
    const data = helper.getLineItem();
    helper.saveLineItem(data);
  }, []);
  return (
    <Page
      noToolbar
      style={{
        color: "#F3EAD7",
        backgroundColor: "#02111b",
      }}
    >
      <Navbar
        title={i18next.t("login.title")}
        backLink={true}
        sliding={false}
      />
      {/* <p className="font-semibole text-4xl text-center mt-5">로그인</p> */}
      <Formik
        initialValues={{
          email: cookies.rememberEmail ? cookies.rememberEmail : "",
          password: "",
        }}
        validationSchema={SignInSchema}
        onSubmit={async (values) => {
          // TODO 자동로그인, 아이디저장을 위한 쿠키 생성 및 localstorage 사용하는 로직
          if (isAutoLogin) {
            // 자동로그인
            setCookie("rememberEmail", values.email, { maxAge: 2000 });
            setCookie("rememberPassword", values.password, { maxAge: 2000 });
          } else if (isAutoId) {
            // 아이디 저장
            setCookie("rememberEmail", values.email, { maxAge: 2000 });
          } else {
            // nothing
            removeCookie("rememberEmail");
            removeCookie("rememberPassword");
          }

          const { data } = await axios.post(
            `${process.env.API_URL}/signin`,
            values
          );

          if (!data.message) {
            saveToken({ token: data.accToken, csrf: null });
          } else {
            helper.showToastCenter("잘못된 이메일, 패스워드입니다");
            return;
          }
          // handleAutoId 정보와 handleAutoLogin 정보를 저장해 줘야 함
          localStorage.setItem("autoId", `${isAutoId}`);
          localStorage.setItem("autoLogin", `${isAutoLogin}`);
          requestUserInfo();
          f7.dialog.preloader("정보를 확인중입니다...");
          setTimeout(() => {
            location.replace("/");
          }, 700);
        }}
        validateOnMount={true}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          isValid,
        }) => (
          <form onSubmit={handleSubmit}>
            <List>
              <ListInput
                label={i18next.t("login.email")}
                style={{
                  backgroundColor: "#02111b",
                }}
                name="email"
                type="email"
                placeholder="이메일을 입력해주세요."
                clearButton
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.email}
                errorMessageForce={true}
                errorMessage={touched.email && errors.email}
              />
              {/* <Checkbox>아이디저장</Checkbox> */}
              <section className="flex flex-row items-center justify-around">
                <div className="flex flex-row items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    name="login_setting"
                    value="auto_id"
                    checked={isAutoId || isAutoLogin}
                    onChange={() =>
                      handleAutoId((old) => {
                        if (!old) {
                          localStorage.removeItem("isAutoId");
                        }
                        return !old;
                      })
                    }
                  />
                  <p>아이디저장</p>
                </div>

                <div className="flex flex-row items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    name="login_setting"
                    value="auto_login"
                    checked={isAutoLogin}
                    onChange={() =>
                      handleAutoLogin((old) => {
                        if (!old) {
                          localStorage.removeItem("isAutoLogin");
                        }
                        return !old;
                      })
                    }
                  />
                  <p>자동로그인</p>
                </div>
              </section>
              <ListInput
                label={i18next.t("login.password")}
                style={{
                  backgroundColor: "#02111b",
                }}
                name="password"
                type="password"
                placeholder="비밀번호를 입력해주세요."
                clearButton
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.password}
                errorMessageForce={true}
                errorMessage={touched.password && errors.password}
              />
            </List>
            <div className="p-1">
              <button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={isSubmitting || !isValid}
                type="submit"
                style={{
                  color: "black",
                  backgroundColor: "#f3ead7",
                }}
              >
                로그인
              </button>
            </div>
          </form>
        )}
      </Formik>
      <a
        href="/users/sign_up"
        className="fixed h-16 z-50 text-lg font-semibold flex justify-center items-center bg-blue-500 text-white font-bold py-2 px-4 rounded"
        style={{
          bottom: "60px",
          width: "335px",
          left: "16.5px",
          // borderWidth: "1px",
          // borderColor: "#c79a3a",
          // color: "#060a0f",
          // backgroundColor: "#f3ead7",
        }}
      >
        회원가입
      </a>
    </Page>
  );
};

export default SessionNewPage;
