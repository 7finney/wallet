import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, Dimensions, TouchableOpacity, ScrollView, ToastAndroid} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Layout, Text, Button, Card, Icon, Input} from '@ui-kitten/components';
import deployUnsignedTx from '../services/sign';
import QRScanner from '../components/QRScanner';
import {setUnsignedTx, setRawTx, getAuthToken, setUnsignedTxHash} from '../actions';
import {getUnsignedTx} from '../actions/utils';

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
  const {tx, auth} = props;

  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [scan, setScan] = useState(false);

  // ComponentDidMount
  useEffect(() => {
    ToastAndroid.showWithGravity('Fetching AuthToken', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    props.getAuthToken();
  }, []);

  // ComponentDidUpdate for tx. Triggers on tx change
  useEffect(() => {
    if (tx.unsignedTxHash !== undefined && tx.unsignedTxHash !== '' && auth.token !== '') {
      getUnsignedTx(tx.unsignedTxHash, auth.token).then((unsignedTX) => {
        if (unsignedTX) {
          props.setUnsignedTx(unsignedTX);
        }
      });
    }
  }, [tx]);

  // ComponentDidUpdate for auth. Triggers on auth change
  useEffect(() => {
    if (auth.token === '' || auth.token === null) {
      ToastAndroid.showWithGravity(
        'AuthToken Generation Error. Please try again',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
    }
  }, [auth]);

  // componentDidUpdate
  useEffect(() => {
    console.log(props);
  });

  const handleSignTx = () => {
    setError('');
    const {transactionHash, rawTransaction} = deployUnsignedTx(props.tx.unsignedTx);
    setTxHash(transactionHash);
    props.setRawTx(rawTransaction);
  };

  const updateUnsignedTx = (key, value) => {
    const newTx = tx.unsignedTx;
    newTx[key] = value;
    props.setUnsignedTx(newTx);
  };

  const handleScanner = (e) => {
    setScan(false);
    setError('');
    console.log('Success: ', e.data);
    try {
      props.setUnsignedTxHash(e.data);
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
                  {tx && (
                    // Object.keys(tx.unsignedTx).map((k) => (
                    //   <Layout key={k}>
                    //     <Text h4>{k}:</Text>
                    //     <Input
                    //       placeholder="Place your Text"
                    //       value={tx.unsignedTx[k].toString()}
                    //       disbaled
                    //     />
                    //   </Layout>
                    // ))}
                    <Layout>
                      <Layout>
                        <Text h4>From: </Text>
                        <Input value={tx.unsignedTx.from} disabled />
                      </Layout>
                      <Layout>
                        <Text h4>To: </Text>
                        <Input value={tx.unsignedTx.to} disabled />
                      </Layout>
                      <Layout>
                        <Text h4>Nonce: </Text>
                        <Input value={tx.unsignedTx.nonce} disabled />
                      </Layout>
                      <Layout>
                        <Text h4>Gas: </Text>
                        <Input value={tx.unsignedTx.gas} disabled />
                      </Layout>
                      <Layout>
                        <Text h4>Gas Price: </Text>
                        <Input value={tx.unsignedTx.gasPrice} disabled />
                      </Layout>
                      <Layout>
                        <Text h4>Value: </Text>
                        <Input
                          value={tx.unsignedTx.value}
                          onChange={(e) => updateUnsignedTx('value', e.data)}
                        />
                      </Layout>
                      <Layout>
                        <Text h4>Data: </Text>
                        <Input
                          value={tx.unsignedTx.data}
                          onChange={(e) => updateUnsignedTx('data', e.data)}
                        />
                      </Layout>
                    </Layout>
                  )}
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
  setUnsignedTxHash: PropTypes.func,
  getAuthToken: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  auth: PropTypes.any,
  // eslint-disable-next-line react/forbid-prop-types
  tx: PropTypes.any,
};

const mapStateToProps = ({tx, auth}) => {
  return {
    tx,
    auth,
  };
};

export default connect(mapStateToProps, {setUnsignedTx, setRawTx, getAuthToken, setUnsignedTxHash})(
  HomeScreen
);
