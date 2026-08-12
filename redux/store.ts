// [ REDUX > STORE ] ###############################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
    FLUSH,
    PAUSE,
    PERSIST,
    persistReducer,
    persistStore,
    PURGE,
    REGISTER,
    REHYDRATE,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import counterReducer from './slices/counter.slice';
// 1.2. END ........................................................................................

// 1.3. PERSIST CONFIG .............................................................................
const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    // whitelist: ['counter'], // only persist specific slices
    // blacklist: [],          // exclude specific slices
};
// 1.3. END ........................................................................................

// 1.4. ROOT REDUCER ...............................................................................
const rootReducer = combineReducers({
    counter: counterReducer,
});
// 1.4. END ........................................................................................

// 1.5. PERSISTED REDUCER ..........................................................................
const persistedReducer = persistReducer(persistConfig, rootReducer);
// 1.5. END ........................................................................................

// 1.6. STORE ......................................................................................
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);
// 1.6. END ........................................................................................

// 1.7. TYPES ......................................................................................
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
// 1.7. END ........................................................................................

// END FILE ########################################################################################
