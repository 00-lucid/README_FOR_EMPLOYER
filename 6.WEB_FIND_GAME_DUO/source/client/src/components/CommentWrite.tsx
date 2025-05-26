import styled from "styled-components";

function CommentWrite({ setText, postAddComment }: any) {
  return (
    <>
      <section className="flex flex-col mb-4">
        <section className="w-full h-auto border border-green-400 rounded-lg overflow-hidden flex flex-col mb-2">
          <textarea
            className="w-full p-2 text-sm"
            onChange={(e) => setText(e.target.value)}
          />
        </section>
        <section className="flex flex-row">
          <button
            className="w-auto h-auto pt-1 pb-1 pl-2 pr-2 bg-green-400 text-white rounded text-sm"
            onClick={postAddComment}
          >
            완료
          </button>
        </section>
      </section>
    </>
  );
}

export default CommentWrite;
