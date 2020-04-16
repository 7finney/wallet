import {RAW_TX, UNSIGNED_TX} from './types';

/**
 *  setUnsignedTx Func -> Sets the Unsigned TX from the QRScanner
 *  @param {data: any} -- unsigned Data from QRScanner
 * */
export const setUnsignedTx = (data) => (dispatch) => {
  dispatch({type: UNSIGNED_TX, payload: JSON.parse(data.data)});
};

/**
 *  setRawTx Func -> Sets the rawTX after signing
 *  @param {data: string} -- rawTx after signing
 * */
export const setRawTx = (data) => (dispatch) => {
  dispatch({type: RAW_TX, payload: data});
};
