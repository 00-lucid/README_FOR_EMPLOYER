import { Ref, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import moveHome from "../common/api/page";
import { destroyToken, getCookie, getToken } from "../common/auth";
import Modal from "../components/Modal";
import RankList from "../components/RankList";
import RankPostList from "../components/RankPostList";
import TopMenu from "../components/TopMenu";
import UserCard from "../components/UserCard";
import { isLoadingState } from "../state";
import { userInfoState } from "../state-persist";
import "../interaction.css";
import { ElementAccessExpression } from "typescript";
import axios from "axios";

interface SceneInfo {
  type: string;
  heightNum: number;
  scrollHeight: number;
  objs: any;
  values: any;
}

const dummyRankList = [
  {
    username1: "qwjqonl",
    profileIconId1: 1298,
    username2: "MIDGOD 12",
    profileIconId2: 29,
  },
  {
    username1: "Shrimp Shark",
    profileIconId1: 22,
    username2: "빨간강타 삭제좀",
    profileIconId2: 26,
  },
  {
    username1: "Cc3cC",
    profileIconId1: 70,
    username2: "우제우스",
    profileIconId2: 68,
  },
  {
    username1: "대포미니언 압수",
    profileIconId1: 69,
    username2: "꿈에 보이다",
    profileIconId2: 71,
  },
  {
    username1: "어쩌라고맞짱뜰까",
    profileIconId1: 55,
    username2: "KT Castle",
    profileIconId2: 3,
  },
];

function Root() {
  let loggedIn = !!getToken().token;
  let isUsername = getCookie("isUsername");
  const userInfo = useRecoilValue(userInfoState);
  let curScene = 0;
  let yOffset = 0;
  let prevScrollHeight = 0;
  let enterNewScene = false;
  const refs: any = useRef([]);
  const animationRefs: any = useRef([]);
  const mainRef: any = useRef();

  let sceneInfo: SceneInfo[] = [];

  const calcValues = (values: any, currentYOffset: any) => {
    let rv;
    const scrollHeight = sceneInfo[curScene].scrollHeight;
    let scrollRatio = currentYOffset / scrollHeight;
    if (values.length === 3) {
      const partScrollStart = values[2].start * scrollHeight;
      const partScrollEnd = values[2].end * scrollHeight;
      const partScrollHeight = partScrollEnd - partScrollStart;

      if (
        currentYOffset >= partScrollStart &&
        currentYOffset <= partScrollEnd
      ) {
        rv =
          ((currentYOffset - partScrollStart) / partScrollHeight) *
            (values[1] - values[0]) +
          values[0];
      } else if (currentYOffset < partScrollStart) {
        rv = values[0];
      } else if (currentYOffset > partScrollEnd) {
        rv = values[1];
      }
    } else {
      rv = scrollRatio * (values[1] - values[0] + values[0]);
    }
    return rv;
  };

  const playAnimation = () => {
    const objs = sceneInfo[curScene]?.objs;
    const values = sceneInfo[curScene]?.values;
    const currentYOffset = yOffset + window.innerHeight - prevScrollHeight;
    const scrollHeight = sceneInfo[curScene]?.scrollHeight;
    const scrollRatio = currentYOffset / scrollHeight;

    switch (curScene) {
      case 1:
        if (scrollRatio <= 0.4) {
          objs.title.style.opacity = calcValues(
            values.titleOpacity_in,
            currentYOffset
          );
          objs.title.style.transform = `translateX(${calcValues(
            values.titleTranslateX_in,
            currentYOffset
          )}%)`;
          objs.text.style.opacity = calcValues(
            values.textOpacity_in,
            currentYOffset
          );
          objs.text.style.transform = `translateY(${calcValues(
            values.textTranslateY_in,
            currentYOffset
          )}%)`;
        } else {
          objs.title.style.transform = `translateX(${calcValues(
            values.titleTranslateX_out,
            currentYOffset
          )}%)`;
          objs.title.style.opacity = calcValues(
            values.titleOpacity_out,
            currentYOffset
          );
          objs.text.style.opacity = calcValues(
            values.textOpacity_out,
            currentYOffset
          );
          objs.text.style.transform = `translateY(${calcValues(
            values.textTranslateY_out,
            currentYOffset
          )}%)`;
        }
        break;
      case 2:
        if (scrollRatio <= 0.4) {
          objs.title.style.opacity = calcValues(
            values.titleOpacity_in,
            currentYOffset
          );
          objs.title.style.transform = `translateX(${calcValues(
            values.titleTranslateX_in,
            currentYOffset
          )}%)`;
          objs.text.style.opacity = calcValues(
            values.textOpacity_in,
            currentYOffset
          );
          objs.text.style.transform = `translateY(${calcValues(
            values.textTranslateY_in,
            currentYOffset
          )}%)`;
        } else {
          objs.title.style.transform = `translateX(${calcValues(
            values.titleTranslateX_out,
            currentYOffset
          )}%)`;
          objs.title.style.opacity = calcValues(
            values.titleOpacity_out,
            currentYOffset
          );
          objs.text.style.opacity = calcValues(
            values.textOpacity_out,
            currentYOffset
          );
          objs.text.style.transform = `translateY(${calcValues(
            values.textTranslateY_out,
            currentYOffset
          )}%)`;
        }
        break;
      case 3:
        if (scrollRatio <= 0.4) {
          objs.title.style.opacity = calcValues(
            values.titleOpacity_in,
            currentYOffset
          );
          objs.title.style.transform = `translateX(${calcValues(
            values.titleTranslateX_in,
            currentYOffset
          )}%)`;
          objs.text.style.opacity = calcValues(
            values.textOpacity_in,
            currentYOffset
          );
          objs.text.style.transform = `translateY(${calcValues(
            values.textTranslateY_in,
            currentYOffset
          )}%)`;
        } else {
          objs.title.style.transform = `translateX(${calcValues(
            values.titleTranslateX_out,
            currentYOffset
          )}%)`;
          objs.title.style.opacity = calcValues(
            values.titleOpacity_out,
            currentYOffset
          );
          objs.text.style.opacity = calcValues(
            values.textOpacity_out,
            currentYOffset
          );
          objs.text.style.transform = `translateY(${calcValues(
            values.textTranslateY_out,
            currentYOffset
          )}%)`;
        }
        break;
      case 4:
        if (scrollRatio <= 0.4) {
          objs.title.style.opacity = calcValues(
            values.titleOpacity_in,
            currentYOffset
          );
          objs.title.style.transform = `translateX(${calcValues(
            values.titleTranslateX_in,
            currentYOffset
          )}%)`;
          objs.text.style.opacity = calcValues(
            values.textOpacity_in,
            currentYOffset
          );
          objs.text.style.transform = `translateY(${calcValues(
            values.textTranslateY_in,
            currentYOffset
          )}%)`;
        } else {
          objs.title.style.transform = `translateX(${calcValues(
            values.titleTranslateX_out,
            currentYOffset
          )}%)`;
          objs.title.style.opacity = calcValues(
            values.titleOpacity_out,
            currentYOffset
          );
          objs.text.style.opacity = calcValues(
            values.textOpacity_out,
            currentYOffset
          );
          objs.text.style.transform = `translateY(${calcValues(
            values.textTranslateY_out,
            currentYOffset
          )}%)`;
        }
        break;
    }
  };

  const setLayout = () => {
    for (let scene of sceneInfo) {
      scene.scrollHeight = window.innerHeight * scene.heightNum;
      scene.objs.container.style.height = `${scene.scrollHeight}px`;
    }
    yOffset = window.pageYOffset;
    let totalScrollHeight = 0;
    for (let i = 0; i < sceneInfo.length; i++) {
      totalScrollHeight += sceneInfo[i].scrollHeight;
      if (totalScrollHeight >= yOffset) {
        curScene = i;
        break;
      }
    }

    mainRef.current.id = `show-scene-${curScene}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    sceneInfo = [
      // 0
      {
        type: "normal",
        heightNum: 1.5,
        scrollHeight: 0,
        objs: {
          container: refs.current[0],
        },
        values: {},
      },
      // 1
      {
        type: "sticky",
        heightNum: 3.5,
        scrollHeight: 0,
        objs: {
          container: refs.current[1],
          background: animationRefs.current[0],
          title: animationRefs.current[1],
          text: animationRefs.current[2],
        },
        values: {
          titleOpacity_in: [0, 1, { start: 0.1, end: 0.3 }],
          titleOpacity_out: [1, 0, { start: 0.7, end: 0.9 }],
          titleTranslateX_in: [-60, 0, { start: 0.1, end: 0.3 }],
          titleTranslateX_out: [0, -60, { start: 0.7, end: 0.9 }],
          textOpacity_in: [0, 1, { start: 0.3, end: 0.4 }],
          textOpacity_out: [1, 0, { start: 0.6, end: 0.7 }],
          textTranslateY_in: [-60, 0, { start: 0.3, end: 0.4 }],
          textTranslateY_out: [0, -60, { start: 0.6, end: 0.7 }],
        },
      },
      // 2
      {
        type: "sticky",
        heightNum: 3.5,
        scrollHeight: 0,
        objs: {
          container: refs.current[2],
          background: animationRefs.current[3],
          title: animationRefs.current[4],
          text: animationRefs.current[5],
        },
        values: {
          titleOpacity_in: [0, 1, { start: 0.1, end: 0.3 }],
          titleOpacity_out: [1, 0, { start: 0.7, end: 0.9 }],
          titleTranslateX_in: [-60, 0, { start: 0.1, end: 0.3 }],
          titleTranslateX_out: [0, -60, { start: 0.7, end: 0.9 }],
          textOpacity_in: [0, 1, { start: 0.3, end: 0.4 }],
          textOpacity_out: [1, 0, { start: 0.6, end: 0.7 }],
          textTranslateY_in: [-60, 0, { start: 0.3, end: 0.4 }],
          textTranslateY_out: [0, -60, { start: 0.6, end: 0.7 }],
        },
      },
      // 3
      {
        type: "sticky",
        heightNum: 3.5,
        scrollHeight: 0,
        objs: {
          container: refs.current[3],
          background: animationRefs.current[6],
          title: animationRefs.current[7],
          text: animationRefs.current[8],
        },
        values: {
          titleOpacity_in: [0, 1, { start: 0.1, end: 0.3 }],
          titleOpacity_out: [1, 0, { start: 0.7, end: 0.9 }],
          titleTranslateX_in: [-60, 0, { start: 0.1, end: 0.3 }],
          titleTranslateX_out: [0, -60, { start: 0.7, end: 0.9 }],
          textOpacity_in: [0, 1, { start: 0.3, end: 0.4 }],
          textOpacity_out: [1, 0, { start: 0.6, end: 0.7 }],
          textTranslateY_in: [-60, 0, { start: 0.3, end: 0.4 }],
          textTranslateY_out: [0, -60, { start: 0.6, end: 0.7 }],
        },
      },
      // 4
      {
        type: "sticky",
        heightNum: 3.5,
        scrollHeight: 0,
        objs: {
          container: refs.current[4],
          background: animationRefs.current[9],
          title: animationRefs.current[10],
          text: animationRefs.current[11],
        },
        values: {
          titleOpacity_in: [0, 1, { start: 0.1, end: 0.3 }],
          titleOpacity_out: [1, 0, { start: 0.7, end: 0.9 }],
          titleTranslateX_in: [-60, 0, { start: 0.1, end: 0.3 }],
          titleTranslateX_out: [0, -60, { start: 0.7, end: 0.9 }],
          textOpacity_in: [0, 1, { start: 0.3, end: 0.4 }],
          textOpacity_out: [1, 0, { start: 0.6, end: 0.7 }],
          textTranslateY_in: [-60, 0, { start: 0.3, end: 0.4 }],
          textTranslateY_out: [0, -60, { start: 0.6, end: 0.7 }],
        },
      },
    ];
    window.addEventListener("scroll", () => {
      if (window.location.href !== `${process.env.REACT_APP_CLIENT_URL}`) {
        window.addEventListener("scroll", () => {});
        return;
      }
      enterNewScene = false;
      yOffset = window.pageYOffset;
      prevScrollHeight = 0;
      for (let i = 0; i < curScene; i++) {
        prevScrollHeight += sceneInfo[i].scrollHeight;
      }
      if (
        yOffset + window.innerHeight >
        prevScrollHeight + sceneInfo[curScene]?.scrollHeight
      ) {
        curScene++;
        enterNewScene = true;
      }
      if (yOffset + window.innerHeight < prevScrollHeight) {
        if (curScene === 0) return;
        curScene--;
        enterNewScene = true;
      }

      if (mainRef.current != null) {
        mainRef.current.id = `show-scene-${curScene}`;
      }

      if (enterNewScene) return;

      playAnimation();
    });
    setLayout();
  }, []);

  return (
    <>
      {loggedIn && isUsername === "false" && <Modal></Modal>}
      <section className="flex flex-col items-center">
        <TopMenu></TopMenu>
        <Main id={`show-scene-0`} ref={mainRef}>
          <section
            id="scroll-section-0"
            className="flex flex-col"
            ref={(el) => (refs.current[0] = el)}
          >
            <Screen
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0), rgba(255,255,255,0), rgba(255,255,255,0)), url('https://kr-publish.s3.amazonaws.com/notice/0268f49d4d229bcee46589954838b252d9aa3f89.jpg')",
                backgroundPosition: "center",
                backgroundSize: "100%",
                backgroundRepeat: "no-repeat",
                marginTop: "18px",
                height: "auto",
              }}
            >
              <p className="text-white text-5xl font-black flex flex-col items-start pl-4 pr-4 pt-10 pb-10">
                <p className="mb-4">BETA</p>
                <p className="text-base font-medium md:text-lg">
                  현재 테스트 중인 웹 서비스입니다
                </p>
                <p className="text-base font-medium md:text-lg">
                  버그 또는 문제 발생시 가장 아래를 참고하시고 문의주세요 :D
                </p>
              </p>
            </Screen>
            <Screen
              className="flex flex-col items-start"
              style={{
                marginTop: "18px",
              }}
            >
              <p className="text-left text-xl font-bold w-full border-b border-black flex flex-row justify-between items-center p-2">
                베스트 듀오 💞
                <p className="text-sm font-medium text-gray-400 cursor-pointer">
                  전체보기
                </p>
              </p>
              <ul className="flex flex-col w-full">
                {dummyRankList?.map((el: any, idx: number) => {
                  return <RankList key={idx} idx={idx} rank={el} />;
                })}
              </ul>
              {/* <p
                className="text-left text-xl font-bold w-full border-b border-black flex flex-row justify-between items-center p-2"
                style={{ marginTop: "18px" }}
              >
                베스트 게시글 🔥
                <Link to="/community/all?page=0">
                  <p className="text-sm font-medium text-gray-400 cursor-pointer">
                    전체보기
                  </p>
                </Link>
              </p>
              <section className="w-full flex flex-row ">
                {bestPosts.length > 0 ? (
                  <>
                    <ul className="w-1/2">
                      {bestPosts.slice(0, 4)?.map((el, idx) => (
                        <RankPostList key={el.id} idx={idx} rank={el} />
                      ))}
                    </ul>
                    <ul className="w-1/2">
                      {bestPosts.slice(4).map((el, idx) => (
                        <RankPostList key={el.id} idx={idx + 4} rank={el} />
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-center text-gray-400 w-full mt-6">
                    베스트 게시글이 없습니다
                  </p>
                )}
              </section> */}
            </Screen>
          </section>
          {/* 여기서부터 인터렉션 스크린 */}
          <Screen
            id="scroll-section-1"
            style={{ color: "#1D1D1F", height: "80vh" }}
            ref={(el) => (refs.current[1] = el)}
          >
            <section
              className="sticky-elem"
              ref={(el) => (animationRefs.current[0] = el)}
            >
              <section className="flex flex-col items-start justify-center w-1/2">
                <p
                  className="md:text-5xl text-4xl font-extrabold"
                  ref={(el) => (animationRefs.current[1] = el)}
                >
                  간단하게
                </p>
              </section>
              <section
                className="flex flex-col items-start justify-center w-1/2 md:text-base text-xs font-normal"
                ref={(el) => (animationRefs.current[2] = el)}
              >
                <p>언제 어디서나, 컴퓨터 스마트폰에서</p>
                <p>클릭 한번으로 소환사를 모집하거나,</p>
                <p>원하는 소환사에게 요청을 보내세요</p>
                <p>듀오듀오는 철저히 계산된 데이터로</p>
                <p>상대방을 완벽히 분석하여 오로지</p>
                <p> 당신이 선택에 집중할 수 있게 만듭니다</p>
                <Link to="rooms">
                  <p className="font-medium cursor-pointer text-green-400">
                    시작하기
                  </p>
                </Link>
              </section>
            </section>
          </Screen>
          <Screen
            id="scroll-section-2"
            style={{ color: "#1D1D1F", height: "80vh" }}
            ref={(el) => (refs.current[2] = el)}
          >
            <section
              className="sticky-elem"
              ref={(el) => (animationRefs.current[3] = el)}
            >
              <section className="flex flex-col items-start justify-center w-1/2">
                <p
                  className="md:text-5xl text-4xl font-extrabold"
                  ref={(el) => (animationRefs.current[4] = el)}
                >
                  빠르게
                </p>
              </section>
              <section
                className="flex flex-col items-start justify-center w-1/2 md:text-base text-xs font-normal"
                ref={(el) => (animationRefs.current[5] = el)}
              >
                <p>요청 또는 요청을 받았을 때, 수락하면</p>
                <p>바로 실시간 채팅이 시작됩니다</p>
                <p>귀찮게 왔다갔다 할 필요 없이 채팅이</p>
                <p>시작되면 바로 친구추가 요청이 가고</p>
                <p>게임을 할 준비가 완료되는 것이죠</p>
                <Link to="rooms">
                  <p className="font-medium cursor-pointer text-green-400">
                    시작하기
                  </p>
                </Link>
              </section>
            </section>
          </Screen>
          <Screen
            id="scroll-section-3"
            style={{ color: "#1D1D1F", height: "80vh" }}
            ref={(el) => (refs.current[3] = el)}
          >
            <section
              className="sticky-elem"
              ref={(el) => (animationRefs.current[6] = el)}
            >
              <section className="flex flex-col items-start justify-center w-1/2">
                <p
                  className="md:text-5xl text-4xl font-extrabold"
                  ref={(el) => (animationRefs.current[7] = el)}
                >
                  강력하게
                </p>
              </section>
              <section
                className="flex flex-col items-start justify-center w-1/2 md:text-base text-xs font-normal"
                ref={(el) => (animationRefs.current[8] = el)}
              >
                <p>또한 웹사이트의 채팅창은 꺼지지 않고, </p>
                <p>큐가 잡혔을 때 그리고 벤픽창에서 </p>
                <p>팀원과 적군 전적 데이터를 </p>
                <p>시각적으로 제공합니다</p>
                <p>전적 사이트 여러개 켜놓을 필요 없이</p>
                <p>듀오듀오만으로 게임을 하면서</p>
                <p>최고의 퍼포먼스를 내게 도와줍니다</p>
                <Link to="rooms">
                  <p className="font-medium cursor-pointer text-green-400">
                    시작하기
                  </p>
                </Link>
              </section>
            </section>
          </Screen>
          <Screen
            id="scroll-section-4"
            style={{
              color: "#1D1D1F",
              height: "80vh",
              // marginBottom: "10vh"
            }}
            ref={(el) => (refs.current[4] = el)}
          >
            <section
              className="sticky-elem"
              ref={(el) => (animationRefs.current[9] = el)}
            >
              <section className="flex flex-col items-start justify-center w-1/2">
                <p
                  className="md:text-5xl text-4xl font-extrabold"
                  ref={(el) => (animationRefs.current[10] = el)}
                >
                  즐겁게
                </p>
              </section>
              <section
                className="flex flex-col items-start justify-center w-1/2 md:text-base text-xs font-normal text-left"
                ref={(el) => (animationRefs.current[11] = el)}
              >
                <p>듀오듀오의 제일 중요한 </p>
                <p>원칙은 즐겁게입니다.</p>
                <p>게임이 즐겁게 끝났다면,</p>
                <p>서로에게 칭찬을 할 수 있습니다</p>
                <p>칭찬을 받은 유저는 포로토큰을 보상으로 받게 됩니다</p>
                <p>반대로 악성유저와 함께해서 피해를</p>
                <p>봤다면 신고를 통해 제제할 수 있습니다</p>
                <Link to="rooms">
                  <p className="font-medium cursor-pointer text-green-400">
                    시작하기
                  </p>
                </Link>
              </section>
            </section>
          </Screen>
          {/* <Screen className="flex flex-col items-center justify-center">
          <p className="text-4xl font-medium">
            또는 매칭을 통해 더 많은 사람들과 함께할 수 있습니다
          </p>
          <GreenBtn className="w-96 h-20 mt-10 rounded-xl bg-green-400">
            <p className="text-white font-bold text-2xl">매칭하기</p>
          </GreenBtn>
        </Screen> */}
          <section
            className="flex flex-col w-full h-40"
            style={{ backgroundColor: "#28303D" }}
          >
            <div className="flex flex-row w-full h-full text-white justify-center items-center">
              <section className="flex flex-col text-left text-gray-200 text-sm">
                <section className="font-semibold mb-2">
                  <p>Contact to developer</p>
                  <p>📧 - namhj315@gmail.com</p>
                  <p>📱 - 010-5313-0460</p>
                </section>
                <section className="flex flex-row">
                  <a
                    className="cursor-pointer"
                    href="https://github.com/0xNSKY"
                    target="_blank"
                  >
                    <img
                      className="w-8 h-8 rounded-lg mr-2"
                      src="https://cdn3.iconfinder.com/data/icons/inficons/512/github.png"
                    />
                  </a>
                  <a
                    className="cursor-pointer"
                    href="https://www.instagram.com/00_nhj/?hl=ko"
                    target="_blank"
                  >
                    <img
                      className="w-8 h-8 mr-2"
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1024px-Instagram_icon.png"
                    ></img>
                  </a>
                </section>
              </section>
              <section className="">
                <img className="w-32 h-32" src="./icon_me.png"></img>
              </section>
            </div>
          </section>
        </Main>
      </section>
    </>
  );
}

const Screen = styled.div({
  height: "100vh",
});

const Main = styled.main`
  width: 1024px;
  color: #333d4b;
  @media screen and (max-width: 1023px) {
    width: 100%;
    padding-left: 0;
    padding-right: 0;
  }
`;

export default Root;
