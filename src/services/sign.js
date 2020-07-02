// eslint-disable-next-line import/extensions
import {Buffer} from 'buffer';
import Geth from 'react-native-geth';
import {setToAsyncStorage} from '../actions/utils';

const geth = new Geth({networkID: 5, testNet: 'goerli'});

global.Buffer = Buffer;

// const Buffer = require('buffer').Buffer;
// const EthereumTx = require('ethereumjs-tx').Transaction;
// const formatters = require('web3-core-helpers').formatters;
const keythereum = require('keythereum');

// sign an unsigned raw transaction and deploy
export async function signTransaction(password, tx) {
  try {
    const {transaction, raw} = await geth.signTransaction(password, tx);
    return {
      transaction: JSON.parse(transaction),
      rawTransaction: `0x${raw}`,
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
    await setToAsyncStorage('keystore', JSON.stringify(keyObject));
    return keyObject;
  } catch (error) {
    return error;
  }
}

// delete privateKey against address
export function deleteKeyPair(password) {
  return new Promise((resolve, reject) => {
    geth
      .deleteAccount(password)
      .then(() => {
        console.log('Account deleted!');
        resolve(true);
      })
      .catch((e) => {
        reject(false);
      });
  });
  // return removeFromAsyncStorage(publicKey);
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

export async function setKs(ksIndex) {
  try {
    return await geth.setAccount(ksIndex);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
