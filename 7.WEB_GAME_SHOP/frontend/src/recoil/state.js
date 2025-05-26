import { atom } from "recoil";

// page basket state store
export const basketState = atom({
  key: "basketState", // unique ID
  // initial value
  // fake data
  default: [],
});

export const itemState = atom({
  key: "itemState",
  default: [],
});

export const userState = atom({
  key: "uesrState",
  default: {},
});

export const curItemInfoState = atom({
  key: "curItemInfoState",
  default: {
    name: "불러오는 중",
    img: "불러오는 중",
    price: 0,
    state: "loading",
    rate: "0.0",
    review: 9,
    arrOption: [
      {
        id: 1,
        itemId: 1,
        option: "loading",
        optionPrice: 0,
        createdAt: "2021-04-02T03:30:12.000Z",
        updatedAt: "2021-04-02T03:30:12.000Z",
      },
    ],
  },
});

export const contactsState = atom({
  key: "contactsState",
  default: [{ name: "test", id: 1 }],
});

export const orderListState = atom({
  key: "orderList",
  default: [{ id: 1, total: 900, buyOption: "default", buyCount: 1 }],
});

export const dibsState = atom({
  key: "dibsState",
  default: [],
});

export const alarmsState = atom({
  key: "alarmsState",
  default: [],
});

export const userInfoState = atom({
  key: "userState",
  default: { email: "...@..." },
});

export const isContactState = atom({
  key: "isContactState",
  default: false,
});

export const selectContactsState = atom({
  key: "selectContactsState",
  default: [],
});

export const isPopWriteState = atom({
  key: "isPopWriteState",
  default: false,
});

export const reviewGaugeState = atom({
  key: "reviewGaugeState",
  default: 0.5,
});

export const textState = atom({
  key: "textState",
  default: "",
});

export const reviewState = atom({
  key: "reviewState",
  default: [],
});

export const tagState = atom({
  key: "tagState",
  default: [],
});

export const relationItemState = atom({
  key: "relationItemState",
  default: [],
});

export const isAddItemState = atom({
  key: "isAddItemState",
  default: false,
});

export const statisticState = atom({
  key: "statisticState",
  default: {
    statisticTagSale: [],
    tierArr: [],
  },
});

export const isSearchState = atom({
  key: "isSearchState",
  default: false,
});

export const searchKeywordState = atom({
  key: "searchKeywordState",
  default: "",
});

export const keywordRateState = atom({
  key: "keywordRate",
  default: [],
});

export const allTagState = atom({
  key: "allTagState",
  default: [],
});

export const filterTagState = atom({
  key: "filterTagState",
  default: [],
});

export const bellState = atom({
  key: "bellState",
  default: [
    {
      text: "리그오브레전드 상점에 오신걸 환영합니다",
      createdAt: "당신과 제가 만난 날",
    },
  ],
});

export const bellBedgeState = atom({
  key: "bellBedgeState",
  default: [],
});

export const isActionState = atom({
  key: "isActionState",
  default: false,
});

export const selectTagState = atom({
  key: "selectTagState",
  default: [],
});

export const selectOptionState = atom({
  key: "selectOptionState",
  default: [],
});

export const selectRpState = atom({
  key: "selectRpState",
  default: "580",
});

export const thumbnailState = atom({
  key: "thumbnailState",
  default: "",
});

export const recentItemState = atom({
  key: "recentItemState",
  default: [],
});

export const categoryState = atom({
  key: "categoryState",
  default: "",
});
