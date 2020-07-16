import React, {createContext, useReducer} from 'react';
import PropTypes from 'prop-types';
import Reducer from './reducers';

const initialState = {
  token: undefined,
  accounts: [],
  account: {},
  loader: true,
  errorMsg: '',
  testnetID: 1,
  unsignedTx: {},
  rawTx: '',
  txHash: '',
  txReceipt: {},
};

const Store = ({children}) => {
  const [state, dispatch] = useReducer(Reducer, initialState);
  return <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>;
};

Store.propTypes = {
  children: PropTypes.element,
};

export const Context = createContext(initialState);
export default Store;
