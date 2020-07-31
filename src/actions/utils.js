import axios from 'axios';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-community/async-storage';
import qs from 'querystring';

// TODO: Uncomment when debugging, comment in production
// axios.interceptors.request.use((request) => {
//   console.log('Starting Request', request);
//   return request;
// });
// axios.interceptors.response.use((response) => {
//   console.log('Got response', response);
//   return response;
// });

/**
 * getToken() -> Fetches a fresh auth token and return it
 * @return {string}
 */
export function getToken() {
  const appId = uuid.v1();
  const url = `https://wallet.ethco.de/api/v0/genToken/${appId}`;
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
 * verifies token passed to it
 * @param authToken{string}
 * @returns {Promise<boolean>}
 */
export async function verifyToken(authToken) {
  const url = `https://auth.ethco.de/verifyToken/${authToken}`;
  try {
    const res = await axios.get(url);
    return res.status === 200;
  } catch (e) {
    console.log('E: ', e);
    return false;
  }
}

/**
 * get value of the key from async storage
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
 * sets the key and value to async storage
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
 * removes key with value from async storage
 * @param key
 * @returns {Promise<boolean>}
 */
export async function removeFromAsyncStorage(key) {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * return unsignedTx from the server
 * @param txHash
 * @param authToken
 * @returns {Promise<boolean|*>}
 */
export async function getUnsignedTx(txHash, authToken) {
  try {
    // const url = `https://wallet.ethco.de/api/v0/getUnsignedTx/${txHash}`;
    const url = `http://192.168.0.7:4550/api/v0/getUnsignedTx/${txHash}`;
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

/**
 * sends the signed transaction to server and return tx Receipt
 * @param rawTx
 * @param networkId
 * @param token
 * @returns {Promise<AxiosResponse<any>|any>}
 */
export async function deployTransaction(rawTx, networkId, token) {
  // const url = 'https://wallet.ethco.de/api/v0/sendTx';
  const url = 'http://192.168.0.7:4550/api/v0/sendTx';
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
    return res;
  } catch (e) {
    return e.response;
  }
}
