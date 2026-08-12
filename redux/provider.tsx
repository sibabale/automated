'use client';

// [ REDUX > PROVIDER ] ############################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { persistor, store } from '../redux/store';
// 1.2. END ........................................................................................

// 1.3. TYPES ......................................................................................
interface IReduxProvider {
    children: React.ReactNode;
}
// 1.3. END ........................................................................................

// 1.4. COMPONENT ..................................................................................

const ReduxProvider: React.FC<IReduxProvider> = ({ children }) => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    );
};

// 1.4. END ........................................................................................

export default ReduxProvider;

// END FILE ########################################################################################
