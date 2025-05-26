import styled from "styled-components";

function PostBtn({ text, img }: any) {
  return (
    <>
      <section className="flex flex-row items-center" onClick={() => {}}>
        <section className="flex flex-row justify-center items-center p-1 w-8 h-8 mr-2">
          <img className="w-full h-full" src={`${img}`}></img>
        </section>
        <p>{text}</p>
      </section>
    </>
  );
}

export default PostBtn;
