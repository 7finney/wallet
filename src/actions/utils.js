import axios from 'axios';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-community/async-storage';
import qs from 'querystring';

axios.interceptors.request.use((request) => {
  console.log('Starting Request', request);
  return request;
});

/**
 * getToken() -> Fetches a fresh auth token and return it
 * @return {string}
 */
export function getToken() {
  const appId = uuid.v1();
  const url = `http://192.168.0.104:4550/api/v0/genToken/${appId}`;
  return axios
    .get(url)
    .then((response) => {
      const token = response.data.token;
      return token;
    })
    .catch(() => {
      return null;
    });
}

/**
 *
 * @param authToken{string}
 * @returns {Promise<boolean>}
 */
export async function verifyToken(authToken) {
  const url = `https://auth.ethco.de/verifyToken/${authToken}`;
  try {
    const res = await axios.get(url);
    return res.status === 200;
  } catch (e) {
    return false;
  }
}

/**
 *
 * @param key
 * @returns {Promise<string>}
 */
export async function getFromAsyncStorage(key) {
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    return false;
  }
}

/**
 *
 * @param key
 * @param value
 * @returns {Promise<boolean>}
 */
export async function setToAsyncStorage(key, value) {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * @param txHash
 * @param authToken
 * @returns {Promise<boolean|*>}
 */
export async function getUnsignedTx(txHash, authToken) {
  try {
    const url = `http://192.168.0.104:4550/api/v0/getUnsignedTx/${txHash}`;
    const response = await axios.get(url, {
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    return JSON.parse(response.data);
  } catch (e) {
    return false;
  }
}

export async function deployTransaction(rawTx, networkId, token) {
  const url = 'http://192.168.0.104:4550/api/v0/sendTx';
  const req = {
    netId: networkId,
    rawTx,
  };
  try {
    const res = await axios.post(url, qs.stringify(req), {
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      json: true,
    });
    console.log(res.data);
    return res.data.Error;
  } catch (e) {
    return e.response;
  }
}
