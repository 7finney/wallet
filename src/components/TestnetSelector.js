import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {IndexPath, Layout, Select, SelectItem} from '@ui-kitten/components';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

// const testNetArray = [
//   {net: 'Ethereum Mainnet', id: 1},
//   {net: 'Goerli', id: 5},
//   {net: 'Ropsten', id: 3},
//   {net: 'Rinkeby', id: 4},
// ];
const testNetArray = ['Ethereum Mainnet', 'Goerli', 'Ropsten', 'Rinkeby'];

const networkIdList = {
  'Ethereum Mainnet': 1,
  Ropsten: 3,
  Rinkeby: 4,
  Goerli: 5,
};

const TestnetSelector = () => {
  const [testnet, setTestnet] = useState(new IndexPath(0));

  const renderOption = (t) => <SelectItem title={t} key={t} />;
  const displayValue = testNetArray[testnet.row];

  return (
    <Layout
      level="1"
      style={{
        width: '95%',
        margin: 5,
      }}>
      <Select
        label="Select Network"
        selectedIndex={testnet}
        value={displayValue}
        onSelect={setTestnet}>
        {testNetArray.map(renderOption)}
      </Select>
    </Layout>
  );
};

TestnetSelector.propTypes = {
  accounts: PropTypes.arrayOf(PropTypes.object),
  setAccount: PropTypes.func,
  setKeyStore: PropTypes.func,
};

export default connect()(TestnetSelector);
