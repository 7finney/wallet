// eslint-disable-next-line import/extensions
import {Buffer} from 'buffer';
import {sha3} from './hashUtils/sha3';
import {removeFromAsyncStorage, setToAsyncStorage} from '../actions/utils';

global.Buffer = Buffer;

// const Buffer = require('buffer').Buffer;
const EthereumTx = require('ethereumjs-tx').Transaction;
const formatters = require('web3-core-helpers').formatters;
const keythereum = require('keythereum');

// sign an unsigned raw transaction and deploy
export function deployUnsignedTx(tx: any, privateKey?: any, testnetId?: any) {
  try {
    const txData = formatters.inputTransactionFormatter(tx);
    // TODO: this method should not work for ganache and prysm and throw error
    const chainId = Number(testnetId) === 5 ? 6284 : Number(testnetId);
    const unsignedTransaction = new EthereumTx(
      {
        from: txData.from || '0x',
        nonce: txData.nonce || '0x',
        gasPrice: txData.gasPrice | 0,
        gas: txData.gas || '0x',
        to: txData.to || '0x',
        value: txData.value || '0x',
        data: txData.data || '0x',
      },
      {chain: chainId}
    );
    const pvtk = Buffer.from(privateKey, 'hex');
    unsignedTransaction.sign(pvtk);
    const rlpEncoded = unsignedTransaction.serialize().toString('hex');
    const rawTransaction = `0x${rlpEncoded}`;
    const transactionHash = sha3(rawTransaction);

    return {
      transactionHash,
      rawTransaction,
    };
  } catch (e) {
    return {
      Error: e,
    };
  }
}

// extract privateKey against address
function extractPvtKey(keyObject: any, pswd: string) {
  return keythereum.recover(pswd, keyObject);
}

// create keypair and saves to AsyncStorage for now
export async function createKeyPair(pswd: string) {
  console.log('Function Called CreateKeyPair', pswd);
  try {
    const params = {keyBytes: 32, ivBytes: 16};
    console.log('PArams: ', params);
    const bareKey = keythereum.create(params);
    const options = {
      kdf: 'scrypt',
      cipher: 'aes-128-ctr',
    };
    console.log('BareKey: ', bareKey);
    const keyObject = keythereum.dump(pswd, bareKey.privateKey, bareKey.salt, bareKey.iv, options);
    console.log('KeyObject: ', keyObject);
    const key = extractPvtKey(keyObject, pswd);
    const res = await setToAsyncStorage(keyObject.address, key);
    if (res) {
      return keyObject.address;
    }
    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
}

// delete privateKey against address
export function deleteKeyPair(publicKey) {
  return removeFromAsyncStorage(publicKey);
}
