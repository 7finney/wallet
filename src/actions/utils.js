import axios from 'axios';
import {ToastAndroid} from 'react-native';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-community/async-storage';

/**
 * getToken() -> Fetches a fresh auth token and return it
 * @return {string}
 */
export function getToken() {
  const appId = uuid.v1();
  const url = `http://192.168.0.104:4550/api/v0/genToken/${appId}`;
  axios
    .get(url)
    .then((response) => {
      const token = response.data.token;
      ToastAndroid.showWithGravity('AuthToken Generated', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
      return token;
    })
    .catch((err) => {
      ToastAndroid.showWithGravity(
        'AuthToken Generation Error. Please try agina',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
      return err;
    });
}

/**
 *
 * @param authToken{string}
 * @returns {Promise<boolean>}
 */
export async function verifyToken(authToken) {
  const url = `https://auth.ethco.de/verifyToken/${authToken}`;
  const res = await axios.get(url);
  return res.status === 200;
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
