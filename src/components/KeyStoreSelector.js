import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {IndexPath, Layout, Select, SelectItem} from '@ui-kitten/components';
import PropTypes from 'prop-types';
import {setKs} from '../services/sign';
import {setCurrentAccount} from '../actions';

const styles = StyleSheet.create({
  container: {
    minHeight: 50,
  },
});

const KsSelect = (props) => {
  const {auth} = props;
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
  const displayValue =
    auth.accounts[selectedIndex.row] && auth.accounts[selectedIndex.row].address
      ? auth.accounts[selectedIndex.row].address
      : undefined;

  const renderOption = (f) => <SelectItem title={f.address} key={f.address} />;

  const handleSelect = (index) => {
    setSelectedIndex(index);
    props.setCurrentAccount(auth.accounts[index - 1]);
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
        {auth.accounts.map(renderOption)}
      </Select>
    </Layout>
  );
};

KsSelect.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  auth: PropTypes.object,
  setCurrentAccount: PropTypes.func,
};

function mapStateToProps({auth}) {
  return {
    auth,
  };
}

export default connect(mapStateToProps, {setCurrentAccount})(KsSelect);
