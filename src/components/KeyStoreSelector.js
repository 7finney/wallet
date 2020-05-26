import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {IndexPath, Layout, Select, SelectItem} from '@ui-kitten/components';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    minHeight: 50,
  },
});

const KsSelect = ({accounts, setAccount, setKeyStore}) => {
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
  const displayValue =
    accounts[selectedIndex.row] && accounts[selectedIndex.row].address
      ? accounts[selectedIndex.row].address
      : undefined;

  const renderOption = (f) => <SelectItem title={f.address} key={f.address} />;

  const handleSelect = (index) => {
    setSelectedIndex(index);
    setAccount(accounts[index - 1]);
    setKeyStore(index - 1)
      .then(() => {
        console.log('KeyStore set successful!');
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <Layout style={styles.container} level="1">
      <Select selectedIndex={selectedIndex} onSelect={handleSelect} value={displayValue}>
        {accounts.map(renderOption)}
      </Select>
    </Layout>
  );
};

KsSelect.propTypes = {
  accounts: PropTypes.arrayOf(PropTypes.object),
  setAccount: PropTypes.func,
  setKeyStore: PropTypes.func,
};

export default KsSelect;
