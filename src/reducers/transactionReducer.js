import {RAW_TX, UNSIGNED_TX} from '../actions/types';

const initialState = {
  unsignedTx: {},
  rawTx: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case UNSIGNED_TX:
      return {...state, unsignedTx: action.payload};
    case RAW_TX:
      return {...state, rawTx: action.payload};
    default:
      return {...state};
  }
};
