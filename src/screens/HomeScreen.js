import React, {useState} from 'react';
import {StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import {Layout, Text, Button, Card, Icon} from '@ui-kitten/components';
import deployUnsignedTx from '../services/sign';
import QRScanner from '../components/QRScanner';

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeHeader: {
    padding: 10,
    position: 'absolute',
    top: 0,
    // marginTop: -1,
    width: '100%',
    textAlign: 'center',
    backgroundColor: '#2d4bf7',
  },
  homeHeaderText: {
    textAlign: 'center',
    color: '#fff',
    marginBottom: 2,
  },
  signBtn: {
    margin: 10,
    zIndex: 999,
    width: Dimensions.get('window').width - 50,
  },
  icon: {
    width: 32,
    height: 32,
  },
});

const HomeScreen = () => {
  const [txHash, setTxHash] = useState('');
  const [unsignedTx, setUnsignedTx] = useState({});
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
    setUnsignedTx(e.data);
  };
  return (
    <Layout style={styles.container}>
      <Layout style={styles.homeHeader}>
        <Text style={styles.homeHeaderText} category="h1">
          Wallet Home
        </Text>
      </Layout>
      <Layout
        style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: 5}}>
        {txHash.length > 0 && rawTx.length > 0 && (
          <Layout>
            <Card>
              <Text appearance="hint">Transaction Hash: </Text>
              <Text>{txHash}</Text>
              <Text appearance="hint">Raw Transaction: </Text>
              <Text> {rawTx}</Text>
            </Card>
          </Layout>
        )}
        {Object.keys(unsignedTx).length > 0 && (
          <Layout>
            <Button style={styles.signBtn} onPress={handleSignTx}>
              Sign Transaction
            </Button>
          </Layout>
        )}
      </Layout>
      {scan && <QRScanner onSuccess={handleScanner} />}
      <TouchableOpacity
        style={{
          borderWidth: 0,
          alignItems: 'center',
          justifyContent: 'center',
          width: 70,
          position: 'absolute',
          bottom: 10,
          right: 10,
          height: 70,
          backgroundColor: '#fff',
          borderRadius: 100,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.5,
          shadowRadius: 2,
          elevation: 2,
        }}
        onPress={() => setScan(!scan)}>
        {scan === false ? (
          <Icon style={styles.icon} fill="#8F9BB3" name="camera" />
        ) : (
          <Icon style={styles.icon} fill="#8F9BB3" name="close" />
        )}
      </TouchableOpacity>
    </Layout>
  );
};

export default HomeScreen;
