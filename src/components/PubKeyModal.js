import React, {useState, useEffect} from 'react';
import {Layout, Text, Button, Input, Modal} from '@ui-kitten/components';
import {StyleSheet, Dimensions, ToastAndroid} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {getFromAsyncStorage} from '../actions/utils';

const styles = StyleSheet.create({
  layout: {
    padding: 25,
    flex: 1,
    width: Dimensions.get('window').width - 10,
  },
  insecureText: {
    padding: 0,
    margin: 0,
    width: '100%',
  },
  textBold: {
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
    textAlign: 'center',
  },
  buttonTouchable: {
    padding: 40,
  },
  pubKeyLayout: {
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
  displayCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const PubKeyModal = ({visible, setVisible, setError}) => {
  const [pubKey, setPubKey] = useState('');
  // ComponentDidMount
  useEffect(() => {
    ToastAndroid.showWithGravity('Getting Public Key', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    (async function () {
      const keystore = JSON.parse(await getFromAsyncStorage('keystore'));
      if (keystore) {
        setPubKey(`0x${keystore.address}`);
        console.log(`0x${keystore.address}`);
        setError('');
      } else {
        setError('Error getting Public Key for given keystore');
      }
    })();
  }, []);
  return (
    <Modal visible={visible} backdropStyle={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
      <Layout level="3" style={styles.layout}>
        <Layout style={[styles.pubKeyLayout, styles.displayCenter]}>
          <Text style={styles.paswdText} h1>
            Public Key
          </Text>
          {pubKey.length > 0 && (
            <Layout>
              <Input style={styles.insecureText} disabled value={pubKey} />
              <Layout style={styles.displayCenter}>
                <QRCode size={270} value={pubKey} quietZone={5} />
              </Layout>
            </Layout>
          )}
        </Layout>
        <Layout style={styles.modalStyle}>
          <Button
            onPress={() => {
              setPubKey('');
              setVisible(false);
            }}>
            Ok
          </Button>
        </Layout>
      </Layout>
    </Modal>
  );
};

export default PubKeyModal;
