import axios from "axios";
import { SetStateAction, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { delay, movePage, setTimeRemoveAlarm } from "../common/api/page";
import { destroyToken, expiredJwt, getToken } from "../common/auth";
import FilterBtn from "../components/FilterBtn";
import FilterBtnBox from "../components/FilterBtnBox";
import LineModal from "../components/LineModal";
import TopMenu from "../components/TopMenu";
import UserList from "../components/UserList";
import UserListSK from "../components/UserListSK";
import { Alarm, alarmModalState, filtersState, isLoadingState } from "../state";
import { userInfoState, userListCooldownState } from "../state-persist";
import Loading from "./Loading";
import styled from "styled-components";
import moment from "moment";

function Rooms({ socket, setIsMessage, isMode, setIsMode }: any) {
  const [isMic, setIsMic] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [ref, inView] = useInView();
  const [dummys, setDummy] = useState<Array<object>>([]);
  const [isModal, setIsModal] = useState<boolean>(false);
  const [isSK, setIsSK] = useState<boolean>(false);
  const [textSK, setTextSK] = useState<string>("");
  const userInfo = useRecoilValue(userInfoState);
  const [isLoading, setIsLoading] = useRecoilState(isLoadingState);
  const [userListCooldown, setUserListCooldown] = useRecoilState<string>(
    userListCooldownState
  );
  const [text, setText] = useState("");
  const signIn = getToken().token ? true : false;
  const [alarmModals, setAlarmModal] = useRecoilState<Alarm[]>(alarmModalState);
  // config: [G, mid]
  const filters = useRecoilValue<any[]>(filtersState);

  const fixUserListFilter = (data: any) => {
    for (let i = 0; i < data.length; i++) {
      let obj = data[i];
      const newMost = obj.most.split(" ");
      const newMostRate = obj.most_rate.split(" ");
      const newMostKda = obj.most_kda.split(" ");
      obj.most = newMost;
      obj.most_rate = newMostRate;
      obj.most_kda = newMostKda;
    }
    setDummy(data);
    setIsLoading(false);
  };

  const getUserListFilter = async (page = 0) => {
    setIsLoading(true);

    const position = filters[0];
    const tier = filters[1];
    let result = null;

    if (tier && position) {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/userlist/filter/?tier=${tier}&position=${position}&page=${page}`
      );
      console.log(data.result);
      result = data.result;
    } else if (!tier && position) {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/userlist/filter/?position=${position}&page=${page}`
      );
      console.log(data.result);

      result = data.result;
    } else if (!position && tier) {
      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/userlist/filter/?tier=${tier}&page=${page}`
      );
      console.log(data.result);

      result = data.result;
    } else {
      axios.get(`${process.env.REACT_APP_SERVER_URL}/userlist`).then((res) => {
        const { data } = res;
        if (data) {
          setDummy(data);
          setIsLoading(false);
        }
      });
      return;
    }

    fixUserListFilter(result);
  };

  const getLeague = async (encryptedSummonerId: string) => {
    const { data } = await axios.get(
      `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}?api_key=${process.env.REACT_APP_API_KEY_RIOT}`
    );
    // TODO: 배치일 때 생기는 문제 해결 필요
    return data[0].queueType === "RANKED_TFT_PAIRS" ? data[1] : data[0];
  };

  const getSummoner = async () => {
    const { data } = await axios.get(
      `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${userInfo.username}?api_key=${process.env.REACT_APP_API_KEY_RIOT}`
    );
    return data;
  };

  const addUserList = async (position: string) => {
    if (!userInfo.username) {
      setAlarmModal((old) => [
        { text: "마이페이지에서 소환사명을 등록하세요", type: 0 },
        ...old,
      ]);
      setTimeRemoveAlarm(setAlarmModal);
      return;
    }
    if (isMode === "none") {
      if (position === "none") {
        setAlarmModal((old) => [
          { text: "최소 1개의 포지션이 필요합니다", type: 0 },
          ...old,
        ]);
        setTimeRemoveAlarm(setAlarmModal);
        return;
      }
      setIsSK(true);
      setTextSK("일꾼 포로들을 소집하는 중입니다...");
      setIsModal(false);
      setTextSK("소환사님의 유저정보를 가져옵니다...");
      const summoner = await getSummoner();
      setTextSK("소환사님의 리그정보를 가져옵니다...");
      const league = await getLeague(summoner.id);

      // typescript는 string type으로 객체 값 접근을 허용하지 않는다. 때문에 허용하는 객체라고 타입을 지정하거나 string-literal 타입을 이용해서 접근한다.
      const rankToNumber: { [index: string]: number } = {
        I: 1,
        II: 2,
        III: 3,
        IV: 4,
        V: 5,
      };

      const result = {
        puuid: summoner.puuid,
        username: userInfo.username,
        nickname: userInfo.nickname,
        position: position,
        tier: league.tier[0] + rankToNumber[league.rank],
        total_wins: league.wins,
        total_losses: league.losses,
        total_rate: logicWinRate(league.wins, league.losses),
        profileIconId: summoner.profileIconId,
        summonerLevel: summoner.summonerLevel,
        text,
        mic: isMic,
      };

      setTextSK("일꾼 포로들이 리스트를 생성하고 있습니다...");
      const { data } = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/userlist`,
        result,
        {
          headers: {
            Authorization: `Bearer ${getToken().token}`,
          },
        }
      );
      if (data.most && data.most.length > 0) {
        socket.emit("start", {
          from: userInfo.nickname,
          room: userInfo.username,
        });

        setDummy((old) => {
          return [data, ...old];
        });
      } else {
        // jwt expired
        destroyToken();
        movePage("signin");
        return;
      }
      setTextSK("일꾼 포로들이 집으로 돌아갑니다...");
      setIsMessage(true);

      const dDate = new Date();
      // 쿨타임 설정
      dDate.setMinutes(dDate.getMinutes() + 5);
      const dDateStr = dDate.toString();
      setUserListCooldown(dDateStr);
      setIsSK(false);
      setAlarmModal((old) => [{ text: "리스트 생성 완료", type: 1 }, ...old]);
      setTimeRemoveAlarm(setAlarmModal);
      setIsMic(false);
    } else {
      setAlarmModal((old) => [
        { text: "이미 진행중인 큐가 있습니다", type: 0 },
        ...old,
      ]);
      setTimeRemoveAlarm(setAlarmModal);
    }
  };

  const logicWinRate = (win: number, defeat: number) => {
    const total = win + defeat;
    return (win / total) * 100;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getUserListFilter();
  }, [filters]);

  useEffect(() => {
    if (inView && page * 10 === dummys.length) {
      if (!filters[0] && !filters[1]) {
        axios
          .get(`${process.env.REACT_APP_SERVER_URL}/userlist/infinite`, {
            headers: { Page: page },
          })
          .then((res) => {
            const { data } = res;
            setDummy((old) => [...old, ...data]);
            setPage((old) => old + 1);
          });
      } else {
        // filters infinite

        const position = filters[0];
        const tier = filters[1];

        if (tier && position) {
          axios
            .get(
              `${process.env.REACT_APP_SERVER_URL}/userlist/filter/?tier=${tier}&position=${position}&page=${page}`
            )
            .then(({ data }) => {
              console.log(data);
              for (let i = 0; i < data.result.length; i++) {
                let obj = data.result[i];
                const newMost = obj.most.split(" ");
                const newMostRate = obj.most_rate.split(" ");
                const newMostKda = obj.most_kda.split(" ");
                obj.most = newMost;
                obj.most_rate = newMostRate;
                obj.most_kda = newMostKda;
              }
              setDummy((old) => [...old, ...data.result]);
            });
        } else if (!tier && position) {
          axios
            .get(
              `${process.env.REACT_APP_SERVER_URL}/userlist/filter/?position=${position}&page=${page}`
            )
            .then(({ data }) => {
              console.log(data);

              for (let i = 0; i < data.result.length; i++) {
                let obj = data.result[i];
                const newMost = obj.most.split(" ");
                const newMostRate = obj.most_rate.split(" ");
                const newMostKda = obj.most_kda.split(" ");
                obj.most = newMost;
                obj.most_rate = newMostRate;
                obj.most_kda = newMostKda;
              }
              setDummy((old) => [...old, ...data.result]);
            });
        } else if (!position && tier) {
          axios
            .get(
              `${process.env.REACT_APP_SERVER_URL}/userlist/filter/?tier=${tier}&page=${page}`
            )
            .then(({ data }) => {
              console.log(data);

              for (let i = 0; i < data.result.length; i++) {
                let obj = data.result[i];
                const newMost = obj.most.split(" ");
                const newMostRate = obj.most_rate.split(" ");
                const newMostKda = obj.most_kda.split(" ");
                obj.most = newMost;
                obj.most_rate = newMostRate;
                obj.most_kda = newMostKda;
              }
              setDummy((old) => [...old, ...data.result]);
            });
        }
        setPage((old) => old + 1);
      }
    }
  }, [inView]);

  return (
    <>
      {isModal && (
        <LineModal
          setIsModal={setIsModal}
          addUserList={addUserList}
          setText={setText}
          isMic={isMic}
          setIsMic={setIsMic}
        />
      )}
      <section className="flex flex-col items-center">
        <TopMenu />
        <Con>
          <section className="flex flex-row justify-center mb-2">
            <div className="w-full h-24 flex flex-col justify-end">
              <FilterBtnBox />
            </div>
          </section>
          <header className="flex flex-row justify-center items-center">
            <section
              className="relative flex flex-row border h-20 justify-start rounded-lg mb-2 overflow-hidden w-full cursor-pointer hover:bg-white shadow-md bg-gray-50"
              onClick={() => {
                if (!signIn) {
                  movePage("signin");
                  return;
                }
                const nowMoment = moment(new Date());
                const coolMoment = moment(userListCooldown);
                if (coolMoment > nowMoment) {
                  setAlarmModal((old) => {
                    const result = [
                      { text: "5분 후 다시 시도하세요", type: 0 },
                      ...old,
                    ];
                    return result;
                  });
                  setTimeRemoveAlarm(setAlarmModal);
                } else {
                  setIsModal(true);
                }
              }}
            >
              <section className="flex flex-row items-center">
                {/* <div className="border-2 border-green-300 w-16 h-16 rounded-full m-2"></div> */}
                {/* <div className="m-2 w-40 text-left"> */}
                {/* <p>{""}</p> */}
                {/* <p className="opacity-50">{""}</p> */}
                {/* </div> */}
                {/* <div className="border w-14 h-14 ml-2"></div> */}
                {/* <p className="w-4 m-3 font-black">{"S2"}</p> */}
                {/* <div className="w-40 bg-gray-200 h-6 m-2"></div> */}
                {/* <div className="m-2 border w-40 h-16"></div> */}
                {/* <div className="w-4 m-3">{""}</div> */}
                {/* <div className="w-4 m-3">{""}</div> */}
                {/* <div className="w-4 m-3">{""}</div> */}
                {/* <div className="w-4 m-3"></div> */}
                {/* <button className="absolute bg-green-400 ml-10 w-10 h-full flex flex-row items-center justify-center index-y-0 right-0"> */}
                {/* <img className="w-6 h-6" src="icon_arrow.png"></img> */}
                {/* </button> */}
              </section>
            </section>
            <p className="absolute font-bold mb-3 text-xl cursor-pointer">+</p>
          </header>
          {isSK && <UserListSK textSK={textSK}></UserListSK>}
          <main className="flex items-center justify-center">
            <ul className="w-full">
              {isLoading && (
                <>
                  <UserListSK />
                  <UserListSK />
                  <UserListSK />
                  <UserListSK />
                  <UserListSK />
                  <UserListSK />
                  <UserListSK />
                  <UserListSK />
                  <UserListSK />
                  <UserListSK />
                </>
              )}
              {!isLoading &&
                dummys.map((room: any, idx) => {
                  if (
                    idx === dummys.length - 1 &&
                    idx > 8 &&
                    dummys.length % 10 === 0
                  ) {
                    return (
                      <UserList
                        key={room.id}
                        room={room}
                        last={ref}
                        socket={socket}
                        setDummy={setDummy}
                        setIsMessage={setIsMessage}
                        setIsMode={setIsMode}
                      />
                    );
                  } else {
                    return (
                      <UserList
                        key={room.id}
                        room={room}
                        setDummy={setDummy}
                        socket={socket}
                        setIsMessage={setIsMessage}
                        setIsMode={setIsMode}
                      />
                    );
                  }
                })}
            </ul>
          </main>
          {inView && <img></img>}
        </Con>
      </section>
    </>
  );
}

const Con = styled.section`
  width: 1024px;
  color: #333d4b;
  @media screen and (max-width: 1023px) {
    width: 100%;
    padding-left: 0;
    padding-right: 0;
    margin-left: 2%;
    margin-right: 2%;
  }
`;

export default Rooms;
