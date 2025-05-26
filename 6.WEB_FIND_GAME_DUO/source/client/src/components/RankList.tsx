import styled from "styled-components";

function RankList({ idx, rank }: any) {
  return (
    <>
      {idx % 2 === 0 ? (
        <li className="flex flex-row bg-gray-50 w-full h-20 items-center text-xs md:text-base">
          <section className="flex-1">{idx + 1}</section>
          <section className="flex-1 h-auto flex justify-center ">
            <img
              src={`http://ddragon.leagueoflegends.com/cdn/11.21.1/img/profileicon/${rank.profileIconId1}.png`}
              className="rounded-full"
              width="48px"
              height="48px"
            ></img>
          </section>
          <section className="w-1/3 justify-center items-center">
            <p>{rank.username1}</p>
          </section>
          <section className="flex-1 h-auto flex justify-center">
            <img
              src={`http://ddragon.leagueoflegends.com/cdn/11.21.1/img/profileicon/${rank.profileIconId2}.png`}
              className="rounded-full"
              width="48px"
              height="48px"
            ></img>
          </section>
          <section className="w-1/3 justify-center items-center">
            <p>{rank.username2}</p>
          </section>
        </li>
      ) : (
        <li className="flex flex-row bg-white w-full h-20 items-center text-xs md:text-base">
          <section className="flex-1">{idx + 1}</section>
          <section className="flex-1 h-auto flex justify-center ">
            <img
              src={`http://ddragon.leagueoflegends.com/cdn/11.21.1/img/profileicon/${rank.profileIconId1}.png`}
              width="48px"
              height="48px"
              className="rounded-full"
            ></img>
          </section>
          <section className="w-1/3 justify-center items-center">
            <p>{rank.username1}</p>
          </section>
          <section className="flex-1 h-auto flex justify-center">
            <img
              src={`http://ddragon.leagueoflegends.com/cdn/11.21.1/img/profileicon/${rank.profileIconId2}.png`}
              className="rounded-full"
              width="48px"
              height="48px"
            ></img>
          </section>
          <section className="w-1/3 justify-center items-center">
            <p>{rank.username2}</p>
          </section>
        </li>
      )}
    </>
  );
}

export default RankList;
