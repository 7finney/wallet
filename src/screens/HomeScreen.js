import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {Layout, Text, Divider, Button, Card} from '@ui-kitten/components';
import deployUnsignedTx from '../services/sign';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signBtn: {
    margin: 10,
    // top: '50%',
    // left: '50%',
    zIndex: 999,
    // transform: [{translateX: -50}, {translateY: -50}],
  },
});

const HomeScreen = () => {
  const [txHash, setTxHash] = useState('');

  const [rawTx, setrawTx] = useState('');

  const handleSignTx = () => {
    console.log('Handling');
    const {transactionHash, rawTransaction} = deployUnsignedTx;
    setTxHash(transactionHash);
    setrawTx(rawTransaction);
  };
  return (
    <Layout style={styles.container}>
      <Text category="h1">Home</Text>
      <Divider />
      {txHash.length > 0 && rawTx.length > 0 && (
        <Card>
          <Text>Transaction Hash: {txHash}</Text>
          <Text>Raw Transaction: {rawTx}</Text>
        </Card>
      )}
      <Button style={styles.signBtn} onPress={handleSignTx}>
        Sign Transaction
      </Button>
      <Divider />
    </Layout>
  );
};

export default HomeScreen;
