import React from 'react';
import {Layout, Spinner} from '@ui-kitten/components';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

const Loader = (props) => {
  const {comp} = props;
  return (
    <>
      {comp.loader && (
        <Layout
          style={{
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 100,
            elevation: 5,
            marginTop: 20,
            position: 'absolute',
            top: 50,
          }}>
          <Spinner size="large" />
        </Layout>
      )}
    </>
  );
};

Loader.propTypes = {
	// eslint-disable-next-line react/forbid-prop-types
  comp: PropTypes.any,
};

function mapStateToProps({comp}) {
  return {
    comp,
  };
}

export default connect(mapStateToProps)(Loader);
