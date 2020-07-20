import {
  DEPLOY_SIGNED_TX,
  RAW_TX,
  SET_ACCOUNTS,
  SET_AUTH_TOKEN,
  SET_CURRENT_ACCOUNT,
  SET_ERROR_STATUS,
  SET_LOADER_STATUS,
  SET_TESTNET_ID,
  UNSIGNED_TX,
  UNSIGNED_TX_HASH,
} from './types';
import {
  deployTransaction,
  getFromAsyncStorage,
  getToken,
  setToAsyncStorage,
  verifyToken,
} from './utils';
import {listAccounts} from '../services/sign';

/**
 *  setUnsignedTx Func -> Sets the Unsigned TX
 *  @param {data: any} -- unsigned Data from server
 * */
export const setUnsignedTx = (data) => {
  return {type: UNSIGNED_TX, payload: data};
};

/**
 *  setUnsignedTxHash Func -> Sets the Unsigned TX hash from the QRScanner
 *  @param {data: any} -- unsigned Data from QRScanner
 * */
export const setUnsignedTxHash = (data) => {
  return {type: UNSIGNED_TX_HASH, payload: data};
};

/**
 *  setRawTx Func -> Sets the rawTX after signing
 *  @param {data: string} -- rawTx after signing
 * */
export const setRawTx = (data) => {
  return {type: RAW_TX, payload: data};
};

/**
 *  getAuthToken -> Sets the auth token at the beginning
 */
// eslint-disable-next-line consistent-return
export const getAuthToken = async () => {
  let token = await getFromAsyncStorage('authToken');
  if (token) {
    if (await verifyToken(token)) {
      return {type: SET_AUTH_TOKEN, payload: token};
    }
    token = await getToken();
    setToAsyncStorage('authToken', token)
      .then(() => {
        return {type: SET_AUTH_TOKEN, payload: token};
      })
      .catch(() => {
        return {type: SET_AUTH_TOKEN, payload: null};
      });
  } else {
    token = await getToken();
    setToAsyncStorage('authToken', token)
      .then(() => {
        return {type: SET_AUTH_TOKEN, payload: token};
      })
      .catch(() => {
        return {type: SET_AUTH_TOKEN, payload: null};
      });
  }
};

/**
 * deploySignedTx -> Deploys the signed tx and sets the Tx Receipt
 * @param rawTx
 * @param networkId
 */
// eslint-disable-next-line consistent-return
export const deploySignedTx = async (rawTx, networkId) => {
  const token = await getFromAsyncStorage('authToken');
  let result;
  try {
    result = await deployTransaction(rawTx, networkId, token);
  } catch (e) {
    result = e;
  }
  if (result) {
    return {type: DEPLOY_SIGNED_TX, payload: result.data};
  }
};

/**
 * Sets The Loader status
 * @param data
 */
export const setLoaderStatus = (data) => {
  return {type: SET_LOADER_STATUS, payload: data};
};

/**
 * Sets the Error MSG
 * @param data
 */
export const setErrorStatus = (data) => {
  return {type: SET_ERROR_STATUS, payload: data};
};

/**
 * Sets the Testnet throughout the app
 * @param data - testnet ID
 */
export const setTestnetID = (data) => {
  return {type: SET_TESTNET_ID, payload: data};
};

/**
 * Sets all available accounts
 * @param data
 */
export const setAccounts = async () => {
  const a = await listAccounts();
  return {type: SET_ACCOUNTS, payload: a};
};

/**
 * Set the current account
 * @param data
 */
export const setCurrentAccount = (data) => {
  return {type: SET_CURRENT_ACCOUNT, payload: data};
};
