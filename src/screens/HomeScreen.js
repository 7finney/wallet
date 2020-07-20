import React, {useState, useEffect, useRef, useContext} from 'react';
import {Dimensions, TouchableOpacity, ScrollView, ToastAndroid} from 'react-native';
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

const HomeScreen = () => {
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
    dispatch(setLoaderStatus(true));
    dispatch(getAuthToken());
    ToastAndroid.showWithGravity(
      'Looking for saved Keystores',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
    dispatch(setAccounts());
  }, []);

  useEffect(() => {
    if (state.accounts.length > 0) {
      dispatch(setCurrentAccount(state.accounts[0]));
      setKs(0);
      dispatch(setLoaderStatus(false));
    }
  }, [state.accounts]);

  // ComponentDidUpdate for state.unsignedTxHash. Triggers on tx Hash change
  useEffect(() => {
    if (state.unsignedTxHash !== undefined && state.unsignedTxHash !== '' && state.token !== '') {
      dispatch(setLoaderStatus(true));
      getUnsignedTx(state.unsignedTxHash, state.token)
        .then((unsignedTX) => {
          if (unsignedTX) {
            dispatch(setUnsignedTx(JSON.parse(unsignedTX)));
          } else {
            dispatch(setLoaderStatus(false));
            dispatch(setErrorStatus('Invalid Transaction'));
          }
        })
        .catch(() => {
          dispatch(setLoaderStatus(false));
          dispatch(setErrorStatus('Error Getting Transaction'));
        });
    }
  }, [state.unsignedTxHash]);

  // ComponentDidUpdate for txReceipt. Triggers on tx.txReceipt change
  useEffect(() => {
    if (state.txReceipt.Error) {
      const msg = state.txReceipt.Error.split('=').slice(-1)[0];
      dispatch(setErrorStatus(msg));
    }
    if (state.txReceipt.Status) {
      dispatch(setErrorStatus(state.txReceipt.Status));
    }
    dispatch(setLoaderStatus(false));
  }, [state.txReceipt]);

  const prevAuth = state ? usePrevious({state}) : null;
  // ComponentDidUpdate for state. Triggers on auth change
  useEffect(() => {
    if (
      state &&
      state.token !== '' &&
      state.token !== undefined &&
      prevAuth.state.token !== state.token
    ) {
      dispatch(setLoaderStatus(false));
      ToastAndroid.showWithGravity('AuthToken Generated', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    } else if (state.token === '' || state.token === null) {
      dispatch(setLoaderStatus(false));
      ToastAndroid.showWithGravity(
        'AuthToken Generation Error. Please try again',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
    }
  }, [state]);

  // componentDidUpdate
  useEffect(() => {
    if (Object.keys(unsignedTxState).length === 0 && Object.keys(state.unsignedTx).length > 0) {
      dispatch(setLoaderStatus(false));
      setUnsignedTxState(state.unsignedTx);
    }
  });

  const handleSignTx = async (password) => {
    dispatch(setErrorStatus(''));
    if (!state.account) {
      dispatch(setErrorStatus('No Account selected'));
    } else if (state.account !== '') {
      // For signing With private key.
      // Not to be confused with deploying unsigned Tx
      const {transaction, rawTransaction, Error} = await signTransaction(
        password,
        state.unsignedTx,
        state.testnetID
      );
      if (Error) {
        dispatch(setErrorStatus(Error.message));
      } else {
        setTxHash(transaction.hash);
        dispatch(setRawTx(rawTransaction));
      }
    }
  };

  const updateUnsignedTx = (key, value) => {
    setTxHash('');
    dispatch(setRawTx(''));
    // Deep Copying object
    const newTx = JSON.parse(JSON.stringify(unsignedTxState));
    newTx[key] = value;
    setUnsignedTxState(newTx);
  };

  const handleScanner = (e) => {
    setScan(false);
    dispatch(setErrorStatus(''));
    try {
      dispatch(setLoaderStatus(true));
      dispatch(setUnsignedTxHash(e.data));
    } catch (err) {
      dispatch(setErrorStatus('Invalid Transaction'));
      setTimeout(() => dispatch(setErrorStatus('')), 5000);
    }
  };

  const handleDeployTx = () => {
    if (state.rawTx !== '' && state.token !== '') {
      dispatch(setErrorStatus(''));
      dispatch(setLoaderStatus(true));
      dispatch(deploySignedTx(state.rawTx, state.testnetID, state.token));
    } else {
      dispatch(setErrorStatus('Maybe Transaction not signed or no auth token generated'));
    }
  };

  const loadPvtKey = async (password) => {
    dispatch(setLoaderStatus(true));
    const keystore = JSON.parse(await getFromAsyncStorage('keystore'));
    ToastAndroid.showWithGravity(
      'Unlocking private key with password!',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
    try {
      const pk = getPvtKey(keystore, password);
      setPvtKey(pk);
      dispatch(setErrorStatus(''));
      ToastAndroid.showWithGravity('Private key loaded!', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    } catch (err) {
      dispatch(setErrorStatus(err.message));
    }
    dispatch(setLoaderStatus(false));
  };

  const handleGenerateKeyPair = async (password) => {
    dispatch(setLoaderStatus(true));
    createKeyPair(password)
      .then(async () => {
        // loadPvtKey(password);
        dispatch(setAccounts());
        dispatch(setLoaderStatus(false));
      })
      .catch((e) => {
        dispatch(setLoaderStatus(false));
        dispatch(setErrorStatus('Error Generating Private Key: ', e.message));
      });
  };

  const handleDeleteKeyStore = async (password) => {
    dispatch(setLoaderStatus(true));
    try {
      await deleteKeyPair(password);
      dispatch(setAccounts());
      // dispatch(setCurrentAccount(state.accounts[0]));
    } catch (e) {
      dispatch(setErrorStatus('Something went wrong'));
    }
    dispatch(setLoaderStatus(false));
  };

  const saveKeystore = async () => {
    const keystore = JSON.parse(await getFromAsyncStorage('keystore'));
    const path = `${RNFS.DocumentDirectoryPath}/${keystore.address}.json`;
    RNFS.writeFile(path, JSON.stringify(keystore), 'utf8')
      .then(() => {
        ToastAndroid.showWithGravity('Keystore saved!', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        dispatch(setAccounts());
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
        {state.account && (
          <Input
            label="Public Key"
            placeholder="Your Public key will appear here!"
            value={state.account.address}
            disabled
          />
        )}
        {/* Keystore files selector */}
        {state.accounts.length > 0 && <KsSelect />}
        <Layout>
          {pvtKey.length <= 0 && (
            <Layout>
              <Button onPress={() => setCreateModal(true)}>Generate Account Key/Pair</Button>
            </Layout>
          )}
          {state.account && Object.keys(state.account).length > 0 && (
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
        {state.account && Object.keys(state.account).length > 0 && showModal && (
          <PubKeyModal
            address={state.account.address}
            visible={showModal}
            setVisible={setShowModal}
            setError={() => dispatch(setErrorStatus())}
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
            {state && Object.keys(unsignedTxState).length > 0 && (
              <Layout
                style={{
                  marginBottom: 10,
                  padding: 10,
                }}>
                <Card>
                  <Text appearance="hint">Transaction To Be Signed: </Text>
                  {state && unsignedTxState && (
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
            {state && state.rawTx.length > 0 && (
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
                  {state.rawTx.length > 0 && (
                    <Layout>
                      <Text appearance="hint">Raw Transaction:</Text>
                      <Text>{state.rawTx}</Text>
                    </Layout>
                  )}
                </Card>
              </Layout>
            )}
            {state && Object.keys(state.unsignedTx).length > 0 && (
              <Layout>
                {state.rawTx.length === 0 ? (
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
          dispatch(setErrorStatus(''));
          dispatch(setLoaderStatus(false));
          setTxHash('');
          setUnsignedTxState({});
          dispatch(setRawTx(''));
          dispatch(setUnsignedTx({}));
          dispatch(setUnsignedTxHash(''));
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
HomeScreen.propTypes = {};

export default HomeScreen;
