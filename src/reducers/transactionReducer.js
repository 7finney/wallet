import {DEPLOY_SIGNED_TX, RAW_TX, UNSIGNED_TX, UNSIGNED_TX_HASH} from '../actions/types';

const initialState = {
  unsignedTx: {
    chainId: 5,
    data: '0xf088d54700000000000000000000000007f4f97db7c0f2883ab1c8c0fc5cc11372ad27a7',
    from: '0x540383a0B935997425DFedc214A8B26130C50718',
    gas: 0,
    gasPrice: 1000000001,
    nonce: 80,
    to: '0x23Cc4A1258B4506eD621735dfA3EAB62Fa0140c4',
    value: 0,
  },
  rawTx: '',
  txHash: '1lVx2BfeSPpDXxYix7ZR-pSX-b986Kl-Og44S1sxzkc=',
  txReceipt: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
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
