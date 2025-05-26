import { PlainAPI, API, API_URL, version, createAsyncPromise } from './api.config';
import { getToken, saveToken, destroyToken } from '../auth'
export { version };

export const api_url = API_URL;
export const refresh = _ => PlainAPI.post("/token", {}, { 
    headers: { "X-CSRF-TOKEN": getToken().csrf, Authorization: `Bearer ${getToken().token}` } 
  }).then(res => {
  saveToken(res.data)
  return res.data
})

export const login = params => PlainAPI.post("/login", params).then(res => {
  saveToken(res.data)
  return res
})
export const signup = params => PlainAPI.post("/signup", params).then(res => {
  saveToken(res.data)
  return res
});
export const logout = _ => API.delete('/logout').then(res => {
  destroyToken()
})


export const getItems = params => API.get('/items', params)