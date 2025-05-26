import packageJson from "/package.json";

const ID_TOKEN_KEY = `${packageJson.name}_token`;
const CSRF_KEY = `${packageJson.name}_csrf`;

export const getToken = () => {
  return {
    csrf: window.localStorage.getItem(CSRF_KEY),
    token: window.localStorage.getItem(ID_TOKEN_KEY),
  };
};

export const saveToken = ({ token, csrf }) => {
  window.localStorage.setItem(ID_TOKEN_KEY, token);
  window.localStorage.setItem(CSRF_KEY, csrf);
};

export const destroyToken = () => {
  window.localStorage.removeItem(ID_TOKEN_KEY);
  window.localStorage.removeItem(CSRF_KEY);
};

export default { getToken, saveToken, destroyToken };
