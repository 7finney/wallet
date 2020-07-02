import {SET_ACCOUNTS, SET_AUTH_TOKEN, SET_CURRENT_ACCOUNT} from '../actions/types';

const initialState = {
  token: undefined,
  accounts: [],
  account: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_AUTH_TOKEN:
      return {...state, token: action.payload};
    case SET_ACCOUNTS:
      return {...state, accounts: action.payload};
    case SET_CURRENT_ACCOUNT:
      return {...state, account: action.payload};
    default:
      return {...state};
  }
};
