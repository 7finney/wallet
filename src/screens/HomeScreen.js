import React, {useState, useEffect, useRef, useContext} from 'react';
import {Dimensions, TouchableOpacity, ScrollView, ToastAndroid} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Layout, Text, Button, Card, Icon, Input} from '@ui-kitten/components';
import {Context} from '../configureStore';
import {signTransaction, createKeyPair, getPvtKey, deleteKeyPair, setKs} from '../services/sign';
import {
  setUnsignedTx,
  setRawTx,
  getAuthToken,
  setUnsignedTxHash,
  deploySignedTx,
  setLoaderStatus,
  setErrorStatus,
  setAccounts,
  setCurrentAccount,
} from '../actions';
import {getUnsignedTx, getFromAsyncStorage} from '../actions/utils';
import Loader from '../components/Loader';
import QRScanner from '../components/QRScanner';
import KeyModal from '../components/KeyModal';
import PubKeyModal from '../components/PubKeyModal';
import KsSelect from '../components/KeyStoreSelector';
import PwdPrompt from '../components/PwdPrompt';
import styles from './HomeScreenStyle';
import Error from '../components/Error';
import TestnetSelector from '../components/TestnetSelector';

const RNFS = require('react-native-fs');

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const HomeScreen = (props) => {
  const {tx, auth, comp} = props;

  // Global State and dispatch For Actions
  const [state, dispatch] = useContext(Context);

  // Component State
  const [txHash, setTxHash] = useState('');
  const [unsignedTxState, setUnsignedTxState] = useState({});
  const [pvtKey, setPvtKey] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [signModal, setSignModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scan, setScan] = useState(false);
  const [showPwdPrompt, setShowPwdPrompt] = useState(false);

  // ComponentDidMount
  useEffect(() => {
    ToastAndroid.showWithGravity('Fetching AuthToken', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    props.setLoaderStatus(true);
    dispatch(getAuthToken());
    ToastAndroid.showWithGravity(
      'Looking for saved Keystores',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
    props.setAccounts();
  }, []);

  useEffect(() => {
    if (auth.accounts.length > 0) {
      props.setCurrentAccount(auth.accounts[0]);
      setKs(0);
      props.setLoaderStatus(false);
    }
  }, [auth.accounts]);

  // ComponentDidUpdate for tx.unsignedTxHash. Triggers on tx Hash change
  useEffect(() => {
    if (tx.unsignedTxHash !== undefined && tx.unsignedTxHash !== '' && auth.token !== '') {
      props.setLoaderStatus(true);
      getUnsignedTx(tx.unsignedTxHash, auth.token)
        .then((unsignedTX) => {
          if (unsignedTX) {
            dispatch(setUnsignedTx(JSON.parse(unsignedTX)));
          } else {
            props.setLoaderStatus(false);
            props.setErrorStatus('Invalid Transaction');
          }
        })
        .catch(() => {
          props.setLoaderStatus(false);
          props.setErrorStatus('Error Getting Transaction');
        });
    }
  }, [tx.unsignedTxHash]);

  // ComponentDidUpdate for txReceipt. Triggers on tx.txReceipt change
  useEffect(() => {
    if (tx.txReceipt.Error) {
      const msg = tx.txReceipt.Error.split('=').slice(-1)[0];
      props.setErrorStatus(msg);
    }
    if (tx.txReceipt.Status) {
      props.setErrorStatus(tx.txReceipt.Status);
    }
    props.setLoaderStatus(false);
  }, [tx.txReceipt]);

  const prevAuth = auth ? usePrevious({auth}) : null;
  // ComponentDidUpdate for auth. Triggers on auth change
  useEffect(() => {
    if (
      auth &&
      auth.token !== '' &&
      auth.token !== undefined &&
      prevAuth.auth.token !== auth.token
    ) {
      props.setLoaderStatus(false);
      ToastAndroid.showWithGravity('AuthToken Generated', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    } else if (auth.token === '' || auth.token === null) {
      props.setLoaderStatus(false);
      ToastAndroid.showWithGravity(
        'AuthToken Generation Error. Please try again',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
    }
  }, [auth]);

  // componentDidUpdate
  useEffect(() => {
    if (Object.keys(unsignedTxState).length === 0 && Object.keys(tx.unsignedTx).length > 0) {
      props.setLoaderStatus(false);
      setUnsignedTxState(tx.unsignedTx);
    }
  });

  const handleSignTx = async (password) => {
    props.setErrorStatus('');
    if (!auth.account) {
      props.setErrorStatus('No Account selected');
    } else if (auth.account !== '') {
      // For signing With private key.
      // Not to be confused with deploying unsigned Tx
      const {transaction, rawTransaction, Error} = await signTransaction(
        password,
        tx.unsignedTx,
        comp.testnetID
      );
      if (Error) {
        props.setErrorStatus(Error.message);
      } else {
        setTxHash(transaction.hash);
        props.setRawTx(rawTransaction);
      }
    }
  };

  const updateUnsignedTx = (key, value) => {
    setTxHash('');
    props.setRawTx('');
    // Deep Copying object
    const newTx = JSON.parse(JSON.stringify(unsignedTxState));
    newTx[key] = value;
    setUnsignedTxState(newTx);
  };

  const handleScanner = (e) => {
    setScan(false);
    props.setErrorStatus('');
    try {
      props.setLoaderStatus(true);
      props.setUnsignedTxHash(e.data);
    } catch (err) {
      props.setErrorStatus('Invalid Transaction');
      setTimeout(() => props.setErrorStatus(''), 5000);
    }
  };

  const handleDeployTx = () => {
    if (tx.rawTx !== '' && auth.token !== '') {
      props.setErrorStatus('');
      props.setLoaderStatus(true);
      props.deploySignedTx(tx.rawTx, comp.testnetID, auth.token);
    } else {
      props.setErrorStatus('Maybe Transaction not signed or no auth token generated');
    }
  };

  const loadPvtKey = async (password) => {
    props.setLoaderStatus(true);
    const keystore = JSON.parse(await getFromAsyncStorage('keystore'));
    ToastAndroid.showWithGravity(
      'Unlocking private key with password!',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
    try {
      const pk = getPvtKey(keystore, password);
      setPvtKey(pk);
      props.setErrorStatus('');
      ToastAndroid.showWithGravity('Private key loaded!', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    } catch (err) {
      props.setErrorStatus(err.message);
    }
    props.setLoaderStatus(false);
  };

  const handleGenerateKeyPair = async (password) => {
    props.setLoaderStatus(true);
    createKeyPair(password)
      .then(async () => {
        // loadPvtKey(password);
        props.setAccounts();
        props.setLoaderStatus(false);
      })
      .catch((e) => {
        props.setLoaderStatus(false);
        props.setErrorStatus('Error Generating Private Key: ', e.message);
      });
  };

  const handleDeleteKeyStore = async (password) => {
    props.setLoaderStatus(true);
    try {
      await deleteKeyPair(password);
      props.setAccounts();
      // props.setCurrentAccount(auth.accounts[0]);
    } catch (e) {
      props.setErrorStatus('Something went wrong');
    }
    props.setLoaderStatus(false);
  };

  const saveKeystore = async () => {
    const keystore = JSON.parse(await getFromAsyncStorage('keystore'));
    const path = `${RNFS.DocumentDirectoryPath}/${keystore.address}.json`;
    RNFS.writeFile(path, JSON.stringify(keystore), 'utf8')
      .then(() => {
        ToastAndroid.showWithGravity('Keystore saved!', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        props.setAccounts();
      })
      .catch((err) => {
        ToastAndroid.showWithGravity(err.message, ToastAndroid.LONG, ToastAndroid.BOTTOM);
      });
  };

  const handleUnlock = (password) => {
    loadPvtKey(password);
  };

  return (
    <Layout style={styles.container}>
      <Layout style={styles.homeHeader}>
        <Text style={styles.homeHeaderText} category="h1">
          Wallet
        </Text>
      </Layout>
      <Loader />
      <Error />
      <Layout style={styles.keyActionContainerLayout}>
        {/* we should have a list of available keys */}
        {auth.account && (
          <Input
            label="Public Key"
            placeholder="Your Public key will appear here!"
            value={auth.account.address}
            disabled
          />
        )}
        {/* Keystore files selector */}
        {auth.accounts.length > 0 && <KsSelect />}
        <Layout>
          {pvtKey.length <= 0 && (
            <Layout>
              <Button onPress={() => setCreateModal(true)}>Generate Account Key/Pair</Button>
            </Layout>
          )}
          {auth.account && Object.keys(auth.account).length > 0 && (
            <Layout>
              <Button onPress={() => setShowModal(true)}>Show Public Key</Button>
              <Button onPress={() => setDeleteModal(true)}>Delete Current Account</Button>
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
            handleOk={handleGenerateKeyPair}
            okBtnTxt="Generate"
          />
        )}
        {deleteModal && (
          <KeyModal
            visible={deleteModal}
            setVisible={setDeleteModal}
            handleOk={handleDeleteKeyStore}
            okBtnTxt="Delete"
          />
        )}
        {signModal && (
          <KeyModal
            visible={signModal}
            setVisible={setSignModal}
            handleOk={handleSignTx}
            okBtnTxt="Sign"
          />
        )}
        {auth.account && Object.keys(auth.account).length > 0 && showModal && (
          <PubKeyModal
            address={auth.account.address}
            visible={showModal}
            setVisible={setShowModal}
            setError={props.setErrorStatus}
          />
        )}
        {showPwdPrompt && (
          <PwdPrompt
            visible={showPwdPrompt}
            setVisible={setShowPwdPrompt}
            onSubmit={handleUnlock}
          />
        )}
      </Layout>
      <ScrollView>
        <Layout
          style={{
            width: Dimensions.get('window').width,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}>
          {Object.keys(unsignedTxState).length > 0 && <TestnetSelector />}
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
            {tx && tx.rawTx.length > 0 && (
              <Layout
                style={{
                  marginBottom: 10,
                  padding: 10,
                }}>
                <Card>
                  {txHash && (
                    <Layout>
                      <Text appearance="hint">Transaction Hash:</Text>
                      <Text>{txHash}</Text>
                    </Layout>
                  )}
                  {tx.rawTx.length > 0 && (
                    <Layout>
                      <Text appearance="hint">Raw Transaction:</Text>
                      <Text>{tx.rawTx}</Text>
                    </Layout>
                  )}
                </Card>
              </Layout>
            )}
            {tx && Object.keys(tx.unsignedTx).length > 0 && (
              <Layout>
                {tx.rawTx.length === 0 ? (
                  <Layout>
                    <Button style={styles.signBtn} onPress={() => setSignModal(true)}>
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
          props.setErrorStatus('');
          props.setLoaderStatus(false);
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
  setLoaderStatus: PropTypes.func,
  setErrorStatus: PropTypes.func,
  setAccounts: PropTypes.func,
  setCurrentAccount: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  auth: PropTypes.any,
  // eslint-disable-next-line react/forbid-prop-types
  tx: PropTypes.any,
  // eslint-disable-next-line react/forbid-prop-types
  comp: PropTypes.any,
};

const mapStateToProps = ({tx, auth, comp}) => {
  return {
    tx,
    auth,
    comp,
  };
};

export default connect(mapStateToProps, {
  setRawTx,
  setUnsignedTxHash,
  deploySignedTx,
  setLoaderStatus,
  setErrorStatus,
  setAccounts,
  setCurrentAccount,
})(HomeScreen);
