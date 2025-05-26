import axios from "axios";
import { f7, theme } from "framework7-react";

export default {
  // 모듈 함수의 특징: help... 형식의 함수명
  postBell(token, text, handleBellBadges, handleBells, handleIsAction) {
    if (token) {
      axios
        .post(
          "https://localhost:3000/add-bell",
          {
            text: text,
          },
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          handleBellBadges((old) => [...old, { id: old.length + 1 }]);
          handleBells((old) => [
            ...old,
            { text: res.data.text, createdAt: res.data.createdAt },
          ]);
          handleIsAction((old) => !old);
        });
    }
  },

  helpAddAlarm(text, handleAlarms) {
    handleAlarms((old) => [...old, { text: text }]);

    setTimeout(() => handleAlarms((old) => [...old].slice(1)), 2000);
  },

  // 2021-04-19T06:14:57.000Z를 한국 표준시로 바꿔주는 함수
  helpConvertTime(time) {
    return new Date(time).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  },

  showToastCenter(text) {
    // Create toast
    let toastCenter;

    if (!toastCenter) {
      toastCenter = f7.toast.create({
        text: text,
        position: "center",
        closeTimeout: 2000,
      });
    }
    // Open it
    toastCenter.open();
  },

  showToastIcon(text, isFill) {
    // Create toast

    let toastIcon;

    if (!toastIcon) {
      toastIcon = f7.toast.create({
        icon: isFill
          ? '<i class="f7-icons">heart_fill</i>'
          : '<i class="f7-icons">heart</i>',
        text: text,
        position: "center",
        closeTimeout: 1000,
      });
    }
    // Open it
    toastIcon.open();
  },

  saveLineItem(data) {
    localStorage.setItem("lineItem", JSON.stringify(data));
  },

  getLineItem() {
    return JSON.parse(localStorage.getItem("lineItem"));
  },

  destroyLineItem() {
    localStorage.removeItem("lineItem");
  },
};
