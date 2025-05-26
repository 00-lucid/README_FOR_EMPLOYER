import styled from "styled-components";

function UserListSK({ textSK }: any) {
  return (
    <div className="flex justify-center">
      <div
        className="relative flex flex-row w-full border h-20 justify-start rounded-lg mb-2 overflow-hidden shadow-md bg-gray-50"
        style={{ color: "#333d4b" }}
      >
        <section className="flex flex-row items-center ">
          <div className="border-green-300 w-14 h-14 rounded-full m-2 overflow-hidden">
            <div className="bg-gray-200 w-full h-full"></div>
          </div>
          <div className="m-2 w-40 text-left">
            <p className="font-bold"></p>
            <p className="opacity-40"></p>
          </div>
          <div className="w-14 h-14 ml-2">
            <div className="bg-gray-200 w-full h-full"></div>
          </div>
          <p className="w-4 m-3 font-bold"></p>
          <div className="w-40 bg-gray-200 h-6 m-2">
            <div>
              <p className="text-xs font-light"></p>
            </div>
          </div>
          <div
            className="flex flex-row m-2 border h-14"
            style={{ width: "168px" }}
          >
            <div className="bg-gray-200 w-full h-full"></div>
          </div>
          <div className="w-4 m-3"></div>
          <button className="absolute bg-gray-200 ml-10 w-10 h-full flex flex-row items-center justify-center inset-y-0 right-0"></button>
          <p className="absolute text-gray-400 inset-0 top-1/3">{textSK}</p>
        </section>
      </div>
    </div>
  );
}

export default UserListSK;
