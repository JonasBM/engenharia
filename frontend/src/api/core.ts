import { CRUDAction } from "redux-simplified";
import {SignatorySerializer} from "./types/coreTypes";

export const SignatoryCRUDAction = new CRUDAction<SignatorySerializer>(
  "core/signatories",
  new URL("/signatories/", import.meta.env.VITE_APP_API_URL).href
);
