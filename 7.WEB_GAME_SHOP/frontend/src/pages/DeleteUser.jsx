import {
  Block,
  BlockTitle,
  Button,
  Col,
  Link,
  List,
  ListItem,
  Navbar,
  NavLeft,
  NavRight,
  NavTitle,
  Page,
  Row,
  Searchbar,
  Card,
  Fab,
  FabButton,
  FabButtons,
  Icon,
  TextEditor,
  ListInput,
} from "framework7-react";
import React from "react";
import "../css/app.less";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  basketState,
  contactsState,
  isContactState,
  selectContactsState,
} from "../recoil/state";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { destroyToken, getToken } from "../common/auth";
import helper from "./modules/helper";

// custom component

const SignInSchema = Yup.object().shape({
  password: Yup.string()
    .min(4, "길이가 너무 짧습니다")
    .max(50, "길이가 너무 깁니다")
    .required("필수 입력사항 입니다"),
});

const DeleteUserPage = () => {
  return (
    <>
      <Page
        noToolbar
        name="write"
        style={{
          color: "#F3EAD7",
        }}
      >
        <Navbar sliding={false} backLink>
          <NavLeft>
            <Link icon="las la-bars" panelOpen="left" />
          </NavLeft>
          <NavTitle title="회원탈퇴"></NavTitle>
        </Navbar>
        <Formik
          initialValues={{ password: "", check: "" }}
          validationSchema={SignInSchema}
          onSubmit={async (values) => {
            // TODO 회원 탈퇴 API로 요청을 보내는 부분
            if (values.check === "정말 탈퇴하겠습니다") {
              await axios.post(`${process.env.API_URL}/delete-user`, values, {
                headers: {
                  authorization: `Bearer ${getToken().token}`,
                },
              });
              // 탈퇴가 끝나면
              // 유저를 홈으로 돌려보냄 && 로그아웃을 시킴
              destroyToken();

              location.replace("/");
            } else {
              helper.showToastCenter("정확하게 작성해주세요");
            }
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
                  label={i18next.t("login.password")}
                  name="password"
                  style={{
                    backgroundColor: "#02111b",
                  }}
                  type="password"
                  placeholder="현재 비밀번호를 입력해주세요."
                  clearButton
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  errorMessageForce={true}
                  errorMessage={touched.password && errors.password}
                />
                <ListInput
                  label="정말 탈퇴하시겠습니까?"
                  name="check"
                  style={{
                    backgroundColor: "#02111b",
                  }}
                  placeholder="'정말 탈퇴하겠습니다' 똑같이 입력해주세요"
                  clearButton
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.check}
                  errorMessageForce={true}
                />
              </List>
              <div className="p-1">
                <button
                  type="submit"
                  style={{
                    background: "#e63946",
                  }}
                  className="button button-fill button-large disabled:opacity-50"
                  disabled={isSubmitting || !isValid}
                >
                  탈퇴
                </button>
              </div>
            </form>
          )}
        </Formik>
      </Page>
    </>
  );
};

// 032828

export default DeleteUserPage;
