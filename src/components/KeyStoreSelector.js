import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {IndexPath, Layout, Select, SelectItem} from '@ui-kitten/components';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    minHeight: 50,
  },
});

const KsSelect = ({ksfiles, setKeystore}) => {
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
  const displayValue =
    ksfiles[selectedIndex.row] && ksfiles[selectedIndex.row].name
      ? ksfiles[selectedIndex.row].name
      : undefined;

  const renderOption = (f) => <SelectItem title={f.name} key={f.name} />;

  const handleSelect = (index) => {
    setSelectedIndex(index);
    setKeystore(index);
  };

  return (
    <Layout style={styles.container} level="1">
      <Select selectedIndex={selectedIndex} onSelect={handleSelect} value={displayValue}>
        {ksfiles.map(renderOption)}
      </Select>
    </Layout>
  );
};

KsSelect.propTypes = {
  ksfiles: PropTypes.arrayOf(PropTypes.object),
  setKeystore: PropTypes.func,
};

export default KsSelect;
