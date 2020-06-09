import React, {useState, useEffect} from 'react';
import {IndexPath, Layout, Select, SelectItem} from '@ui-kitten/components';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {setTestnetID} from '../actions';

const testNetArray = ['Ethereum Mainnet', 'Goerli', 'Ropsten', 'Rinkeby'];

const networkIdList = {
  'Ethereum Mainnet': 1,
  Ropsten: 3,
  Rinkeby: 4,
  Goerli: 5,
};

const TestnetSelector = (props) => {
  const [selectedTestnet, setTestnet] = useState(new IndexPath(0));

  const renderOption = (t) => <SelectItem title={t} key={t} />;
  const displayValue = testNetArray[selectedTestnet.row];

  useEffect(() => {
    const testNetName = Object.keys(networkIdList).find(
      (k) => networkIdList[k] === props.testnetID
    );
    if (testNetName) {
      setTestnet(new IndexPath(testNetArray.indexOf(testNetName)));
    } else {
      setTestnet(new IndexPath(testNetArray[0]));
    }
  }, []);

  useEffect(() => {
    const testnetName = testNetArray[selectedTestnet.row];
    const networkID = networkIdList[testnetName];
    if (networkID) {
      props.setTestnetID(networkID);
    } else {
      props.setTestnetID(1);
    }
  }, [selectedTestnet]);

  const handleSelect = (index) => {
    setTestnet(index);
  };

  return (
    <Layout
      level="1"
      style={{
        width: '95%',
        margin: 5,
      }}>
      <Select
        // label="Select Network"
        selectedIndex={selectedTestnet}
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

function mapStateToProps({comp}) {
  const {testnetID} = comp;
  return {
    testnetID,
  };
}

export default connect(mapStateToProps, {setTestnetID})(TestnetSelector);
