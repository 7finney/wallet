import React, {useContext} from 'react';
import {Layout, Spinner} from '@ui-kitten/components';
import {Context} from '../configureStore';

const Loader = () => {
  // Global State and dispatch For Actions
  const [state] = useContext(Context);
  return (
    <>
      {state.loader && (
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

Loader.propTypes = {};

export default Loader;
