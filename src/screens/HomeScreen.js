import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, Dimensions, TouchableOpacity, ScrollView, ToastAndroid} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {
  Layout,
  Text,
  Button,
  Card,
  Icon,
  Input,
  Spinner,
  Select,
  Modal,
} from '@ui-kitten/components';
import {deployUnsignedTx, createKeyPair, deleteKeyPair} from '../services/sign';
import QRScanner from '../components/QRScanner';
import {setUnsignedTx, setRawTx, getAuthToken, setUnsignedTxHash, deploySignedTx} from '../actions';
import {getUnsignedTx, setToAsyncStorage, getFromAsyncStorage} from '../actions/utils';

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

const testNetArray = [
  {text: 'Ethereum Mainnet'},
  {text: 'Goerli'},
  {text: 'Ropsten'},
  {text: 'Rinkeby'},
];

const networkIdList = {
  'Ethereum Mainnet': 1,
  Ropsten: 3,
  Rinkeby: 4,
  Goerli: 5,
};

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const HomeScreen = (props) => {
  const {tx, auth} = props;

  // Component State
  const [networkId, setNetworkId] = useState(5);
  const [testnet, setTestnet] = useState(null);
  const [txHash, setTxHash] = useState('');
  const [unsignedTxState, setUnsignedTxState] = useState({});
  const [pvtKey, setPvtKey] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [scan, setScan] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ComponentDidMount
  useEffect(() => {
    ToastAndroid.showWithGravity('Fetching AuthToken', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    setShowLoader(true);
    props.getAuthToken();
    // Get Private key from async storage on component mount
    (async function () {
      const key = await getFromAsyncStorage('pvtKey');
      if (key) {
        setPvtKey(key);
      }
      if (password) {
        setPassword('');
      }
    })();
  }, []);

  // ComponentDidUpdate for tx.unsignedTxHash. Triggers on tx Hash change
  useEffect(() => {
    if (tx.unsignedTxHash !== undefined && tx.unsignedTxHash !== '' && auth.token !== '') {
      setShowLoader(true);
      getUnsignedTx(tx.unsignedTxHash, auth.token)
        .then((unsignedTX) => {
          if (unsignedTX) {
            props.setUnsignedTx(JSON.parse(unsignedTX));
          } else {
            setShowLoader(false);
            setError('Invalid Transaction');
          }
        })
        .catch(() => {
          setShowLoader(false);
          setError('Error Getting Transaction');
        });
    }
  }, [tx.unsignedTxHash]);

  // ComponentDidUpdate for txReceipt. Triggers on tx.txReceipt change
  useEffect(() => {
    if (tx.txReceipt.Error) {
      const msg = tx.txReceipt.Error.split('=').slice(-1)[0];
      setError(msg);
    }
    if (tx.txReceipt.Status) {
      setError(tx.txReceipt.Status);
    }
    setShowLoader(false);
  }, [tx.txReceipt]);

  const prevAuth = usePrevious({auth});
  // ComponentDidUpdate for auth. Triggers on auth change
  useEffect(() => {
    if (auth.token !== '' && auth.token !== undefined && prevAuth.auth.token !== auth.token) {
      setShowLoader(false);
      ToastAndroid.showWithGravity('AuthToken Generated', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    } else if (auth.token === '' || auth.token === null) {
      setShowLoader(false);
      ToastAndroid.showWithGravity(
        'AuthToken Generation Error. Please try again',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
    }
  }, [auth]);

  useEffect(() => {
    if (testnet !== null) {
      setNetworkId(networkIdList[testnet.text]);
    }
  }, [testnet]);

  // componentDidUpdate
  useEffect(() => {
    console.log(props);
    if (Object.keys(unsignedTxState).length === 0 && Object.keys(tx.unsignedTx).length > 0) {
      setShowLoader(false);
      setUnsignedTxState(tx.unsignedTx);
    }
  });

  const handleSignTx = async () => {
    setError('');
    const privateKey = await getFromAsyncStorage('pvtKey');
    if (!privateKey) {
      setError('No Private Key Set');
    } else if (privateKey !== '') {
      // For signing With private key.
      // Not to be confused with deploying unsigned Tx
      const {transactionHash, rawTransaction, Error} = deployUnsignedTx(
        unsignedTxState,
        privateKey,
        networkId
      );
      if (Error) {
        setError(Error.message);
      } else {
        setTxHash(transactionHash);
        props.setRawTx(rawTransaction);
      }
    }
  };

  const updateUnsignedTx = (key, value) => {
    // Deep Copying object
    const newTx = JSON.parse(JSON.stringify(unsignedTxState));
    newTx[key] = value;
    setUnsignedTxState(newTx);
  };

  const handleScanner = (e) => {
    setScan(false);
    setError('');
    try {
      setShowLoader(true);
      props.setUnsignedTxHash(e.data);
    } catch (err) {
      setError('Invalid Transaction');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDeployTx = () => {
    if (tx.rawTx !== '' && auth.token !== '') {
      setError('');
      setShowLoader(true);
      props.deploySignedTx(tx.rawTx, networkId, auth.token);
    } else {
      setError('Maybe Transaction not signed or no auth token generated');
    }
  };

  const handleAddPvtKey = async () => {
    const result = await setToAsyncStorage('pvtKey', pvtKey);
    if (result) {
      setError('Successfully Set');
    } else {
      setError('Error setting private key');
    }
  };

  const handleGenerateKeyPair = async () => {
    const res = await createKeyPair('');
    if (res) {
      const savedPvtKey = await getFromAsyncStorage(res);
      if (savedPvtKey) {
        setPvtKey(savedPvtKey);
      } else {
        setError('No Pvt Key Found');
      }
    } else {
      setError('Error Generating pvt Key');
    }
  };

  const handleDeletePrivateKey = async () => {
    try {
      const res = await deleteKeyPair('pvtKey');
      if (res) {
        setError('Private Key Deleted Successfully');
      }
    } catch (e) {
      setError('Unable To delete Private Key');
    }
  };

  return (
    <Layout style={styles.container}>
      <Layout style={styles.homeHeader}>
        <Text style={styles.homeHeaderText} category="h1">
          Wallet
        </Text>
      </Layout>
      {showLoader && (
        <Layout
          style={{
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 100,
            elevation: 5,
            marginTop: 20,
          }}>
          <Spinner size="large" />
        </Layout>
      )}
      {error !== '' && (
        <Layout style={styles.error}>
          <Text style={{textAlign: 'center', color: '#fff', fontSize: 18}}>{error}</Text>
        </Layout>
      )}
      <Layout
        style={{
          width: '95%',
          margin: 5,
        }}>
        <Input
          label="Private Key:"
          placeholder="Enter Private key without 0x"
          value={pvtKey}
          onChangeText={(e) => setPvtKey(e)}
        />
        <Button onPress={(e) => handleAddPvtKey(e)}>Set Private Key</Button>
        {pvtKey.length > 0 ? (
          <Layout>
            <Button onPress={() => setShowModal(true)} disabled>
              Generate Account Key/Pair
            </Button>
            <Button onPress={handleDeletePrivateKey}>Delete Current Account</Button>
          </Layout>
        ) : (
          <Layout>
            <Button onPress={() => setShowModal(true)}>Generate Account Key/Pair</Button>
            <Button onPress={handleDeletePrivateKey} disabled>
              Delete Current Account
            </Button>
          </Layout>
        )}
        {showModal && (
          <Modal visible={showModal} backdropStyle={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
            <Layout
              level="3"
              style={{
                padding: 25,
                display: 'flex',
                width: Dimensions.get('window').width - 10,
              }}>
              <Layout
                style={{
                  marginVertical: 20,
                  backgroundColor: 'transparent',
                }}>
                <Text
                  style={{
                    color: '#252525',
                    marginVertical: 5,
                  }}
                  h1>
                  Enter Password For Private Key
                </Text>
                <Layout>
                  <Input
                    style={{
                      padding: 0,
                      width: '100%',
                      margin: 0,
                      border: 'none',
                    }}
                    secureTextEntry={!showPassword}
                    value={String(password)}
                    icon={() => (
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                        }}>
                        {!showPassword ? (
                          <Icon style={styles.icon} name="eye-outline" fill="#8F9BB3" />
                        ) : (
                          <Icon style={styles.icon} name="eye-off-outline" fill="#8F9BB3" />
                        )}
                      </TouchableOpacity>
                    )}
                    onChangeText={(e) => setPassword(e)}
                  />
                </Layout>
              </Layout>
              <Layout
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  width: '100%',
                  backgroundColor: 'transparent',
                }}>
                <Button
                  onPress={() => {
                    setPassword('');
                    setShowModal(false);
                  }}>
                  Cancel
                </Button>
                <Button
                  onPress={() => {
                    handleGenerateKeyPair();
                    setShowModal(false);
                  }}>
                  Generate
                </Button>
              </Layout>
            </Layout>
          </Modal>
        )}
      </Layout>
      <ScrollView>
        <Layout
          style={{
            width: Dimensions.get('window').width,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}>
          {Object.keys(unsignedTxState).length > 0 && (
            <Layout
              level="1"
              style={{
                width: '95%',
                margin: 5,
              }}>
              <Select
                label="Select Network"
                data={testNetArray}
                placeholder="Goerli"
                selectedOption={testnet}
                onSelect={setTestnet}
              />
            </Layout>
          )}
          <Layout
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              padding: 5,
            }}>
            {tx && Object.keys(unsignedTxState).length > 0 && (
              <Layout
                style={{
                  marginBottom: 10,
                  padding: 10,
                }}>
                <Card>
                  <Text appearance="hint">Transaction To Be Signed: </Text>
                  {tx && unsignedTxState && (
                    <Layout>
                      <Layout>
                        <Input label="From:" value={unsignedTxState.from} disabled />
                      </Layout>
                      <Layout>
                        <Input label="To:" value={unsignedTxState.to} disabled />
                      </Layout>
                      <Layout>
                        <Text h4>Nonce: </Text>
                        <Input
                          value={String(unsignedTxState.nonce)}
                          onChangeText={(e) => updateUnsignedTx('nonce', e)}
                        />
                      </Layout>
                      <Layout>
                        <Text h4>Gas: </Text>
                        <Input
                          value={String(unsignedTxState.gas)}
                          onChangeText={(e) => updateUnsignedTx('gas', e)}
                        />
                      </Layout>
                      <Layout>
                        <Input
                          label="Gas Price"
                          value={String(unsignedTxState.gasPrice)}
                          disabled
                        />
                      </Layout>
                      <Layout>
                        <Text h4>Value: </Text>
                        <Input
                          value={String(unsignedTxState.value)}
                          onChangeText={(e) => updateUnsignedTx('value', e)}
                        />
                      </Layout>
                      <Layout>
                        <Input label="Data" value={unsignedTxState.data} disabled />
                      </Layout>
                    </Layout>
                  )}
                </Card>
              </Layout>
            )}
            {tx && txHash !== '' && tx.rawTx !== '' && (
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
                    <Button style={[styles.signBtn, {backgroundColor: '#15348a'}]} disabled>
                      Sign Transaction
                    </Button>
                    <Button style={styles.signBtn} onPress={handleDeployTx}>
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
          setUnsignedTxState({});
          props.setRawTx('');
          props.setUnsignedTx({});
          props.setUnsignedTxHash('');
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
  deploySignedTx: PropTypes.func,
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

export default connect(mapStateToProps, {
  setUnsignedTx,
  setRawTx,
  getAuthToken,
  setUnsignedTxHash,
  deploySignedTx,
})(HomeScreen);
