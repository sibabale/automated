// [ REDUX > HOOKS ] ###############################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { useDispatch, useSelector } from 'react-redux';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import type { AppDispatch, RootState } from './store';
// 1.2. END ........................................................................................

// 1.3. TYPED HOOKS ................................................................................

// Use these throughout the app instead of plain `useDispatch` and `useSelector`
// so that TypeScript knows the full store shape and dispatch signature.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// 1.3. END ........................................................................................

// END FILE ########################################################################################
