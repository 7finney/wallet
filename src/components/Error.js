import React, {useEffect} from 'react';
import {Layout, Text} from '@ui-kitten/components';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import styles from '../screens/HomeScreenStyle';
import {setErrorStatus} from '../actions';

const ErrorView = (props) => {
  const {comp} = props;
  let interval;

  useEffect(() => {
    if (comp.errorMsg !== '' && !interval) {
      interval = setTimeout(() => {
        props.setErrorStatus('');
        interval = null;
      }, 5000);
    }
  }, [comp.errorMsg]);

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

ErrorView.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  comp: PropTypes.any,
  setErrorStatus: PropTypes.func,
};

function mapStateToProps({comp}) {
  return {
    comp,
  };
}

export default connect(mapStateToProps, {setErrorStatus})(ErrorView);
