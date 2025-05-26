import { atom } from "recoil";

// non-persist
// 로딩이 필요할 때 해당 상태를 true
// 로딩이 끝나면 해당 상태를 false

interface Alarm {
  text: string;
  type: number;
}

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  // evnet
  receiveMessage: ({ from, message }: any) => void;
}

interface ClientToServerEvents {
  // event
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

const isLoadingState = atom({
  key: "isLoading",
  default: false,
});

const alarmModalState = atom<Alarm[]>({
  key: "alarmModal",
  default: [],
});

const filtersState = atom<any[]>({
  key: "filters",
  default: ["", ""],
});

export { isLoadingState, alarmModalState, filtersState };
export type {
  Alarm,
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
};
