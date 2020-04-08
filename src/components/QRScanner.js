import React, {useState} from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import {Layout} from '@ui-kitten/components';

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 36,
    display: 'flex',
    backgroundColor: '#000',
  },
});

const QRScanner = ({onSuccess}) => {
  const [dismiss, setDismiss] = useState(false);

  return (
    <QRCodeScanner
      onRead={onSuccess}
      showMarker
      cameraProps={{useCamera2Api:true}}
      containerStyle={{margin: 25}}
      bottomContent={
        !dismiss && (
          <View>
            <TouchableOpacity
              onPress={() => {
                console.log('Dismiss');
                setDismiss(true);
              }}
              style={styles.buttonTouchable}>
              <View>
                <Text h3>Scan Your Transaction QR</Text>
              </View>
              <View>
                <Text style={styles.buttonText}>OK. Got it!</Text>
              </View>
            </TouchableOpacity>
          </View>
        )
      }
    />
  );
};

export default QRScanner;
