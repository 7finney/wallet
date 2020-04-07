// eslint-disable-next-line import/extensions
import {sha3} from './hash/sha3';

const EthereumTx = require('ethereumjs-tx').Transaction;
const formatters = require('web3-core-helpers').formatters;

// sign an unsigned raw transaction and deploy
function deployUnsignedTx(meta: any, tx: any, privateKey: any, testnetId?: any) {
  // TODO: error handling
  tx = JSON.parse(tx);
  const txData = formatters.inputTransactionFormatter(tx);
  // TODO: this method should not work for ganache and prysm and throw error
  const chainId = Number(testnetId) === 5 ? 6284 : Number(testnetId);
  const unsignedTransaction = new EthereumTx(
    {
      from: txData.from || '0x',
      nonce: txData.nonce || '0x',
      gasPrice: txData.gasPrice,
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

  const c = {
    callInterface: {
      command: 'deploy-signed-tx',
      payload: rawTransaction,
      testnetId,
    },
  };
  // TODO REMOVE
  console.log(transactionHash, c);
}

deployUnsignedTx();
