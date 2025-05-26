import { useEffect, useState } from "react";
import styled from "styled-components";

function MessageModalNone({ setIsMessage, socket, setIsMode, setChats }: any) {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setWidth(window.innerWidth);
    });
    socket.on("receiveMessage", ({ from, message }: any) => {
      setChats((old: any) => [...old, { text: `${from}: ${message}` }]);
    });

    socket.on("notice", ({ message }: any) => {
      setChats((old: any) => [...old, { text: message }]);
    });

    socket.on("loading", () => {
      setIsMode("loading");
    });

    socket.on("end", () => {
      setIsMode("end");
    });
  }, []);
  return (
    <>
      {width > 767 ? (
        <div className="fixed bg-white w-1/4 right-0 bottom-0 border z-40 flex flex-col rounded-t-lg overflow-hidden mr-4 shadow-2xl">
          {/* 노티시에는 노란색 */}
          <button
            className="bg-green-400 h-10"
            onClick={() => setIsMessage(true)}
          ></button>
        </div>
      ) : (
        <button
          className="fixed bg-green-400 w-16 h-16 right-4 bottom-4 border z-40 flex flex-col rounded-full overflow-hidden shadow-2xl justify-center items-center text-white"
          onClick={() => setIsMessage(true)}
        >
          채팅
        </button>
      )}
    </>
  );
}

export default MessageModalNone;
