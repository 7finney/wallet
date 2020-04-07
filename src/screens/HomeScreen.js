import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout, Text, Divider} from '@ui-kitten/components';

const HomeScreen = () => (
  <Layout style={styles.container}>
    <Text category="h1">Home</Text>
    <Divider />
  </Layout>
);

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
