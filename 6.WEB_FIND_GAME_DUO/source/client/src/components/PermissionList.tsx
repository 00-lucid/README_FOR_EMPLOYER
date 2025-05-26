import axios from "axios";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { getToken } from "../common/auth";
import { userInfoState } from "../state-persist";

function PermissionList({
  username,
  socket,
  socketId,
  setPermissions,
  idx,
  setIsMode,
}: any) {
  // 수락할 경우
  // rooms에 해당하는 userlist 삭제
  // 채팅연결
  // permissionlist 모두 삭제
  // 다른 요청자들 거절

  const userInfo = useRecoilValue(userInfoState);

  const accept = async () => {
    const { data } = await axios.delete(
      `${process.env.REACT_APP_SERVER_URL}/userlist/username/${userInfo.username}`,
      {
        headers: {
          Authorization: `Bearer ${getToken().token}`,
        },
      }
    );
    if (data.state === "success") {
      socket.emit("req accept permisson", {
        username: userInfo.username,
        socketId,
      });
      setPermissions([]);
      // setDummy((old: any) => {
      //   return old.filter((el: any) => el.id !== room.id);
      // });
    }
  };

  // 거절할 경우
  // permissionlist 삭제
  // 요청자 수락 대기 취소

  const reject = () => {
    setPermissions((old: any) => {
      return old.slice(0, idx).concat(old.slice(idx + 1));
    });
    socket.emit("req reject permission", { username, socketId });
  };

  return (
    <>
      <div
        className="bg-white w-full h-8 mb-2 flex shadow-md flex-row items-center pl-2 justify-between rounded-sm"
        style={{ color: "#333d4b" }}
      >
        <section>
          <p className="font-bold text-sm">{username}</p>
        </section>
        <section className="text-sm text-white h-full">
          <button
            className="bg-red-400 font-bold h-full p-2 rounded-l-sm"
            onClick={reject}
          >
            거절
          </button>
          <button
            className="bg-green-400 font-bold h-full p-2 rounded-r-sm"
            onClick={accept}
          >
            수락
          </button>
        </section>
      </div>
    </>
  );
}

export default PermissionList;
