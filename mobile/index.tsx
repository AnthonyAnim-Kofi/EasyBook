import 'react-native-url-polyfill/auto';
import './src/__create/polyfills';
global.Buffer = require('buffer').Buffer;

import '@expo/metro-runtime';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import { AppRegistry, LogBox } from 'react-native';
import { DeviceErrorBoundaryWrapper } from './__create/DeviceErrorBoundary';
import { initTestFlightLogger } from './__create/testflight-logger';
import App from './entrypoint';
import AnythingMenu from './src/__create/anything-menu';

type GlobalErrorUtils = {
  setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void;
};

if (__DEV__) {
  // Suppress the default dev exception overlay while our own error boundary/logger handles crashes.
  const ErrorUtils = (globalThis as typeof globalThis & { ErrorUtils?: GlobalErrorUtils }).ErrorUtils;
  ErrorUtils?.setGlobalHandler?.(() => {
    // no-op
  });
}

initTestFlightLogger();

if (__DEV__ || process.env.EXPO_PUBLIC_CREATE_ENV === 'DEVELOPMENT') {
  LogBox.ignoreAllLogs();
  LogBox.uninstall();
  AppRegistry.setWrapperComponentProvider(() => ({ children }) => {
    return (
      <>
        <DeviceErrorBoundaryWrapper>{children}</DeviceErrorBoundaryWrapper>
        <AnythingMenu />
      </>
    );
  });
}
renderRootComponent(App);
