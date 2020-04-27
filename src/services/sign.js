// eslint-disable-next-line import/extensions
import {Buffer} from 'buffer';
import {sha3} from './hashUtils/sha3';

global.Buffer = Buffer;

// const Buffer = require('buffer').Buffer;
const EthereumTx = require('ethereumjs-tx').Transaction;
const formatters = require('web3-core-helpers').formatters;

// sign an unsigned raw transaction and deploy
function deployUnsignedTx(tx: any, privateKey?: any, testnetId?: any) {
  // TODO: error handling
  try {
    // tx = JSON.parse(tx);
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
    // privateKey = '8b9373c09d28114a36f333a7e6a5cf6dc7332f13dc05f925eec37b8107a236fb';
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

export default deployUnsignedTx;
