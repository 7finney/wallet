import { combineReducers } from 'redux';
import transactionReducer from './transactionReducer';
import authReducer from './authReducer';

export default combineReducers({
  tx: transactionReducer,
  auth: authReducer,
});
