import axios from "axios";
import Qs from "qs";
import { configs } from '@/common/config';
import { refresh as refreshRequest } from './index';
import { getToken, saveToken, destroyToken } from '../auth'


const version = configs.version;
const env = configs.env;
const API_URL = configs.api_url;
// for multiple requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	})
	failedQueue = [];
}

const refreshInterceptor = (axiosInstance) => (error) => {
	const _axios = axiosInstance;
	const originalRequest = error.config;
	if (error.response?.status === 401 && !originalRequest._retry) {

		if (isRefreshing) {
			return new Promise(function (resolve, reject) {
				failedQueue.push({resolve, reject})
			}).then(token => {
				originalRequest.headers['Authorization'] = 'Bearer ' + token;
				return _axios.request(originalRequest);
			}).catch(err => {
				return Promise.reject(err);
			})
		}

		originalRequest._retry = true;
		isRefreshing = true;

		return new Promise((resolve, reject) => {
			refreshRequest().then((data) => {
          saveToken(data)
					_axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
					originalRequest.headers['Authorization'] = 'Bearer ' + data.token;
					processQueue(null, data.token);
					resolve(_axios(originalRequest));
				})
				.catch((err) => {
					processQueue(err, null);
          destroyToken()
					location.reload()
					reject(err);
				})
				.then(() => {
					isRefreshing = false
				})
		})
	}

	return Promise.reject(error);
};

const headerTokenConfig = config => {
  const method = config.method.toUpperCase();
  if (method !== "OPTIONS") {
    let {csrf, token} = getToken();
    config.headers = {
      ...config.headers,
      "X-CSRF-TOKEN": csrf,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
}


axios.defaults.paramsSerializer = function(params) {
  return Qs.stringify(params, { 
    arrayFormat: "brackets" //!!params.q ? "brackets" : "indices" 
  });
};



const headerConfig = {
  baseURL: configs.api_url,
  headers: {
    "Content-Type": "application/json",
    "Accept-Version": `v${version}`
  }
}

const PlainAPI = axios.create(headerConfig);
const API = axios.create(headerConfig);
API.interceptors.request.use(headerTokenConfig);
API.interceptors.response.use(null, refreshInterceptor(API));

export { PlainAPI, API, API_URL, version };

export const createAsyncPromise = (method, path) => {
  return async (props) => {
    try {
			// if (signal) console.log(signal)
      const res = await API[method.toLowerCase()](path, { params: props });
			return res.data;
    } catch(e) {
      console.error(e)
    };
  }
}