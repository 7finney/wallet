import React, {useState, useEffect, useRef} from 'react';
import {Dimensions, TouchableOpacity, ScrollView, ToastAndroid} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Layout, Text, Button, Card, Icon, Input, Spinner, Select} from '@ui-kitten/components';
import {deployUnsignedTx, createKeyPair, getPvtKey} from '../services/sign';
import {setUnsignedTx, setRawTx, getAuthToken, setUnsignedTxHash, deploySignedTx} from '../actions';
import {getUnsignedTx, setToAsyncStorage, getFromAsyncStorage} from '../actions/utils';

import QRScanner from '../components/QRScanner';
import KeyModal from '../components/KeyModal';
import PubKeyModal from '../components/PubKeyModal';
import KsSelect from '../components/KeyStoreSelector';
import styles from './HomeScreenStyle';

const RNFS = require('react-native-fs');

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
  const [createModal, setCreateModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [scan, setScan] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [ksfiles, setKsFiles] = useState([]);

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
    })();
  }, []);

  const isJSONfile = (n) => {
    if (n.split('.').pop() === 'json') {
      return true;
    }
    return false;
  };

  // First read keystore files from DocumentDirectory
  useEffect(() => {
    ToastAndroid.showWithGravity(
      'Looking for saved Keystores',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
    RNFS.readDir(RNFS.DocumentDirectoryPath)
      .then((results) => {
        const files = results.filter((result) => result.isFile() && isJSONfile(result.name));
        setKsFiles(files);
      })
      .catch((err) => {
        throw err;
      });
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
    setTxHash('');
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

  const loadPvtKey = async (password) => {
    const keystore = JSON.parse(await getFromAsyncStorage('keystore'));
    const pk = getPvtKey(keystore, password);
    if (pk) {
      setPvtKey(pk);
      setError('');
      ToastAndroid.showWithGravity('Private key loaded!', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    } else {
      setError('No Keystore Found');
    }
    setShowLoader(false);
  };

  const handleGenerateKeyPair = async (password) => {
    setShowLoader(true);
    createKeyPair(password)
      .then(async () => {
        loadPvtKey(password);
      })
      .catch((e) => {
        setError('Error Generating Private Key: ', e.message);
      });
  };

  const handleDeleteKeyStore = async () => {
    const keystore = JSON.parse(await getFromAsyncStorage('keystore'));
    const path = `${RNFS.DocumentDirectoryPath}/${keystore.address}.json`;
    RNFS.unlink(path)
      .then(() => {
        setPvtKey('');
        setError('Private Key Deleted Successfully');
      })
      .catch((err) => {
        console.error(err.message);
        setError('Unable To delete Keystore');
      });
  };

  const saveKeystore = async () => {
    const keystore = JSON.parse(await getFromAsyncStorage('keystore'));
    const path = `${RNFS.DocumentDirectoryPath}/${keystore.address}.json`;
    RNFS.writeFile(path, JSON.stringify(keystore), 'utf8')
      .then(() => {
        ToastAndroid.showWithGravity('Keystore saved!', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
      })
      .catch((err) => {
        ToastAndroid.showWithGravity(err.message, ToastAndroid.LONG, ToastAndroid.BOTTOM);
      });
  };

  const setKeystore = (index) => {
    setShowLoader(true);
    const p = ksfiles[index.row].path;
    ToastAndroid.showWithGravity(
      'Loading key from file...',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
    RNFS.readFile(p, 'utf8')
      .then(async (keyObject) => {
        await setToAsyncStorage('keystore', keyObject);
        loadPvtKey('');
      })
      .catch((e) => {
        throw e;
      });
  };

  return (
    <Layout style={styles.container}>
      <Layout style={styles.homeHeader}>
        <Text style={styles.homeHeaderText} category="h1">
          Wallet
        </Text>
      </Layout>
      {showLoader && (
        <Layout style={styles.spinner}>
          <Spinner size="large" />
        </Layout>
      )}
      {error !== '' && (
        <Layout style={styles.error}>
          <Text style={{textAlign: 'center', color: '#fff', fontSize: 18}}>{error}</Text>
        </Layout>
      )}
      <Layout style={styles.keyActionContainerLayout}>
        {/* we should have a list of available keys */}
        <Input
          label="Private Key"
          placeholder="Your Private key will appear here!"
          value={pvtKey}
          disabled
        />
        {/* TODO: read keystore files from Home component */}
        {ksfiles.length > 0 && <KsSelect ksfiles={ksfiles} setKeystore={setKeystore} />}
        <Layout>
          {pvtKey.length <= 0 && (
            <Layout>
              <Button onPress={() => setCreateModal(true)}>Generate Account Key/Pair</Button>
            </Layout>
          )}
          {pvtKey.length > 0 && (
            <Layout>
              <Button onPress={() => setShowModal(true)}>Show Public Key</Button>
              <Button onPress={handleDeleteKeyStore}>Delete Current Account</Button>
            </Layout>
          )}
          {pvtKey.length > 0 && (
            <Layout>
              <Button onPress={() => saveKeystore()}>Save keystore</Button>
            </Layout>
          )}
        </Layout>
        {createModal && (
          <KeyModal
            visible={createModal}
            setVisible={setCreateModal}
            handleGenerate={handleGenerateKeyPair}
          />
        )}
        {showModal && (
          <PubKeyModal visible={showModal} setVisible={setShowModal} setError={setError} />
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
        </Layout>
      </ScrollView>
      {scan && (
        <Layout
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}>
          <QRScanner onSuccess={handleScanner} />
        </Layout>
      )}
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
