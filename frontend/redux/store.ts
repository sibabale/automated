// [ REDUX > STORE ] #################################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
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
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import runsReducer from './slices/runs.slice';
import themeReducer from './slices/theme.slice';
import counterReducer from './slices/counter.slice';
import overviewReducer from './slices/overview.slice';
import buyTradeReducer from './slices/buy-trade.slice';
import portfolioReducer from './slices/portfolio.slice';
import profitMarginReducer from './slices/profit-margin.slice';
import debtToEquityReducer from './slices/debt-to-equity.slice';
import freeCashFlowReducer from './slices/free-cash-flow.slice';
import marginOfSafetyReducer from './slices/margin-of-safety.slice';
import returnOnEquityReducer from './slices/return-on-equity.slice';
// 1.2. END ..........................................................................................

// 1.3. PERSIST CONFIG ...............................................................................
const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    // whitelist: ['counter'], // only persist specific slices
    blacklist: ['overview', 'portfolio', 'buyTrade', 'returnOnEquity', 'freeCashFlow', 'debtToEquity', 'profitMargin', 'marginOfSafety', 'runs'], // live financial data and order state are fetched fresh, never persisted
};
// 1.3. END ..........................................................................................

// 1.4. ROOT REDUCER .................................................................................
const rootReducer = combineReducers({
    counter: counterReducer,
    theme: themeReducer,
    overview: overviewReducer,
    portfolio: portfolioReducer,
    buyTrade: buyTradeReducer,
    debtToEquity: debtToEquityReducer,
    freeCashFlow: freeCashFlowReducer,
    runs: runsReducer,
    marginOfSafety: marginOfSafetyReducer,
    profitMargin: profitMarginReducer,
    returnOnEquity: returnOnEquityReducer,
});
// 1.4. END ..........................................................................................

// 1.5. PERSISTED REDUCER ............................................................................
const persistedReducer = persistReducer(persistConfig, rootReducer);
// 1.5. END ..........................................................................................

// 1.6. STORE ........................................................................................
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
// 1.6. END ..........................................................................................

// 1.7. TYPES ........................................................................................
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
// 1.7. END ..........................................................................................

// END FILE ##########################################################################################
