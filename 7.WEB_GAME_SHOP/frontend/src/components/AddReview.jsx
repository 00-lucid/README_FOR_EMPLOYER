import {
  App,
  f7,
  f7ready,
  Link,
  List,
  ListItem,
  Navbar,
  Page,
  PageContent,
  Panel,
  Toolbar,
  View,
  Views,
  Icon,
  Button,
  Block,
  Gauge,
  Segmented,
  TextEditor,
} from "framework7-react";
// 프레임워크7이 web-app을 mobile-app으로 변환 가능한 이유는 내장된 component들을 사용하기 때문이다.

import "lodash";
import React, { useEffect, useState } from "react";
import { logout } from "../common/api";
import { destroyToken, getToken } from "../common/auth";
import store from "../common/store";
import { getDevice } from "../js/framework7-custom.js";
import routes from "../js/routes";
import i18n from "../lang/i18n";

import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import {
  allTagState,
  contactsState,
  dibsState,
  itemState,
  orderListState,
  relationItemState,
  selectContactsState,
  statisticState,
  textState,
  userInfoState,
} from "../recoil/state";
import axios from "axios";

const AddReview = ({ reviewGauge, handleReviewGauge }) => {
  const [text, handleText] = useRecoilState(textState);

  const [selectContacts, handleSelectContacts] = useRecoilState(
    selectContactsState
  );

  const requestAddReview = async () => {
    const { data } = await axios.post(
      `${process.env.API_URL}/add-review`,
      {
        text: text,
        rate: reviewGauge,
        contacts: selectContacts,
      },
      {
        headers: {
          authorization: `Bearer ${getToken().token}`,
        },
      }
    );

    handleSelectContacts([]);

    location.replace("/");
  };

  const cancelReview = () => {
    handleSelectContacts([]);

    location.replace("/");
  };

  return (
    <>
      <section className="flex flex-col">
        <div className="flex flex-row items-center justify-center m-20">
          <Block strong className="text-align-center">
            <Gauge
              type="circle"
              value={reviewGauge}
              size={250}
              borderColor="#2196f3"
              borderWidth={10}
              valueText={`${reviewGauge * 100}%`}
              valueFontSize={41}
              valueTextColor="#2196f3"
              labelText="만족도"
              className="m-4"
            />
            <Segmented tag="p" raised>
              <Button
                active={reviewGauge === 0}
                onClick={() => handleReviewGauge(0.2)}
              >
                1점
              </Button>
              <Button
                active={reviewGauge === 0.25}
                onClick={() => handleReviewGauge(0.4)}
              >
                2점
              </Button>
              <Button
                active={reviewGauge === 0.5}
                onClick={() => handleReviewGauge(0.6)}
              >
                3점
              </Button>
              <Button
                active={reviewGauge === 0.75}
                onClick={() => handleReviewGauge(0.8)}
              >
                4점
              </Button>
              <Button
                active={reviewGauge === 1}
                onClick={() => handleReviewGauge(1.0)}
              >
                5점
              </Button>
            </Segmented>
          </Block>
        </div>
        <TextEditor
          placeholder="Enter text..."
          mode="popover"
          buttons={["bold", "italic", "underline", "strikeThrough"]}
          style={{
            "--f7-text-editor-height": "150px",
            backgroundColor: "#02111b",
            borderWidth: "1px",
            borderColor: "#C79A3A",
          }}
          onTextEditorChange={(value) => {
            handleText(value);
          }}
        />
        <div className="flex flex-row justify-center">
          <Button text="취소" onClick={cancelReview}></Button>
          <Button text="전송" onClick={requestAddReview}></Button>
        </div>
      </section>
    </>
  );
};

export default AddReview;
