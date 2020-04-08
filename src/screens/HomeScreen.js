import React, {useState} from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import {Layout, Text, Button, Card} from '@ui-kitten/components';
import deployUnsignedTx from '../services/sign';
import QRScanner from '../components/QRScanner';

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    // height: Dimensions.get('window').height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeHeader: {
    margin: 25,
  },
  signBtn: {
    margin: 10,
    zIndex: 999,
    width: Dimensions.get('window').width - 50,
  },
});

const HomeScreen = () => {
  const [txHash, setTxHash] = useState('');
  const [rawTx, setrawTx] = useState('');
  const [scan, setScan] = useState(false);

  const handleSignTx = () => {
    console.log('Handling');
    const {transactionHash, rawTransaction} = deployUnsignedTx;
    setTxHash(transactionHash);
    setrawTx(rawTransaction);
  };

  const handleScanner = (e) => {
    setScan(false);
    console.log('Success: ', e.data);
  };
  return (
    <Layout style={styles.container}>
      <Layout style={styles.homeHeader}>
        <Text category="h1">Home</Text>
      </Layout>
      <Layout
        style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: 5}}>
        <Layout>
          {txHash.length > 0 && rawTx.length > 0 && (
            <Card>
              <Text appearance="hint">Transaction Hash: </Text>
              <Text>{txHash}</Text>
              <Text appearance="hint">Raw Transaction: </Text>
              <Text> {rawTx}</Text>
            </Card>
          )}
        </Layout>
        <Layout>
          <Button style={styles.signBtn} onPress={handleSignTx}>
            Sign Transaction
          </Button>
        </Layout>
      </Layout>
      {scan && <QRScanner onSuccess={handleScanner} />}
      <Button onPress={() => setScan(true)}>Scan</Button>
      <Button onPress={() => setScan(false)}>Stop Scan</Button>
    </Layout>
  );
};

export default HomeScreen;
