import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout, Text, Divider, Button} from '@ui-kitten/components';
import deployUnsignedTx from '../services/sign';

const HomeScreen = () => {
  return (
    // eslint-disable-next-line no-use-before-define
    <Layout style={styles.container}>
      <Text category="h1">Home</Text>
      <Divider />
      <Button onPress={deployUnsignedTx}>PRESSED TIMES</Button>
    </Layout>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
