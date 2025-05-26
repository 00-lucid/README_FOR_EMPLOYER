import styled from "styled-components";
import UserStats from "./UserStats";

function UserStatsBox({ title, stats, idxName }: any) {
  const name = [
    ["딜링", "킬캐치", "군중제어", "라인전", "생존력", "회복력"],
    ["오브젝트", "철거", "시야장악", "도움", "블루", "퍼플"],
    ["골드수급", "경험치수급", "정글링", "카정", "CS수급", "멘탈"],
  ];
  return (
    <>
      <div className="flex flex-col w-1/3 h-full justify-around bg-gray-200 mr-2 p-2">
        <p className="font-bold text-md">{title}</p>
        {stats.map((n: number, idx: number) => (
          <UserStats name={name[idxName][idx]} value={n} />
        ))}
      </div>
    </>
  );
}

export default UserStatsBox;
