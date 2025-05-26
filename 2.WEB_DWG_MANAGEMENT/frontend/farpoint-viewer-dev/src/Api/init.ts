import axios from 'axios'
// initialize api object
axios.defaults.withCredentials = true // withCredentials 전역 설정

const { REACT_APP_ENV, REACT_APP_URL_LOCAL, REACT_APP_URL_DEV, REACT_APP_URL_PRD } = process.env
const baseURL = REACT_APP_ENV === 'dev' ? REACT_APP_URL_DEV : REACT_APP_ENV === 'local' ? REACT_APP_URL_LOCAL : REACT_APP_URL_PRD

const api = axios.create({
    baseURL,
    timeout: 60 * 1000,
    headers: {
        'Content-Type': 'application/json',
    },
})

const pmdcURL = 'https://10.130.1.181/piwebapi';
const username = 'kospoadmin';
const password = 'Kospopiadmin!';
const auth = btoa(`${username}:${password}`);
// const auth = Buffer.from(`${username}:${password}`).toString('base64');

export const pmdcApi = axios.create({
    baseURL: pmdcURL,
    timeout: 60 * 1000,
    headers: {
        "Content-Type": "application/json",
        'Authorization': `Basic ${auth}`,
    },
});

export default api
