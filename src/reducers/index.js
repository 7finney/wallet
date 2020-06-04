import {combineReducers} from 'redux';
import transactionReducer from './transactionReducer';
import authReducer from './authReducer';
import componentReducer from './componentReducer';

export default combineReducers({
	tx: transactionReducer,
	auth: authReducer,
	comp: componentReducer,
});
