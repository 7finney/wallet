import React from 'react';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {mapping, light as lightTheme} from '@eva-design/eva';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {StatusBar} from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import Store from './src/configureStore';

const App = () => {
  return (
    <Store>
      <>
        <StatusBar backgroundColor="#2d4bf7" />
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider mapping={mapping} theme={lightTheme}>
          <HomeScreen />
        </ApplicationProvider>
      </>
    </Store>
  );
};

export default App;
