import axios from "axios";
import { userInfo } from "os";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import moveHome, { movePage } from "../common/api/page";
import { decodeJwt, destroyToken, expiredJwt, getToken } from "../common/auth";
import MyPageInfoBlock from "../components/MyPageInfoBlock";
import MyPageInfoBlockSK from "../components/MypageInfoBlockSK";
import TopMenu from "../components/TopMenu";
import { Alarm, alarmModalState, isLoadingState } from "../state";
import { userInfoState } from "../state-persist";

function MyPage() {
  const token = getToken().token;
  const [isLoading, setIsLoading] = useRecoilState(isLoadingState);
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const userInfo = useRecoilValue(userInfoState);
  const getMypage = async () => {
    const { data } = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/mypage`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!data) {
      destroyToken();
      movePage("signin");
      return;
    }
    return data;
  };

  const signout = () => {
    destroyToken();
    moveHome();
  };

  useEffect(() => {
    // TODO: config
    window.scrollTo(0, 0);
    setIsLoading(true);
    getMypage().then((data) => {
      if (data) {
        setEmail(data.email);
        setUserName(data.username);
        setIsLoading(false);
      }
    });
  }, []);
  return (
    <>
      <section className="flex flex-col items-center">
        <TopMenu />
        <main className="flex flex-row justify-center items-center pt-12 w-full">
          <Page>
            {/* 좌측 */}
            <div className="relative lg:w-1/3 flex flex-col items-center pt-10 h-auto ">
              <img
                className="rounded-full w-24 h-24 border"
                src="./profile.png"
              ></img>
              <section className="mt-4 flex flex-row">
                <p className="font-bold text-lg ">{userInfo.nickname}</p>
                <p className="font-normal opacity-40 text-lg">님</p>
              </section>
              <section className="mb-4">
                <div className="font-normal flex flex-row">
                  <p className="text-gray-400 text-sm">300 🚀</p>
                </div>
              </section>
              <div
                className="bg-red-400 text-xl h-9 w-full flex items-center cursor-pointer text-white md:absolute md:bottom-0"
                onClick={signout}
              >
                <p className="mx-4 font-bold">SIGNOUT</p>
              </div>
            </div>
            {/* 우측 */}
            <div className="w-full md:p-10 p-4 flex flex-col justify-between">
              {isLoading && (
                <>
                  <MyPageInfoBlockSK />
                  <MyPageInfoBlockSK />
                </>
              )}
              {!isLoading && (
                <>
                  <MyPageInfoBlock
                    title={"이메일"}
                    value={email}
                    setValues={setEmail}
                    token={token}
                  />
                  <MyPageInfoBlock
                    title={"소환사명"}
                    value={username}
                    setValues={setUserName}
                    token={token}
                  />
                </>
              )}

              <MyPageInfoBlock title={"훈장"} value={"🎉"} token={token} />
            </div>
          </Page>
        </main>
      </section>
    </>
  );
}

const Page = styled.div`
  width: 1024px;
  color: #333d4b;
  display: flex;
  flex-direction: row;
  @media screen and (max-width: 1023px) {
    width: 100%;
    flex-direction: column;
  }
`;
export default MyPage;
