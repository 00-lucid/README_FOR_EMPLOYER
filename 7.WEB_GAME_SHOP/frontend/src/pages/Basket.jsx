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
  f7,
} from "framework7-react";
import React, { useEffect } from "react";
import "../css/custom.css";
import "../css/app.less";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  basketState,
  alarmsState,
  bellBedgeState,
  bellState,
  isActionState,
  orderListState,
} from "../recoil/state";
import axios from "axios";
import { getToken } from "../common/auth";
import helper from "./modules/helper";
import BasketItem from "../components/BasketItem";
import { toast, sleep } from "../js/utils.js";

// custom component

const BasketPage = () => {
  // items는 장바구니에 담긴 아이탬들
  let total = 0;
  const orderList = useRecoilValue(orderListState);

  const handleBells = useSetRecoilState(bellState);
  const handleOrderList = useSetRecoilState(orderListState);
  const handleBellBadges = useSetRecoilState(bellBedgeState);

  const [items, handleItems] = useRecoilState(basketState);
  const [alarms, handleAlarms] = useRecoilState(alarmsState);
  const [isAction, handleIsAction] = useRecoilState(isActionState);

  const buyBasket = async () => {
    if (!getToken().token) {
      helper.showToastCenter("로그인이 필요합니다");

      return;
    }

    if (total === 0) {
      helper.showToastCenter("장바구니가 비어있습니다");
      return;
    }

    // 지금 비회원 상태에서 장바구니를 사용하게 되면 해당 아이탬을 로그인한 상태에서 구매했을 때 userId가 없기 때문에 주문내역에서 가져오지 못하는에러
    const { data } = await axios.post(
      `${process.env.API_URL}/order`,
      {
        total: total,
      },
      {
        headers: {
          authorization: `Bearer ${getToken().token}`,
        },
      }
    );

    if (data) {
      helper.showToastCenter(data);
      return;
    }

    handleItems([]);

    helper.saveLineItem([]);

    handleAlarms((old) => [...old, { text: "구매 성공!" }]);

    setTimeout(() => handleAlarms((old) => [...old].slice(1)), 1000);

    if (getToken().token) {
      helper.postBell(
        getToken().token,
        `${items[0].name} 포함 ${items.length}개의 상품을 구매 하셨습니다`,
        handleBellBadges,
        handleBells,
        handleIsAction
      );
    }
  };

  return (
    <Page name="basket p-0">
      <Navbar sliding={false}>
        <NavTitle title="장바구니"></NavTitle>
      </Navbar>
      {alarms.map((alarm, idx) => (
        <div key={idx} className="alarm-buy">
          {alarm.text}
        </div>
      ))}
      <List className="p-0">
        <ul>
          {items &&
            items.length > 0 &&
            items.map((item, idx) => {
              //  item.sale이 null이 아니면 item.price에 sale을 적용한 값에 count와 option을 더하거나 곱해줘야 함
              let subTotal;
              const salePrice =
                Number(item.price) -
                Number(item.price) * (Number(item.sale) * 0.01);
              if (typeof salePrice === "number") {
                subTotal =
                  (salePrice +
                    (item.optionBox === "default"
                      ? 0
                      : Number(item.optionBox.split(" ")[1]))) *
                  Number(item.countBox);
                total +=
                  (salePrice -
                    (item.optionBox === "default"
                      ? 0
                      : Number(item.optionBox.split(" ")[1]))) *
                  Number(item.countBox);
              } else {
                subTotal =
                  (Number(item.price) +
                    (item.optionBox === "default"
                      ? 0
                      : Number(item.optionBox.split(" ")[1]))) *
                  Number(item.countBox);
                total +=
                  (Number(item.price) +
                    (item.optionBox === "default"
                      ? 0
                      : Number(item.optionBox.split(" ")[1]))) *
                  Number(item.countBox);
              }

              return <BasketItem item={item} subTotal={subTotal} />;
            })}
        </ul>
      </List>
      <div className="flex text-xl font-black items-center justify-center rounded-md overflow-hidden mb-16">
        {getToken().token ? (
          <button
            className="fixed h-16 z-50 text-lg font-semibold flex flex-row items-center justify-center"
            onClick={buyBasket}
            style={{
              bottom: "60px",
              width: "335px",
              // borderWidth: "1px",
              borderColor: "#C79A3A",
              color: "#060a0f",
              backgroundColor: "#f3ead7",
            }}
          >
            {`${total} RP`}
          </button>
        ) : (
          <Link
            href="/users/sign_in"
            className="fixed h-16 z-50 text-lg font-semibold flex flex-row items-center justify-center"
            style={{
              bottom: "60px",
              width: "335px",
              // borderWidth: "1px",
              borderColor: "#C79A3A",
              color: "#060a0f",
              backgroundColor: "#f3ead7",
            }}
            onClick={buyBasket}
          >
            {`${total} RP`}
          </Link>
        )}
      </div>
    </Page>
  );
};
export default BasketPage;
