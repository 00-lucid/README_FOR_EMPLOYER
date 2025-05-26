import styled from "styled-components";
import UserStat from "./UserStats";
import UserStatsBox from "./UserStatsBox";

function UserDetail() {
  const exam = [
    [17, 12, 9, 20, 19, 14],
    [13, 13, 16, 18, 19, 11],
    [7, 9, 1, 2, 10, 20],
  ];

  return (
    <>
      <div
        className="flex flex-row w-full h-96 bg-gray-50 rounded-lg border mb-2 shadow-md overflow-hidden"
        style={{ color: "#333d4b" }}
      >
        <div className="w-1/4 h-full border"></div>
        <div className="flex flex-row w-3/4 h-full border p-2">
          {exam.map((stats, idx) => (
            <UserStatsBox
              title={["전투", "전술", "성장"][idx]}
              stats={stats}
              idxName={idx}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default UserDetail;
