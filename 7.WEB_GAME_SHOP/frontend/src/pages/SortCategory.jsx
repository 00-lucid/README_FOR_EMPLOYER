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
import React, { useEffect, useState } from "react";
import "../css/app.less";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  basketState,
  categoryState,
  contactsState,
  curItemInfoState,
  isContactState,
  itemState,
  recentItemState,
  relationItemState,
  reviewState,
  selectContactsState,
  tagState,
} from "../recoil/state";
import axios from "axios";
import Grid from "../components/Grid";
import NotGrid from "../components/NotGrid";

// custom component

const SortCategoryPage = () => {
  const items = useRecoilValue(itemState);

  const handleReview = useSetRecoilState(reviewState);
  const handleCurItemInfo = useSetRecoilState(curItemInfoState);

  const [isGrid, handleIs4] = useState(false);
  const [tags, handleTag] = useRecoilState(tagState);
  const [category, handleCategory] = useRecoilState(categoryState);
  const [recentItem, handleRecentItem] = useRecoilState(recentItemState);
  const [relationItems, handleRelationItemState] = useRecoilState(
    relationItemState
  );

  const sort = (tags) => {
    // TODO 상품의 태그를 기반으로 알맞는 카테고리에 상품을 배치하는 함수
    const sorting = tags.filter((tag, idx) => {
      if (tags[idx - 1] && tags[idx + 1] && category !== "세트") {
        return !(
          tag.itemId === tags[idx - 1].itemId ||
          tag.itemId === tags[idx + 1].itemId
        );
      } else if (tags[idx - 1] && tags[idx + 1]) {
        return (
          tag.itemId === tags[idx - 1].itemId ||
          tag.itemId === tags[idx + 1].itemId
        );
      }
    });
    const sortArr = sorting
      .filter((tag) => tag.tag === category)
      .map((el) => el.itemId);

    return sortArr;
  };

  return (
    <>
      <Page
        name="write"
        style={{
          color: "#F3EAD7",
        }}
        noToolbar
      >
        <Navbar sliding={false} backLink>
          <NavTitle title={category}></NavTitle>
        </Navbar>

        <Block className="h-full">
          <section className="flex flex-row items-center mt-3 mb-3">
            <p className="text-lg ml-3">{category}</p>
            {isGrid ? (
              <button className="w-7" onClick={() => handleIs4(false)}>
                <Icon
                  className="ml-2"
                  size="22"
                  ios="f7:rectangle_grid_1x2"
                  aurora="f7:rectangle_grid_1x2"
                ></Icon>
              </button>
            ) : (
              <button className="w-7" onClick={() => handleIs4(false)}>
                <Icon
                  className="ml-2"
                  size="22"
                  ios="f7:rectangle_grid_1x2_fill"
                  aurora="f7:rectangle_grid_1x2_fill"
                ></Icon>
              </button>
            )}

            {isGrid ? (
              <button className="w-7" onClick={() => handleIs4(true)}>
                <Icon
                  className="ml-2"
                  size="22"
                  ios="f7:rectangle_grid_2x2_fill"
                  aurora="f7:rectangle_grid_2x2_fill"
                ></Icon>
              </button>
            ) : (
              <button className="w-7" onClick={() => handleIs4(true)}>
                <Icon
                  className="ml-2"
                  size="22"
                  ios="f7:rectangle_grid_2x2"
                  aurora="f7:rectangle_grid_2x2"
                ></Icon>
              </button>
            )}
          </section>
          <section className="h-full overflow-scroll">
            {!isGrid && (
              <ul className="flex flex-col items-center justify-center pb-10">
                {!isGrid &&
                  items.map((item) => {
                    return sort(tags).includes(item.id) ? (
                      <NotGrid key={item.id} item={item} />
                    ) : null;
                  })}
              </ul>
            )}

            {isGrid && (
              <ul className="pb-10 flex">
                <section className="flex items-around flex-wrap">
                  {items.map((item) => {
                    return sort(tags).includes(item.id) ? (
                      <Grid key={item.id} item={item} />
                    ) : null;
                  })}
                </section>
              </ul>
            )}
          </section>
        </Block>
      </Page>
    </>
  );
};
export default SortCategoryPage;
