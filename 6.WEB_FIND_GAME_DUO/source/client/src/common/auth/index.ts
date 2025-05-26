import axios from "axios";
import Cookies from "universal-cookie";
import packageJson from "../../../package.json";

const ID_TOKEN_KEY = `${packageJson.name}_token`;
const CSRF_KEY = `${packageJson.name}_csrf`;

export const getToken = () => {
  return {
    csrf: window.localStorage.getItem(CSRF_KEY),
    token: window.localStorage.getItem(ID_TOKEN_KEY),
  };
};

export const saveToken = ({ token, csrf }: any) => {
  window.localStorage.setItem(ID_TOKEN_KEY, token);
  window.localStorage.setItem(CSRF_KEY, csrf);
};

export const destroyToken = () => {
  window.localStorage.removeItem(ID_TOKEN_KEY);
  window.localStorage.removeItem(CSRF_KEY);
};

export const setCookie = (name: string, value: boolean, option: any = {}) => {
  const newCookie = new Cookies();
  newCookie.set(name, value, { ...option });
};

export const getCookie = (name: string) => {
  const newCookie = new Cookies();
  return newCookie.get(name);
};

export const decodeJwt: any = (jwt: string) => {
  return {};
};

export const expiredJwt: any = async () => {
  const { data } = await axios.get(
    `${process.env.REACT_APP_SERVER_URL}/expire`,
    {
      headers: { Authorization: getToken().token },
      withCredentials: true,
    }
  );
  destroyToken();
  saveToken({ token: data.token, csrf: null });
};

export default { getToken, saveToken, destroyToken, expiredJwt };
