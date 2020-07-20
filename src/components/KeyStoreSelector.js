import React, {useState, useEffect, useContext} from 'react';
import {StyleSheet} from 'react-native';
import {IndexPath, Layout, Select, SelectItem} from '@ui-kitten/components';
import {setKs} from '../services/sign';
import {setCurrentAccount} from '../actions';
import {Context} from '../configureStore';

const styles = StyleSheet.create({
  container: {
    minHeight: 50,
  },
});

const KsSelect = () => {
  // Global State and dispatch For Actions
  const [state, dispatch] = useContext(Context);
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
  const [displayValue, setDisplayValue] = useState(undefined);

  const renderOption = (f) => <SelectItem title={f.address} key={f.address} />;

  useEffect(() => {
    if (state.accounts[selectedIndex.row] && state.accounts[selectedIndex.row].address) {
      setDisplayValue(state.accounts[selectedIndex.row].address);
    } else {
      setDisplayValue(state.accounts[0].address);
    }
  }, [selectedIndex]);

  useEffect(() => {
    setSelectedIndex(new IndexPath(0));
  }, [state.accounts]);

  const handleSelect = (index) => {
    setSelectedIndex(index);
    dispatch(setCurrentAccount(state.accounts[index - 1]));
    setKs(index - 1)
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
        {state.accounts.map(renderOption)}
      </Select>
    </Layout>
  );
};

KsSelect.propTypes = {};

export default KsSelect;
