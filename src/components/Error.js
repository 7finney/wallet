import React from 'react';
import {Layout, Text} from '@ui-kitten/components';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import styles from '../screens/HomeScreenStyle';

const Error = (props) => {
  const {comp} = props;
  return (
    <>
      {comp.errorMsg !== '' && (
        <Layout style={styles.error}>
          <Text style={{textAlign: 'center', color: '#fff', fontSize: 18}}>{comp.errorMsg}</Text>
        </Layout>
      )}
    </>
  );
};

Error.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  comp: PropTypes.any,
};

function mapStateToProps({comp}) {
  return {
    comp,
  };
}

export default connect(mapStateToProps)(Error);
