// eslint-disable-next-line import/extensions
import {Buffer} from 'buffer';
import Geth from 'react-native-geth';
import {sha3} from './hashUtils/sha3';
import {removeFromAsyncStorage, setToAsyncStorage} from '../actions/utils';

const geth = new Geth({networkID: 5, testNet: 'goerli'});

global.Buffer = Buffer;

// const Buffer = require('buffer').Buffer;
// const EthereumTx = require('ethereumjs-tx').Transaction;
// const formatters = require('web3-core-helpers').formatters;
const keythereum = require('keythereum');

// chainList for ethereumjs-tx
const chainList = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  5: 'goerli',
};

// sign an unsigned raw transaction and deploy
export async function signTransaction(password, tx, testnetId) {
  try {
    console.log('deploy unsigned');
    console.log(tx);
    // desired
    // const transaction = await geth.signTransaction(address, password, unsignedTransaction);
    // const pvtk = Buffer.from(privateKey, 'hex');
    // unsignedTransaction.sign(pvtk);
    // const rlpEncoded = unsignedTransaction.serialize().toString('hex');
    // const rawTransaction = `0x${rlpEncoded}`;
    const signedTx = await geth.signTransaction(password, tx, testnetId);
    return {
      transaction: JSON.parse(signedTx),
    };
  } catch (e) {
    console.log(e);
    return {
      Error: e,
    };
  }
}

// extract privateKey against address
function extractPvtKey(keyObject, pswd) {
  return keythereum.recover(pswd, keyObject).toString('hex');
}

// create keypair and saves to AsyncStorage for now
export async function createKeyPair(password) {
  try {
    const keyObject = await geth.newAccount(password);
    console.log(keyObject);
    await setToAsyncStorage('keystore', JSON.stringify(keyObject));
    return keyObject;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// delete privateKey against address
export function deleteKeyPair(publicKey) {
  return removeFromAsyncStorage(publicKey);
}

export function getPvtKey(keystore, password) {
  try {
    const key = extractPvtKey(keystore, password);
    return key;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function listAccounts() {
  try {
    return await geth.listAccounts();
  } catch (error) {
    console.log(error);
    throw error;
  }
}
