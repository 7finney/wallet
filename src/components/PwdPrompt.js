import React, {useState} from 'react';
import {Layout, Text, Button, Icon, Input, Modal} from '@ui-kitten/components';
import {TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  layout: {
    padding: 25,
    flex: 1,
    width: Dimensions.get('window').width - 10,
  },
  layoutContainer: {
    backgroundColor: 'transparent',
  },
  paswdText: {
    color: '#252525',
    marginVertical: 5,
  },
  secureText: {
    padding: 0,
    width: '100%',
    margin: 0,
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
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

const PwdPrompt = ({visible, setVisible, onSubmit}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const InputEyeIcon = (props) => (
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Icon {...props} name={!showPassword ? 'eye-off' : 'eye'} />
    </TouchableOpacity>
  );
  return (
    <Modal visible={visible} backdropStyle={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
      <Layout level="3" style={styles.layout}>
        <Layout
          style={{
            marginVertical: 20,
            backgroundColor: 'transparent',
          }}>
          <Layout style={styles.layoutContainer}>
            <Text style={styles.paswdText} h1>
              Decypher your Private Key
            </Text>
            <Input
              label="Password"
              style={styles.secureText}
              secureTextEntry={!showPassword}
              value={String(password)}
              accessoryRight={InputEyeIcon}
              onChangeText={(nextValue) => setPassword(nextValue)}
            />
          </Layout>
        </Layout>
        <Layout style={styles.buttonContainer}>
          <Button
            onPress={() => {
              onSubmit(password);
              setVisible(false);
            }}>
            Ok
          </Button>
          <Button
            onPress={() => {
              setPassword('');
              setVisible(false);
            }}>
            Cancel
          </Button>
        </Layout>
      </Layout>
    </Modal>
  );
};

PwdPrompt.propTypes = {
  visible: PropTypes.bool,
  setVisible: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default PwdPrompt;
