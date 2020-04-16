import React, {useState, useEffect} from 'react';
import {StyleSheet, Dimensions, TouchableOpacity, ScrollView, View} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Layout, Text, Button, Card, Icon, Input} from '@ui-kitten/components';
import deployUnsignedTx from '../services/sign';
import QRScanner from '../components/QRScanner';
import {setUnsignedTx, setRawTx} from '../actions';

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

const HomeScreen = (props) => {
  const {tx} = props;

  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [scan, setScan] = useState(false);

  useEffect(() => {
    console.log(props);
  }, [tx]);

  const handleSignTx = () => {
    setError('');
    const {transactionHash, rawTransaction} = deployUnsignedTx(props.tx.unsignedTx);
    setTxHash(transactionHash);
    props.setRawTx(rawTransaction);
  };

  const handleScanner = (e) => {
    setScan(false);
    setError('');
    console.log('Success: ', e.data);
    try {
      const data = JSON.parse(e.data);
      props.setUnsignedTx(data);
    } catch (err) {
      console.log('er', err);
      setError('Invalid Transaction');
      setTimeout(() => setError(''), 5000);
    }
  };
  return (
    <Layout style={styles.container}>
      <Layout style={styles.homeHeader}>
        <Text style={styles.homeHeaderText} category="h1">
          Wallet
        </Text>
      </Layout>
      <ScrollView>
        <Layout
          style={{
            width: Dimensions.get('window').width,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}>
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
            {tx && Object.keys(tx.unsignedTx).length > 0 && (
              <Layout
                style={{
                  marginBottom: 10,
                  padding: 10,
                }}>
                <Card>
                  <Text appearance="hint">Transaction To Be Signed: </Text>
                  {tx &&
                    Object.keys(tx.unsignedTx).map((k) => (
                      <Layout>
                        <Text h4 key={k}>
                          {k}:
                        </Text>
                        <Input placeholder="Place your Text" value={tx.unsignedTx[k]} disbaled />
                      </Layout>
                    ))}
                </Card>
              </Layout>
            )}
            {tx && txHash.length > 0 && tx.rawTx.length > 0 && (
              <Layout
                style={{
                  marginBottom: 10,
                  padding: 10,
                }}>
                <Card>
                  <Text appearance="hint">Transaction Hash: </Text>
                  <Text>{txHash}</Text>
                  <Text appearance="hint">Raw Transaction: </Text>
                  <Text> {tx.rawTx}</Text>
                </Card>
              </Layout>
            )}
            {tx && Object.keys(tx.unsignedTx).length > 0 && (
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
        </Layout>
      </ScrollView>
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
          props.setRawTx('');
          props.setUnsignedTx({});
        }}>
        {scan === false ? (
          <Icon style={styles.icon} fill="#8F9BB3" name="camera" />
        ) : (
          <Icon style={styles.icon} fill="#8F9BB3" name="close" />
        )}
      </TouchableOpacity>
    </Layout>
  );
};

HomeScreen.propTypes = {
  setUnsignedTx: PropTypes.func,
  setRawTx: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  tx: PropTypes.any,
};

const mapStateToProps = ({tx}) => {
  return {
    tx,
  };
};

export default connect(mapStateToProps, {setUnsignedTx, setRawTx})(HomeScreen);
