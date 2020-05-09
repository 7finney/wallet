/**
 * @file App Root File
 * @author Ayan Banerjee
 * @Organization Math & Cody
 */

import { AppRegistry, YellowBox } from 'react-native';
import './shim';
import App from './App';
import { name as appName } from './app.json';

// TODO to be removed
YellowBox.ignoreWarnings(['Remote debugger']);

AppRegistry.registerComponent(appName, () => App);
