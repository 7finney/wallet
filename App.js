import React from 'react';
import {ApplicationProvider} from '@ui-kitten/components';
import {mapping, light as lightTheme} from '@eva-design/eva';
import HomeScreen from './src/screens/HomeScreen';

const App: () => React$Node = () => {
  return (
    <>
      <ApplicationProvider mapping={mapping} theme={lightTheme}>
        <HomeScreen />
      </ApplicationProvider>
    </>
  );
};

export default App;
