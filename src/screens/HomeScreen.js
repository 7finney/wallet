import React, {useState} from 'react';
import {StyleSheet, Dimensions, TouchableOpacity, ScrollView} from 'react-native';
import {Layout, Text, Button, Card, Icon, Input} from '@ui-kitten/components';
import deployUnsignedTx from '../services/sign';
import QRScanner from '../components/QRScanner';

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  homeHeader: {
    padding: 10,
    width: '100%',
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
  error: {
    backgroundColor: '#eb4034',
    width: '100%',
    padding: 20,
  },
});

const HomeScreen = () => {
  const [txHash, setTxHash] = useState('');
  const [unsignedTx, setUnsignedTx] = useState({});
  const [rawTx, setrawTx] = useState('');
  const [error, setError] = useState('');
  const [scan, setScan] = useState(false);

  const handleSignTx = () => {
    setError('');
    const {transactionHash, rawTransaction} = deployUnsignedTx(unsignedTx);
    setTxHash(transactionHash);
    setrawTx(rawTransaction);
  };

  const handleScanner = (e) => {
    setScan(false);
    setError('');
    console.log('Success: ', e.data);
    try {
      setUnsignedTx(JSON.parse(e.data));
    } catch (e) {
      console.log('er', e);
      setError('Invalid Transaction');
      setTimeout(() => setError(''), 5000);
    }
  };
  return (
    <ScrollView>
      <Layout style={styles.container}>
        <Layout style={styles.homeHeader}>
          <Text style={styles.homeHeaderText} category="h1">
            Wallet
          </Text>
        </Layout>
        {error !== '' && (
          <Layout style={styles.error}>
            <Text style={{textAlign: 'center', color: '#fff', fontSize: 18}}>{error}</Text>
          </Layout>
        )}
        <Layout
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: 5,
          }}>
          {Object.keys(unsignedTx).length > 0 && (
            <Layout
              style={{
                marginBottom: 10,
                padding: 10,
              }}>
              <Card>
                <Text appearance="hint">Transaction To Be Signed: </Text>
                {Object.keys(unsignedTx).map((k) => (
                  <Layout>
                    <Text h4 key={k}>
                      {k}:
                    </Text>
                    <Input placeholder="Place your Text" value={unsignedTx[k]} disbaled />
                  </Layout>
                ))}
              </Card>
            </Layout>
          )}
          {txHash.length > 0 && rawTx.length > 0 && (
            <Layout
              style={{
                marginBottom: 10,
                padding: 10,
              }}>
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
              {txHash === '' ? (
                <Layout>
                  <Button style={styles.signBtn} onPress={handleSignTx}>
                    Sign Transaction
                  </Button>
                </Layout>
              ) : (
                <Layout>
                  <Button style={[styles.signBtn, {backgroundColor: '#15348a'}]}>
                    Sign Transaction
                  </Button>
                  <Button style={styles.signBtn} onPress={handleSignTx}>
                    Deploy Transaction
                  </Button>
                </Layout>
              )}
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
          onPress={() => {
            setScan(!scan);
            setError('');
            setTxHash('');
            setrawTx('');
            setUnsignedTx({});
          }}>
          {scan === false ? (
            <Icon style={styles.icon} fill="#8F9BB3" name="camera" />
          ) : (
            <Icon style={styles.icon} fill="#8F9BB3" name="close" />
          )}
        </TouchableOpacity>
      </Layout>
    </ScrollView>
  );
};

export default HomeScreen;
