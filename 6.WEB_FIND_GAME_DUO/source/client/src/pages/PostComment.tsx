import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import TopMenu from "../components/TopMenu";

function PostComment() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setWidth(window.innerWidth);
    });
  }, []);

  return (
    <>
      <TopMenu />
      <Main className="flex flex-row">
        {width > 767 && <section className="border w-1/3">콘솔</section>}
        <section className="flex flex-col flex-1 bg-gray-100">
          <div className="bg-white w-full h-12 mb-2 shadow-md sticky top-0 flex flex-row justify-between">
            <section className="flex flex-row items-center h-full p-4 justify-between w-24 text-base font-extrabold text-gray-400">
              {"<-"}
            </section>
            <section
              className="flex flex-row items-center h-full p-4 text-base font-extrabold"
              style={{
                color: "#333d4b",
              }}
            ></section>
          </div>
        </section>
      </Main>
    </>
  );
}

const Main = styled.main`
  padding-left: 16.666%;
  padding-right: 16.666%;
  color: #333d4b;
  @media screen and (max-width: 767px) {
    padding-left: 0;
    padding-right: 0;
  }
`;

export default PostComment;
