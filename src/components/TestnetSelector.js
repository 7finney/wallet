import React, {useState, useEffect, useContext} from 'react';
import {IndexPath, Layout, Select, SelectItem} from '@ui-kitten/components';
import {setTestnetID} from '../actions';
import {Context} from '../configureStore';

const testNetArray = ['Ethereum Mainnet', 'Goerli', 'Ropsten', 'Rinkeby'];

const networkIdList = {
  'Ethereum Mainnet': 1,
  Ropsten: 3,
  Rinkeby: 4,
  Goerli: 5,
};

const TestnetSelector = () => {
  // Global State and dispatch For Actions
  const [state, dispatch] = useContext(Context);

  const [selectedTestnet, setTestnet] = useState(new IndexPath(0));

  const renderOption = (t) => <SelectItem title={t} key={t} />;
  const displayValue = testNetArray[selectedTestnet.row];

  useEffect(() => {
    const testNetName = Object.keys(networkIdList).find(
      (k) => networkIdList[k] === state.testnetID
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
      dispatch(setTestnetID(networkID));
    } else {
      dispatch(setTestnetID(1));
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
        label="Select Network"
        selectedIndex={selectedTestnet}
        value={displayValue}
        onSelect={handleSelect}>
        {testNetArray.map(renderOption)}
      </Select>
    </Layout>
  );
};

TestnetSelector.propTypes = {};

export default TestnetSelector;
