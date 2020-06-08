import React, {useState, useEffect} from 'react';
import {IndexPath, Layout, Select, SelectItem} from '@ui-kitten/components';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {setTestnetID} from '../actions';

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

const TestnetSelector = (props) => {
  const [testnet, setTestnet] = useState(new IndexPath(0));

  const renderOption = (t) => <SelectItem title={t} key={t} />;
  const displayValue = testNetArray[testnet.row];

  useEffect(() => {
    const testNetName = Object.keys(networkIdList).find(
      (k) => networkIdList[k] === props.testnetID
    );
    setTestnet(testNetArray.indexOf(testNetName));
  }, []);

  const handleSelect = (index) => {
    setTestnet(index);
    props.setTestnetID(networkIdList[testnet]);
  };

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
        onSelect={handleSelect}>
        {testNetArray.map(renderOption)}
      </Select>
    </Layout>
  );
};

TestnetSelector.propTypes = {
  testnetID: PropTypes.number,
  setTestnetID: PropTypes.func,
};

function mapStateToProps({testnetID}) {
  return {
    testnetID,
  };
}

export default connect(mapStateToProps, {setTestnetID})(TestnetSelector);
