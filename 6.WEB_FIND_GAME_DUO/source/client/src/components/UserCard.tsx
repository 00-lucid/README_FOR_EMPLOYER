import styled from "styled-components";

function UserCard() {
  return (
    <Body className="flex flex-col m-4 justify-center items-center p-3">
      <img
        // 테두리 색은 티어에 따라 달라진다
        className="w-40 h-40 rounded-full border-8 border-blue-100"
        src="https://jejuhydrofarms.com/wp-content/uploads/2020/05/blank-profile-picture-973460_1280.png"
      ></img>
      <div className="w-full h-20 bg-gray-300 text-white rounded-md p-3 mt-3">
        안녕하세요 여기는 매칭하는 게이머의 한줄 작성란입니다다다다다
      </div>
      <button className="bg-green-400 w-full h-8 rounded mt-1 text-white">
        같이하기
      </button>
      <button className="bg-gray-300 w-full h-8 rounded mt-1 text-white">
        더보기
      </button>
    </Body>
  );
}

export default UserCard;

const Body = styled.li({
  minWidth: "280px",
  height: "350px",
  backgroundColor: "white",
  borderRadius: "0.75rem",
});
