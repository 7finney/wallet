import {SET_ERROR_STATUS, SET_LOADER_STATUS, SET_TESTNET_ID} from '../actions/types';

const initialState = {
  loader: true,
  errorMsg: '',
  testnetID: 5,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_LOADER_STATUS:
      return {...state, loader: action.payload};
    case SET_ERROR_STATUS:
      return {...state, errorMsg: action.payload};
    case SET_TESTNET_ID:
      return {...state, testnetID: action.payload};
    default:
      return {...state};
  }
}
