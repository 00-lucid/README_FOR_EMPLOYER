import axios from "axios";
import {
  Button,
  f7ready,
  Page,
  Navbar,
  Swiper,
  SwiperSlide,
  Link,
  Toolbar,
  Block,
  NavTitle,
  List,
  ListItem,
  Searchbar,
  Card,
} from "framework7-react";
import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Pagination } from "swiper";
import { getToken } from "../common/auth";
import sanitizeHtml from "../js/utils/sanitizeHtml";
import {
  curItemInfoState,
  itemState,
  keywordRateState,
  relationItemState,
  reviewState,
  searchKeywordState,
} from "../recoil/state";

const SearchPage = (props) => {
  const items = useRecoilValue(itemState);
  const keywordRate = useRecoilValue(keywordRateState);

  const handleReview = useSetRecoilState(reviewState);
  const handleCurItemInfo = useSetRecoilState(curItemInfoState);

  const [searchKeyword, handleSearchKeyword] = useRecoilState(
    searchKeywordState
  );
  const [relationItems, handleRelationItemState] = useRecoilState(
    relationItemState
  );

  const requestCurItemInfo = async (itemId) => {
    // 카드의 id를 이용해서 알맞는 아이탬 내용을 가져와 state에 저장해야 합니다.
    // 해당 state는 ItemInfo page 랜더에 활용됩니다.
    if (getToken().token) {
      const { data } = await axios.post(
        `${process.env.API_URL}/get-item-info`,
        { id: itemId },
        { headers: { authorization: `Bearer ${getToken().token}` } }
      );

      handleReview(data.reviews);

      handleRelationItemState(data.relationItems);

      handleCurItemInfo(data);
    } else {
      const { data } = await axios.post(
        `${process.env.API_URL}/get-item-info`,
        {
          id: itemId,
        }
      );

      handleReview(data.reviews);

      handleCurItemInfo(data);

      handleRelationItemState(data.relationItems);
    }
  };

  const requestSearchKeyword = () => {
    // TODO 인기 검색어를 위한 검색어 기록 함수
    if (
      searchKeyword !== "" &&
      searchKeyword !== " " &&
      searchKeyword !== "  "
    ) {
      axios.post(
        `${process.env.API_URL}/search`,
        {
          keyword: searchKeyword,
        },
        {
          headers: {
            authorization: `Bearer ${getToken().token}`,
          },
        }
      );
    }
  };

  return (
    <Page
      noToolbar
      style={{
        color: "#F3EAD7",
      }}
    >
      <Navbar title="검색" backLink />
      <NavTitle>
        <Searchbar
          placeholder="'상품명' 으로 검색"
          searchContainer=".search-list"
          searchIn=".item-title"
          onSearchbarSearch={(searchbar, query, previousQuery) =>
            handleSearchKeyword(query)
          }
        ></Searchbar>
      </NavTitle>
      <Block strong inset>
        <p className="text-lg ml-5 mt-5 mb-2">인기 검색어</p>
        <List className="flex flex-col overflow-scroll h-40 mt-0 p-0">
          {keywordRate.map((keyword, idx) => (
            <ListItem
              key={keyword.id}
              header={`${idx + 1} 등`}
              title={keyword.keyword}
              style={{
                backgroundColor: "#02111b",
              }}
            ></ListItem>
          ))}
        </List>
      </Block>
      <Block>
        <List className="search-list h-96 overflow-scroll">
          {/* 전체 아이탬 리스트 */}
          {items.map((item) => {
            return (
              <ListItem
                key={item.id}
                style={{ backgroundColor: "#02111b" }}
                title={item.name}
                href={`/item-info/${item.id}`}
                onClick={() => {
                  requestSearchKeyword();
                }}
              ></ListItem>
            );
          })}
        </List>
      </Block>
    </Page>
  );
};
export default SearchPage;
