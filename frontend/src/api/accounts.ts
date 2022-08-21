import { CRUDAction, createMessage, returnError } from "redux-simplified";
import {
  PasswordSerializer,
  UserProfileSerializer,
  UserSerializer,
} from "./types/accountsTypes";
import axios, { AxiosRequestConfig } from "axios";

import { createAppAsyncThunk } from "redux/utils";


export const UserProfileCRUDAction = new CRUDAction<UserProfileSerializer>(
  "userprofiles",
  new URL("accounts/userprofiles/", import.meta.env.VITE_APP_API_URL).href
);

export const UserCRUDAction = new CRUDAction<UserSerializer>(
  "users",
  new URL("accounts/users/", import.meta.env.VITE_APP_API_URL).href
);

export const setPassword = createAppAsyncThunk(
  "userprofiles/set-password",
  async (object: PasswordSerializer, { dispatch, getState }) => {
    const token = getState().auth.token;
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    };
    let url = new URL(
      "accounts/userprofiles/set-password/",
      import.meta.env.VITE_APP_API_URL
    );
    return axios
      .post(url.toString(), object, config)
      .then((res) => {
        dispatch(createMessage({ SUCCESS: "Senha alterada!" }));
        return res.data;
      })
      .catch((error) => {
        dispatch(returnError(error));
      });
  }
);
