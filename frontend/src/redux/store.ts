import {
  ConfigCRUDAction as SHPConfigCRUDAction,
  DiameterCRUDAction as SHPDiameterCRUDAction,
  FittingCRUDAction as SHPFittingCRUDAction,
  FittingDiameterCRUDAction as SHPFittingDiameterCRUDAction,
  FixtureCRUDAction as SHPFixtureCRUDAction,
  MaterialCRUDAction as SHPMaterialCRUDAction,
  MaterialConnectionCRUDAction as SHPMaterialConnectionCRUDAction,
  ReductionCRUDAction as SHPReductionCRUDAction,
} from "api/shp";

import {
  ConfigCRUDAction as IGCConfigCRUDAction,
  DiameterCRUDAction as IGCDiameterCRUDAction,
  FittingCRUDAction as IGCFittingCRUDAction,
  FittingDiameterCRUDAction as IGCFittingDiameterCRUDAction,
  GASCRUDAction as IGCGASCRUDAction,
  MaterialCRUDAction as IGCMaterialCRUDAction,
  MaterialConnectionCRUDAction as IGCMaterialConnectionCRUDAction,
  ReductionCRUDAction as IGCReductionCRUDAction,
} from "api/igc";

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
import igcCalcReducer from "./igc";
import storage from "redux-persist/lib/storage";


const shp = combineReducers({
  configs: SHPConfigCRUDAction.reducer,
  materials: SHPMaterialCRUDAction.reducer,
  diameters: SHPDiameterCRUDAction.reducer,
  fittings: SHPFittingCRUDAction.reducer,
  fittingDiameters: SHPFittingDiameterCRUDAction.reducer,
  reductions: SHPReductionCRUDAction.reducer,
  materialConnections: SHPMaterialConnectionCRUDAction.reducer,
  fixtures: SHPFixtureCRUDAction.reducer,
});

const igc = combineReducers({
  configs: IGCConfigCRUDAction.reducer,
  materials: IGCMaterialCRUDAction.reducer,
  diameters: IGCDiameterCRUDAction.reducer,
  fittings: IGCFittingCRUDAction.reducer,
  fittingDiameters: IGCFittingDiameterCRUDAction.reducer,
  reductions: IGCReductionCRUDAction.reducer,
  materialConnections: IGCMaterialConnectionCRUDAction.reducer,
  gases: IGCGASCRUDAction.reducer,
});

const rootReducer = combineReducers({
  messages: messageReducer,
  errors: errorReducer,
  fetching: fetchingReducer,
  auth: authSlice.reducer,
  users: UserCRUDAction.reducer,
  userprofiles: UserProfileCRUDAction.reducer,
  modal: modalReducer,
  shp: shp,
  shpCalc: shpCalcReducer,
  igc: igc,
  igcCalc: igcCalcReducer,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["shpCalc", "igcCalc"],
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
