import axios, { AxiosRequestConfig } from "axios";
import { createMessage, returnError } from "redux-simplified";
import { createSlice, isAnyOf, isPending, isRejected } from "@reduxjs/toolkit";

import { LoginType } from "Components/Accounts/Login";
import { UserProfileSerializer } from "./types/accountsTypes";
import { createAppAsyncThunk } from "redux/utils";

export type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  user: UserProfileSerializer | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
};

export const authLogin = createAppAsyncThunk(
  "auth/login",
  async (object: LoginType, { dispatch, getState }) => {
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(object.username + ":" + object.password)}`,
      },
    };
    let url = new URL("accounts/auth/login/", process.env.REACT_APP_API_URL);
    return axios
      .post(url.toString(), null, config)
      .then((res) => {
        dispatch(createMessage({ SUCCESS: "Bem Vindo!" }));
        return res.data;
      })
      .catch((error) => {
        dispatch(returnError(error));
        throw error;
      });
  }
);

export const authLoadProfile = createAppAsyncThunk(
  "auth/my-profile",
  async (_, { dispatch, getState }) => {
    const token = getState().auth.token;
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    };
    let url = new URL(
      "accounts/userprofiles/my-profile/",
      process.env.REACT_APP_API_URL
    );
    return axios
      .get(url.toString(), config)
      .then((res) => {
        // dispatch(createMessage({ SUCCESS: "Bem Vindo!" }));
        return res.data;
      })
      .catch((error) => {
        dispatch(returnError(error));
        throw error;
      });
  }
);

export const authLogout = createAppAsyncThunk(
  "auth/logout",
  async (_, { dispatch, getState }) => {
    const token = getState().auth.token;
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    };
    let url = new URL("accounts/auth/logout/", process.env.REACT_APP_API_URL);
    return axios
      .post(url.toString(), null, config)
      .then((res) => {
        dispatch(createMessage({ SUCCESS: "Usuário deslogado!" }));
        return res.data;
      })
      .catch((error) => {
        dispatch(returnError(error));
        throw error;
      });
  }
);

export const authLogoutAll = createAppAsyncThunk(
  "auth/logoutall",
  async (_, { dispatch, getState }) => {
    const token = getState().auth.token;
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    };
    let url = new URL(
      "accounts/auth/logoutall/",
      process.env.REACT_APP_API_URL
    );
    return axios
      .post(url.toString(), null, config)
      .then((res) => {
        dispatch(createMessage({ SUCCESS: "Usuário deslogado!" }));
        return res.data;
      })
      .catch((error) => {
        dispatch(returnError(error));
        throw error;
      });
  }
);

const isAPendingAction = isPending(
  authLogin,
  authLoadProfile,
  authLogout,
  authLogoutAll
);
const isARejectedAction = isRejected(
  authLogin,
  authLoadProfile,
  authLogout,
  authLogoutAll
);
const isAnyLogout = isAnyOf(authLogout.fulfilled, authLogoutAll.fulfilled);

const initialState: AuthState = {
  token: localStorage.getItem("engenharia_token"),
  isAuthenticated: false,
  user: null,
  loading: "idle",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(authLogin.fulfilled, (state, { payload }) => {
        localStorage.removeItem("engenharia_token");
        if (payload.token) {
          localStorage.setItem("engenharia_token", payload.token);
        }
        return {
          token: payload.token,
          user: payload.user,
          isAuthenticated: true,
          loading: "succeeded",
        };
      })
      .addCase(authLoadProfile.fulfilled, (state, { payload }) => {
        return {
          ...state,
          user: payload,
          isAuthenticated: true,
          loading: "succeeded",
        };
      })
      .addMatcher(isAnyLogout, (state, { payload }) => {
        localStorage.removeItem("engenharia_token");
        return {
          ...initialState,
          token: null,
        };
      })
      .addMatcher(isAPendingAction, (state, action) => {
        return { ...state, loading: "pending" };
      })
      .addMatcher(isARejectedAction, (state, action) => {
        localStorage.removeItem("engenharia_token");
        return {
          ...initialState,
          token: null,
          loading: "failed",
        };
      });
  },
});
