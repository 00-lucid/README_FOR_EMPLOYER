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
  Checkbox,
} from "framework7-react";
import React, { useState } from "react";
import "../css/app.less";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  basketState,
  contactsState,
  isContactState,
  selectContactsState,
  isAddItemState,
  selectTagState,
  selectOptionState,
  itemState,
  allTagState,
  thumbnailState,
} from "../recoil/state";
import { Formik, Field, Form } from "formik";
import axios from "axios";
import { getToken } from "../common/auth";
import * as Yup from "yup";

const CreateItemSchema = Yup.object().shape({
  name: Yup.string().required("필수 입력사항 입니다"),
  price: Yup.number().required("필수 입력사항 입니다"),
});
// initialValues={{ name: "", price: "", file: {}, tag: [] }}

const CreateItemPage = () => {
  const tags = useRecoilValue(allTagState);

  const [selectTag, handleSelectTag] = useRecoilState(selectTagState);
  const [selectOption, handleOption] = useRecoilState(selectOptionState);

  const [view, setView] = useState(0);
  const [imgFile, setImgFile] = useState(null); // 파일 전송을 위한 state
  const [imgBase64, setImgBase64] = useState(""); // 업로드 될 이미지
  const [priceVal, handlePriceVal] = useState("");
  const [optionVal, handleOptionVal] = useState("");

  const removeOptionBox = (idx) => {
    handleOption((old) => [...old.slice(0, idx), ...old.slice(idx + 1)]);
  };

  const requestUpload = async () => {
    // TODO 아이탬 업로드 API로 요청을 보내는 함수
    // ! 사진 업로드 기능 미구현
    axios.post(
      `${process.env.API_URL}/upload`,
      {
        formData: imgFile,
      },
      {
        headers: {
          authorization: `Bearer ${getToken().token}`,
        },
      }
    );
  };

  const changeImg = (event) => {
    // TODO 썸네일 출력을 위한 함수
    const reader = new FileReader();

    reader.onload = function () {
      const base64 = reader.result;
      if (base64) {
        // 파일 base64 상태 업데이트
        setImgBase64(base64.toString());
        // url
      }
    };
    if (event.target.files[0]) {
      // 1. 파일을 읽어 버퍼에 저장
      reader.readAsDataURL(event.target.files[0]);
      // 파일 상태 업데이트
      setImgFile(event.target.files[0]);
      // file obj
    }
  };

  const requestOption = () => {
    axios.post(
      `${process.env.API_URL}/add-option`,
      {
        option: selectOption,
      },
      {
        headers: {
          authorization: `Bearer ${getToken().token}`,
        },
      }
    );
  };

  const requestTag = () => {
    axios.post(
      `${process.env.API_URL}/add-tag`,
      {
        tag: selectTag,
      },
      {
        headers: {
          authorization: `Bearer ${getToken().token}`,
        },
      }
    );
  };

  return (
    // TODO 추가 옵션과 추가 태그 정보는 state로 관리하다가 submit시 전송
    <>
      <Page name="write" noToolbar>
        <Navbar title="상품추가" backLink />
        <div id="thumbnail">
          {/* 썸네일 */}
          <img src={imgBase64}></img>
        </div>
        <Formik
          initialValues={{ name: "", price: "", file: {}, tag: [] }}
          onSubmit={async (values) => {
            values.file = imgFile;

            await axios.post(`${process.env.API_URL}/create-item`, values, {
              headers: {
                authorization: `Bearer ${getToken().token}`,
              },
            });

            await requestOption();

            await requestTag();

            await requestUpload();

            location.replace("/");
          }}
        >
          {({
            handleChange,
            handleBlur,
            values,
            errors,
            touched,
            isSubmitting,
            isValid,
            setFieldValue,
          }) => (
            <Form className="p-8">
              <ul>
                <List>
                  <div
                    style={{
                      backgroundColor: "#02111b",
                      color: "#f3ead7",
                    }}
                    className="p-3 font-semibold bg-white"
                  >
                    기본 정보
                  </div>
                  <ListInput
                    style={{
                      backgroundColor: "#02111b",
                    }}
                    type="text"
                    name="name"
                    placeholder="상품명"
                    clearButton
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.name}
                    errorMessageForce={true}
                    errorMessage={touched.name && errors.name}
                  />
                  <input
                    id="file"
                    name="file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setFieldValue("file", e.currentTarget.files[0]);
                      changeImg(e);
                    }}
                  />
                  <img src />
                  <ListInput
                    style={{
                      backgroundColor: "#02111b",
                    }}
                    type="text"
                    name="price"
                    placeholder="가격"
                    clearButton
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.price}
                    errorMessageForce={true}
                    errorMessage={touched.name && errors.name}
                  />
                  <Block
                    className="flex flex-row inline"
                    style={{
                      color: "#F3EAD7",
                    }}
                  >
                    <List className="overflow-scroll flex flex-row">
                      {tags.map((tag) => (
                        <Checkbox
                          className="flex flex-row w-20"
                          value={`${tag.tag}`}
                          onChange={(e) => {
                            handleSelectTag((old) => {
                              if (old.includes(e.target.value)) {
                                const index = old.indexOf(e.target.value);
                                return [
                                  ...old.slice(0, index),
                                  ...old.slice(index + 1),
                                ];
                              } else {
                                return [...old, e.target.value];
                              }
                            });
                          }}
                        >
                          <p className="w-20">{tag.tag}</p>
                        </Checkbox>
                      ))}
                    </List>
                  </Block>
                  <Block>
                    {/* 옵션 생성 블럭 */}

                    {selectOption.length &&
                      selectOption.map((box, idx) => {
                        return (
                          <section
                            className="p-4 mt-5"
                            style={{
                              borderColor: "#C79A3A",
                              borderWidth: "1px",
                            }}
                          >
                            <Button
                              onClick={() => {
                                removeOptionBox(idx);
                              }}
                              className="absolute right-0"
                            >
                              <Icon
                                ios="f7:multiply"
                                aurora="f7:multiply"
                                md="material:close"
                              ></Icon>
                            </Button>
                            <div
                              className="bg-white text-black"
                              style={{
                                backgroundColor: "#02111b",
                                color: "white",
                              }}
                            >
                              {box.option}
                            </div>
                            <div
                              className="bg-white text-black"
                              style={{
                                backgroundColor: "#02111b",
                                color: "white",
                              }}
                            >
                              {box.price}
                            </div>
                          </section>
                        );
                      })}
                    <List className="font-semibold bg-white">
                      <ListInput
                        type="text"
                        style={{
                          backgroundColor: "#02111b",
                        }}
                        placeholder="옵션이름"
                        className="w-full"
                        onChange={(e) => {
                          handleOptionVal(e.target.value);
                        }}
                      ></ListInput>
                      <ListInput
                        type="text"
                        style={{
                          backgroundColor: "#02111b",
                        }}
                        placeholder="옵션가격"
                        className="w-full"
                        onChange={(e) => {
                          handlePriceVal(e.target.value);
                        }}
                      ></ListInput>
                    </List>
                    {optionVal && priceVal && (
                      <Button
                        onClick={() =>
                          handleOption((old) => {
                            return [
                              ...old,
                              {
                                id: old.length + 1,
                                option: optionVal,
                                price: priceVal,
                              },
                            ];
                          })
                        }
                      >
                        옵션생성
                      </Button>
                    )}
                  </Block>
                  <button
                    className="fixed h-16 z-50 text-lg font-semibold flex justify-center items-center bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    type="submit"
                    style={{
                      bottom: "60px",
                      width: "335px",
                      left: "16.5px",
                    }}
                  >
                    확인
                  </button>
                </List>
              </ul>
            </Form>
          )}
        </Formik>
      </Page>
    </>
  );
};
export default CreateItemPage;
