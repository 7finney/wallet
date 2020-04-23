import {RAW_TX, SET_AUTH_TOKEN, UNSIGNED_TX, UNSIGNED_TX_HASH} from './types';
import {getFromAsyncStorage, getToken, setToAsyncStorage, verifyToken} from './utils';

/**
 *  setUnsignedTx Func -> Sets the Unsigned TX
 *  @param {data: any} -- unsigned Data from server
 * */
export const setUnsignedTx = (data) => (dispatch) => {
  dispatch({type: UNSIGNED_TX, payload: data});
};

/**
 *  setUnsignedTxHash Func -> Sets the Unsigned TX hash from the QRScanner
 *  @param {data: any} -- unsigned Data from QRScanner
 * */
export const setUnsignedTxHash = (data) => (dispatch) => {
  dispatch({type: UNSIGNED_TX_HASH, payload: data});
};

/**
 *  setRawTx Func -> Sets the rawTX after signing
 *  @param {data: string} -- rawTx after signing
 * */
export const setRawTx = (data) => (dispatch) => {
  dispatch({type: RAW_TX, payload: data});
};

export const getAuthToken = () => async (dispatch) => {
  let token = await getFromAsyncStorage('authToken');
  if (token) {
    if (await verifyToken(token)) {
      dispatch({type: SET_AUTH_TOKEN, payload: token});
    } else {
      token = await getToken();
      setToAsyncStorage('authToken', token)
        .then(() => {
          dispatch({type: SET_AUTH_TOKEN, payload: token});
        })
        .catch(() => {
          dispatch({type: SET_AUTH_TOKEN, payload: null});
        });
    }
  } else {
    token = await getToken();
    setToAsyncStorage('authToken', token)
      .then(() => {
        dispatch({type: SET_AUTH_TOKEN, payload: token});
      })
      .catch(() => {
        dispatch({type: SET_AUTH_TOKEN, payload: null});
      });
  }
};
