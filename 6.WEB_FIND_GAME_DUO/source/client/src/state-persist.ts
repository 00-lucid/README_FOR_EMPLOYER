import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

const userInfoState = atom({
  key: "userInfo",
  default: {},
  effects_UNSTABLE: [persistAtom],
});

const userListCooldownState = atom({
  key: "userListCooldown",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

const isModeState = atom({
  key: "isMode",
  default: "none",
  effects_UNSTABLE: [persistAtom],
});

const chatsState = atom({
  key: "chats",
  default: [],
  effects_UNSTABLE: [persistAtom],
});

const permissionListState = atom<any[]>({
  key: "permissionList",
  default: [],
  effects_UNSTABLE: [persistAtom],
});

const isReceiveMessageState = atom<boolean>({
  key: "isReceiveMessage",
  default: false,
  effects_UNSTABLE: [persistAtom],
});

export {
  userInfoState,
  userListCooldownState,
  isModeState,
  chatsState,
  permissionListState,
  isReceiveMessageState,
};
