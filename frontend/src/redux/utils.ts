import { AppDispatch, RootState } from "./store";
import {
  AsyncThunk,
  AsyncThunkOptions,
  AsyncThunkPayloadCreator,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const createAppAsyncThunk = <Returned, ThunkArg = void>(
  typePrefix: string,
  payloadCreator: AsyncThunkPayloadCreator<
    Returned,
    ThunkArg,
    { state: RootState }
  >,
  options?: AsyncThunkOptions<ThunkArg, { state: RootState }>
): AsyncThunk<Returned, ThunkArg, { state: RootState }> => {
  return createAsyncThunk(typePrefix, payloadCreator, options);
};
