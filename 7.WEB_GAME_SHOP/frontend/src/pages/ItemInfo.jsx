import "../css/app.less";
import "../css/custom.css";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { getToken } from "../common/auth";
import helper from "./modules/helper";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  basketState,
  curItemInfoState,
  alarmsState,
  reviewState,
  relationItemState,
  tagState,
  recentItemState,
  bellBedgeState,
  bellState,
  isActionState,
} from "../recoil/state";
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
  Icon,
  Badge,
} from "framework7-react";
import MyCard from "../components/MyCard";
import Review from "../components/Review";
import ReviewTitle from "../components/ReviewTitle";
import PriceBox from "../components/PriceBox";
import { toast, sleep } from "../js/utils.js";

// custom component

const ItemInfo = ({ id }) => {
  const tags = useRecoilValue(tagState);
  const reviews = useRecoilValue(reviewState);
  const recentItems = useRecoilValue(recentItemState);
  // const curItemInfo = useRecoilValue(curItemInfoState);

  const handleReview = useSetRecoilState(reviewState);
  const handleBellBadges = useSetRecoilState(bellBedgeState);
  const handleBells = useSetRecoilState(bellState);
  const handleIsAction = useSetRecoilState(isActionState);
  // const handleCurItemInfo = useSetRecoilState(curItemInfoState);

  const [info, handleInfo] = useState({});
  const [onDib, handleOnDib] = useState(false);
  // const [isScroll, handleIsScroll] = useState(true);
  const [items, handleItems] = useRecoilState(basketState);
  const [alarms, handleAlarms] = useRecoilState(alarmsState);
  const [recentItem, handleRecentItem] = useRecoilState(recentItemState);
  const [relationItems, handleRelationItemState] = useRecoilState(
    relationItemState
  );

  const getSelectValue = () => {
    const optionBox = document.querySelector("#option-box");
    const countBox = document.querySelector("#count-box");
    return [optionBox.value, countBox.value];
  };

  useEffect(async () => {
    const url = location.href.split("/");
    const itemId = url[url.length - 1];

    if (!getToken().token) {
      const { data } = await axios.post(
        `${process.env.API_URL}/get-item-info`,
        {
          id: itemId,
        }
      );
      handleInfo(data);
    } else {
      const { data } = await axios.post(
        `${process.env.API_URL}/get-item-info`,
        {
          id: itemId,
        },
        {
          headers: {
            authorization: `Bearer ${getToken().token}`,
          },
        }
      );

      handleInfo(data);
    }
  }, []);

  const addItem = async (item) => {
    // TODO 장바구니에 아이탬을 담고 lineitem에 추가하는 함수
    if (
      items &&
      items.length > 0 &&
      items.filter((el) => el.name === item.name).length >= 1
    ) {
      // alert("이미 장바구니에 있습니다");
      helper.showToastCenter("이미 장바구니에 있습니다");
      return;
    }
    const arrVal = await getSelectValue();
    if (!getToken().token) {
      if (items && items.length > 0) {
        handleItems((oldItems) => [
          ...oldItems,
          { ...item, optionBox: arrVal[0], countBox: arrVal[1] },
        ]);
      } else {
        handleItems([{ ...item, optionBox: arrVal[0], countBox: arrVal[1] }]);
      }
      helper.helpAddAlarm("장바구니에 추가 되었습니다!", handleAlarms);
    } else {
      const subTotal =
        (Number(item.price) +
          (arrVal[0] === "default"
            ? 0
            : Number(getSelectValue()[0].split(" ")[1]))) *
        Number(arrVal[1]);
      await axios.post(
        `${process.env.API_URL}/add-line-item`,
        {
          name: item.name,
          img: item.img,
          lineTotal: subTotal,
          buyOption: arrVal[0],
          buyCount: arrVal[1],
          itemId: item.id,
        },
        {
          headers: {
            authorization: `Bearer ${getToken().token}`,
          },
        }
      );
      if (items && items.length > 0) {
        handleItems((oldItems) => [
          ...oldItems,
          { ...item, optionBox: arrVal[0], countBox: arrVal[1] },
        ]);
      } else {
        handleItems([{ ...item, optionBox: arrVal[0], countBox: arrVal[1] }]);
      }
      helper.helpAddAlarm("장바구니에 추가 되었습니다!", handleAlarms);
    }
  };
  const addDib = async () => {
    // TODO 찜목록 추가 함수
    if (getToken().token) {
      await axios.post(
        `${process.env.API_URL}/add-dib`,
        { id: info.id },
        { headers: { authorization: `Bearer ${getToken().token}` } }
      );
      handleOnDib((old) => {
        old
          ? helper.showToastIcon("찜 목록에 제거되었습니다", false)
          : helper.showToastIcon("찜 목록에 추가되었습니다", true);
        return !old;
      });
    } else {
      helper.showToastCenter("로그인이 필요합니다");
    }
  };

  const buyItem = async (item) => {
    const arrVal = await getSelectValue();
    const subTotal =
      (await (Number(item.price) +
        (arrVal[0] === "default"
          ? 0
          : Number(getSelectValue()[0].split(" ")[1])))) * Number(arrVal[1]);
    if (getToken().token) {
      const { data } = await axios.post(
        `${process.env.API_URL}/order-now`,
        {
          name: item.name,
          img: item.img,
          lineTotal: subTotal,
          buyOption: arrVal[0],
          buyCount: arrVal[1],
          itemId: item.id,
          total: subTotal,
        },
        {
          headers: { authorization: `Bearer ${getToken().token}` },
        }
      );
      if (data === "잔액이 부족합니다") {
        helper.showToastCenter("RP가 부족합니다");
        return;
      }

      helper.postBell(
        getToken().token,
        `${info.name} 상품을 구매 하셨습니다`,
        handleBellBadges,
        handleBells,
        handleIsAction
      );
      helper.helpAddAlarm("구매 성공!", handleAlarms);
    } else {
      helper.showToastCenter("로그인이 필요합니다");
    }
  };

  return (
    <Page name="basket" className="w-full" noToolbar hideNavbarOnScroll>
      <Navbar sliding={false}>
        <NavLeft>
          <Navbar backLink="Back" />
        </NavLeft>
        <NavTitle title="상세보기"></NavTitle>
      </Navbar>
      {alarms.map((alarm, idx) => (
        <div key={idx} className="alarm">
          {alarm.text}
        </div>
      ))}
      <div className="w-full">
        <Block className="item-info-main flex flex-col items-center justify-around w-full">
          <Block
            className="item-info-img"
            style={{
              backgroundImage: "url(" + info.img + ")",
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          ></Block>

          <Block className="item-info-option w-full p-5">
            <section className="flex flex-row items-center w-full">
              <div
                className="info-title"
                style={{
                  color: "#F3EAD7",
                  fontSize: "1.2rem",
                }}
              >
                {info.name}
              </div>
              {getToken().token && (
                <Button
                  className="absolute right-3"
                  style={{
                    color: "red",
                  }}
                  outlin
                  onClick={() => {
                    addDib();
                  }}
                >
                  {info.dib || onDib ? (
                    <Icon ios="f7:heart_fill" aurora="f7:heart"></Icon>
                  ) : (
                    <Icon ios="f7:heart" aurora="f7:heart"></Icon>
                  )}
                </Button>
              )}

              {!getToken().token && (
                <Button
                  className="absolute right-3"
                  href="/users/sign_in"
                  outlin
                  onClick={() => {
                    addDib();
                  }}
                >
                  {info.dib || onDib ? (
                    <Icon ios="f7:heart_fill" aurora="f7:heart"></Icon>
                  ) : (
                    <Icon ios="f7:heart" aurora="f7:heart"></Icon>
                  )}
                </Button>
              )}
            </section>

            <PriceBox curItemInfo={info} />

            <div className="info-option">
              <select id="option-box" name="option-box">
                <option value="default">default</option>
                {info.arrOption &&
                  info.arrOption.map((option) => {
                    return (
                      <option
                        key={option.id}
                        value={`${option.option} +${option.optionPrice} 원`}
                      >{`${option.option} +${option.optionPrice} 원`}</option>
                    );
                  })}
                {/* <option value="red">red</option> */}
              </select>
            </div>

            <div className="info-count">
              <select id="count-box" name="count-box">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                  return (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  );
                })}
                {/* <option value="1">1</option> */}
              </select>
            </div>

            <section className="bg-section fixed h-16 z-50 ">
              <button
                className="fixed h-16 z-50 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                style={{
                  bottom: "90px",
                  width: "335px",
                  left: "16.5px",
                  backgroundColor: "#011019",
                  color: "#ffffff",
                  borderWidth: "1px",
                  borderColor: "#C79A3A",
                }}
                onClick={() => {
                  addItem(info);
                }}
              >
                장바구니
              </button>

              {getToken().token && (
                <button
                  className="fixed h-16 z-50 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => buyItem(info)}
                  style={{
                    bottom: "20px",
                    width: "335px",
                    left: "16.5px",
                    backgroundColor: "#C79A3A",
                  }}
                >
                  바로구매
                </button>
              )}

              {!getToken().token && (
                <Link
                  className="fixed h-16 z-50 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  href="/users/sign_in"
                  onClick={buyItem}
                  style={{
                    bottom: "20px",
                    width: "335px",
                    left: "16.5px",
                    backgroundColor: "#C79A3A",
                  }}
                >
                  바로구매
                </Link>
              )}
            </section>
          </Block>
        </Block>

        <Block className="p-8">
          <p className="text-xl" style={{ color: "#F3EAD7" }}>
            관련 상품
          </p>

          <List className="overflow-scroll flex flex-row">
            {relationItems.length > 0
              ? relationItems.map((item) => (
                  <MyCard key={item.id} item={item} />
                ))
              : "loading..."}
          </List>
        </Block>

        <Block className="p-8">
          <p className="text-xl" style={{ color: "#F3EAD7" }}>
            최근 본 아이탬
          </p>

          <List
            className="overflow-scroll flex flex-row"
            style={{
              color: "#F3EAD7",
            }}
          >
            {recentItems.length > 0
              ? recentItems.map((item) => <MyCard key={item.id} item={item} />)
              : "최근 본 아이탬이 없습니다"}
          </List>
        </Block>

        <Block className="p-8">
          <section className="flex flex-row">
            <p className="text-xl" style={{ color: "#F3EAD7" }}>
              댓글
            </p>
            {info.rate >= 3.5 ? (
              <ReviewTitle reviews={reviews} curItemInfo={info} />
            ) : (
              <ReviewTitle reviews={reviews} curItemInfo={info} />
            )}
          </section>
          <List className="overflow-scroll h-44">
            {
              // itemId에 해당하는 리뷰를 가져와서 랜더해줘야됨
              // 컴포넌트화
              reviews.map((review) => {
                return <Review review={review} />;
              })
            }
          </List>
        </Block>
      </div>
    </Page>
  );
};
export default ItemInfo;
