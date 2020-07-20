import React, {useContext, useEffect} from 'react';
import {Layout, Text} from '@ui-kitten/components';
import styles from '../screens/HomeScreenStyle';
import {setErrorStatus} from '../actions';
import {Context} from '../configureStore';

const Error = () => {
  let interval;
  // Global State and dispatch For Actions
  const [state, dispatch] = useContext(Context);

  useEffect(() => {
    if (state.errorMsg !== '' && !interval) {
      interval = setTimeout(() => {
        dispatch(setErrorStatus(''));
        interval = null;
      }, 5000);
    }
  }, [state.errorMsg]);

  return (
    <>
      {state.errorMsg !== '' && (
        <Layout style={styles.error}>
          <Text style={{textAlign: 'center', color: '#fff', fontSize: 18}}>{state.errorMsg}</Text>
        </Layout>
      )}
    </>
  );
};

Error.propTypes = {};

export default Error;
