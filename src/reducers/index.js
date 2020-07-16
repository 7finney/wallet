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
} from '../actions/types';

const Redducer = (state, action) => {
  switch (action.type) {
    case SET_AUTH_TOKEN:
      return {...state, token: action.payload};
    case SET_ACCOUNTS:
      return {...state, accounts: action.payload};
    case SET_CURRENT_ACCOUNT:
      return {...state, account: action.payload};
    case SET_LOADER_STATUS:
      return {...state, loader: action.payload};
    case SET_ERROR_STATUS:
      return {...state, errorMsg: action.payload};
    case SET_TESTNET_ID:
      return {...state, testnetID: action.payload};
    case UNSIGNED_TX:
      return {...state, unsignedTx: action.payload};
    case UNSIGNED_TX_HASH:
      return {...state, unsignedTxHash: action.payload};
    case RAW_TX:
      return {...state, rawTx: action.payload};
    case DEPLOY_SIGNED_TX:
      return {...state, txReceipt: action.payload};
    default:
      return {...state};
  }
};

export default Redducer;
