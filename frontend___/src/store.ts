import { ActivityCRUDAction, TouristCRUDAction } from "./actions";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
  errorReducer,
  fetchingReducer,
  messageReducer,
} from "redux-simplified";

import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    messages: messageReducer,
    error: errorReducer,
    fetching: fetchingReducer,
    activities: ActivityCRUDAction.reducer,
    tourists: TouristCRUDAction.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

// hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
