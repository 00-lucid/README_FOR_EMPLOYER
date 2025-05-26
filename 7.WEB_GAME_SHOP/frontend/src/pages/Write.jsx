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

// custom component

const WritePage = () => {
  const requestTossRefund = (amount) => {
    // 토스 환불
    axios.post(`${Toss}/refunds`, {
      apiKey: "YOUR_API_KEY",
      payToken: "결제할 때 받은 결제 건에 대한 token",
      amount: amount,
      amountTaxable: 5000,
      amountTaxFree: 4000,
      amountVat: 500,
      amountServiceFee: 500,
    });
  };

  return (
    <>
      <Page name="write">
        <Navbar sliding={false}>
          <NavLeft>
            <Link icon="las la-bars" panelOpen="left" />
          </NavLeft>
          <NavTitle title="문의하기"></NavTitle>
        </Navbar>
        <Button onClick={requestTossRefund}>환불</Button>
      </Page>
    </>
  );
};
export default WritePage;
