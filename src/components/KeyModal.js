import React, { useState } from 'react';
import {
    Layout,
    Text,
    Button,
    Icon,
    Input,
    Spinner,
    Modal,
} from '@ui-kitten/components';
import { TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
    layout: {
        padding: 25,
        flex: 1,
        width: Dimensions.get('window').width - 10,
    },
    paswdText: {
        color: '#252525',
        marginVertical: 5,
    },
    secureText: {
        padding: 0,
        width: '100%',
        margin: 0
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
  });

const KeyModal = ({visible, handleGenerate, setVisible}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    return (
        <Modal visible={visible} backdropStyle={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <Layout
                level="3"
                style={styles.layout}>
                <Layout
                    style={{
                        marginVertical: 20,
                        backgroundColor: 'transparent',
                    }}>
                    <Text style={styles.paswdText} h1>Enter Password For Private Key</Text>
                    <Layout>
                        <Input
                            style={styles.secureText}
                            secureTextEntry={!showPassword}
                            value={String(password)}
                            icon={() => (
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                    }}>
                                    {
                                        !showPassword ? (
                                            <Icon style={styles.icon} name="eye-outline" fill="#8F9BB3" />
                                        ) : (
                                            <Icon style={styles.icon} name="eye-off-outline" fill="#8F9BB3" />
                                        )
                                    }
                                </TouchableOpacity>
                            )}
                            onChangeText={(e) => setPassword(e)}
                        />
                    </Layout>
                </Layout>
                <Layout
                    style={styles.modalStyle}>
                    <Button
                        onPress={() => {
                            setPassword('');
                            setVisible(false);
                        }}>
                        Cancel
                </Button>
                    <Button
                        onPress={() => {
                            handleGenerate(password);
                            setVisible(false);
                        }}>
                        Generate
                </Button>
                </Layout>
            </Layout>
        </Modal>
    )
}

export default KeyModal;