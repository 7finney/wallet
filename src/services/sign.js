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
function deployUnsignedTx(tx: any, privateKey?: any, testnetId?: any) {
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

// create keypair
function createKeyPair(path: string, pswd: string) {
  const params = {keyBytes: 32, ivBytes: 16};
  const bareKey = keythereum.create(params);
  const options = {
    kdf: 'scrypt',
    cipher: 'aes-128-ctr',
  };
  const keyObject = keythereum.dump(pswd, bareKey.privateKey, bareKey.salt, bareKey.iv, options);
  const key = extractPvtKey(keyObject, pswd);
  return setToAsyncStorage(keyObject.address, key);
}

// delete privateKey against address
function deleteKeyPair(publicKey) {
  return removeFromAsyncStorage(publicKey);
}

export default deployUnsignedTx;
