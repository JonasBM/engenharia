import {
  ConfigCRUDAction,
  DiameterCRUDAction,
  FittingCRUDAction,
  FittingDiameterCRUDAction,
  FixtureCRUDAction,
  MaterialCRUDAction,
  MaterialConnectionCRUDAction,
  ReductionCRUDAction,
} from "api/shp";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import { UserCRUDAction, UserProfileCRUDAction } from "api/accounts";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  errorReducer,
  fetchingReducer,
  messageReducer,
} from "redux-simplified";

import { authSlice } from "api/auth";
import modalReducer from "./modal";
import shpCalcReducer from "./shp";
import storage from "redux-persist/lib/storage";


const shp = combineReducers({
  configs: ConfigCRUDAction.reducer,
  materials: MaterialCRUDAction.reducer,
  diameters: DiameterCRUDAction.reducer,
  fittings: FittingCRUDAction.reducer,
  fittingDiameters: FittingDiameterCRUDAction.reducer,
  reductions: ReductionCRUDAction.reducer,
  materialConnections: MaterialConnectionCRUDAction.reducer,
  fixtures: FixtureCRUDAction.reducer,
});

const rootReducer = combineReducers({
  messages: messageReducer,
  errors: errorReducer,
  fetching: fetchingReducer,
  auth: authSlice.reducer,
  users: UserCRUDAction.reducer,
  userprofiles: UserProfileCRUDAction.reducer,
  shp: shp,
  modal: modalReducer,
  shpCalc: shpCalcReducer,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["shpCalc"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
