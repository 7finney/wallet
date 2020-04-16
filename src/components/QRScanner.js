import React, {useState} from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
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
    padding: 36,
  },
});

const QRScanner = ({onSuccess}) => {
  const [dismiss, setDismiss] = useState(false);

  return (
    <QRCodeScanner
      onRead={onSuccess}
      showMarker
      fadeIn={false}
      containerStyle={{marginTop: 60, backgroundColor: '#fff'}}
      bottomContent={
        !dismiss ? (
          <View
            style={{
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => {
                setDismiss(true);
              }}
              style={styles.buttonTouchable}>
              <View>
                <Text style={styles.textBold} h3>
                  Scan Your Transaction QR
                </Text>
              </View>
              <View>
                <Text style={styles.buttonText}>OK. Got it!</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View />
        )
      }
    />
  );
};

export default QRScanner;
