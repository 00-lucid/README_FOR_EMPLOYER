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
  PieChart,
  Segmented,
} from "framework7-react";
import React, { useEffect } from "react";
import "../css/app.less";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  basketState,
  contactsState,
  isContactState,
  selectContactsState,
  isAddItemState,
  statisticState,
} from "../recoil/state";
import { Formik, Field, Form } from "formik";

// custom component

const AdminPage = () => {
  const statistic = useRecoilValue(statisticState);

  const [isAddItem, handleIsAddItem] = useRecoilState(isAddItemState);

  const tagBuy = statistic.statisticTagSale.map((obj) => {
    // TODO 태그별 구매 인원 PIECHART를 랜더하기 위해 랜덤한 색상을 뽑아 서버에서 받은 데이터와 병합하는 코드
    var randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return Object.assign({}, obj, { color: `#${randomColor}` });
  });

  const userTier = statistic.tierArr.map((obj) => {
    // TODO 사용자 티어 분포 PIECHART를 랜더하기 위해 랜덤한 색상을 뽑아 서버에서 받은 데이터와 병합하는 코드
    var randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return Object.assign({}, obj, { color: `#${randomColor}` });
  });

  return (
    <>
      <Page name="write">
        <Navbar title="관리자" />
        <section className="flex flex-row">
          <Block
            strong
            className="flex flex-col items-center justify-center m-5"
            style={{
              color: "#F3EAD7",
            }}
          >
            <p className="text-lg">사용자 티어 분포</p>
            <PieChart className="w-auto" tooltip datasets={userTier} />
          </Block>
          <Block
            strong
            className="flex flex-col items-center justify-center m-5"
            style={{
              color: "#F3EAD7",
            }}
          >
            <p className="text-lg">태그별 구매 인원</p>
            <PieChart className="w-auto" tooltip datasets={tagBuy} />
          </Block>
        </section>

        <a
          className="fixed h-16 z-50 text-lg font-semibold flex justify-center items-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          style={{
            bottom: "270px",
            left: "16.5px",
            width: "335px",
            // color: "#F3EAD7",
            // backgroundColor: "#e63946",
          }}
        >
          초기화
        </a>
        <a
          className="fixed h-16 z-50 text-lg font-semibold flex justify-center items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          style={{
            bottom: "200px",
            left: "16.5px",
            width: "335px",
            borderWidth: "1px",
            borderColor: "#C79A3A",
            // color: "#F3EAD7",
            backgroundColor: "#060a0f",
          }}
        >
          회원 관리
        </a>
        <a
          href="/admin/delete-item"
          className="fixed h-16 z-50 text-lg font-semibold flex justify-center items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          style={{
            bottom: "130px",
            left: "16.5px",
            width: "335px",
            borderWidth: "1px",
            borderColor: "#C79A3A",
            // color: "#F3EAD7",
            backgroundColor: "#060a0f",
          }}
        >
          상품 삭제
        </a>
        <a
          href="/admin/create-item"
          className="fixed h-16 z-50 text-lg font-semibold flex justify-center items-center text-white font-bold py-2 px-4 rounded"
          style={{
            bottom: "60px",
            width: "335px",
            left: "16.5px",
            // borderWidth: "1px",
            // borderColor: "#c79a3a",
            color: "#060a0f",
            backgroundColor: "#f3ead7",
          }}
        >
          상품 추가
        </a>
      </Page>
    </>
  );
};
export default AdminPage;
