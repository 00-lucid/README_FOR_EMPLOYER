import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import moveHome from "../common/api/page";
import { destroyToken, getToken } from "../common/auth";
import { userInfoState } from "../state-persist";

function TopMenu() {
  const userInfo = useRecoilValue(userInfoState);
  let loggedIn = !!getToken().token;

  return (
    <Top>
      <Link to="/">
        <p className="text-4xl font-black cursor-pointer">DUODUO</p>
      </Link>
      {/* <p className="cursor-pointer">듀오 찾기</p> */}
      {/* <p className="cursor-pointer">듀오 매칭</p> */}
      {/* <p>알람</p> */}
      <Link to="/community/all?page=0">
        <p className="text-base font-extrabold">커뮤니티</p>
      </Link>
      <Link to="/rooms">
        <p className="text-base font-extrabold">찾기</p>
      </Link>
      {!loggedIn && (
        <Link to="/signin" className="text-lg flex items-center text-green-400">
          <p className="text-base font-extrabold">로그인</p>
        </Link>
      )}
      {/* <Link to="rooms">
        <p className="text-lg font-medium">커뮤니티</p>
      </Link> */}

      {loggedIn && (
        <>
          <Link to="/mypage">
            <section className="md:w-10 md:h-10 w-10 h-10 rounded-full overflow-hidden">
              {window.location.href.includes("community") ? (
                <img className="w-full h-full" src="../profile.png" />
              ) : (
                <img className="w-full h-full" src="./profile.png" />
              )}
            </section>
          </Link>
        </>
      )}
    </Top>
  );
}

const Top = styled.header`
  width: 1024px;
  position: sticky;
  background-color: white;
  top: 0;
  height: 4rem;
  color: #333d4b;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 0.1rem solid #333d4b;
  justify-content: space-between;
  z-index: 30;

  @media screen and (max-width: 1023px) {
    width: 100%;
    padding-left: 2%;
    padding-right: 2%;
  }
`;

export default TopMenu;
