import { CRUDAction, createMessage, finishFetching, returnError, startFetching } from "redux-simplified";
import {
  ConfigSerializer,
  DiameterSerializer,
  FittingDiameterResponseSerializer,
  FittingSerializer,
  GASSerializer,
  MaterialConnectionSerializer,
  MaterialFileSerializer,
  MaterialSerializer,
  ReductionSerializer,
  IGCCalcSerializer,
} from "./types/igcTypes";
import axios, { AxiosRequestConfig } from "axios";

import { Dispatch } from "@reduxjs/toolkit";
import { RootState } from "redux/store";
import { sanitizeFilename } from "utils";
// import { RootState } from "redux/store";
// import store from "redux/store";

export const ConfigCRUDAction = new CRUDAction<ConfigSerializer>(
  "igc/configs",
  new URL("/igc/configs/", import.meta.env.VITE_APP_API_URL).href
);

export const MaterialCRUDAction = new CRUDAction<MaterialSerializer>(
  "igc/materials",
  new URL("/igc/materials/", import.meta.env.VITE_APP_API_URL).href
);

export const DiameterCRUDAction = new CRUDAction<DiameterSerializer>(
  "igc/diameters",
  new URL("/igc/diameters/", import.meta.env.VITE_APP_API_URL).href
);

export const FittingCRUDAction = new CRUDAction<FittingSerializer>(
  "igc/fittings",
  new URL("/igc/fittings/", import.meta.env.VITE_APP_API_URL).href
);

export const FittingDiameterCRUDAction = new CRUDAction<FittingDiameterResponseSerializer>(
  "igc/fittingdiameter",
  new URL("/igc/fittingdiameter/", import.meta.env.VITE_APP_API_URL).href,
  {
    payloadIdName: "material",
    actionMessages: { create: "Conexões salvas com sucesso!" },
  }
);

export const ReductionCRUDAction = new CRUDAction<ReductionSerializer>(
  "igc/reductions",
  new URL("/igc/reductions/", import.meta.env.VITE_APP_API_URL).href
);

export const MaterialConnectionCRUDAction = new CRUDAction<MaterialConnectionSerializer>(
  "igc/materialconnections",
  new URL("/igc/materialconnections/", import.meta.env.VITE_APP_API_URL).href
);

export const GASCRUDAction = new CRUDAction<GASSerializer>(
  "igc/gas",
  new URL("/igc/gas/", import.meta.env.VITE_APP_API_URL).href
);

export const loadMaterialBackup = (object: MaterialFileSerializer) => {
  return (dispatch: Dispatch, getState: () => RootState): Promise<any> => {
    const token = getState().auth.token;
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    };
    dispatch(startFetching());
    let url = new URL("igc/loadmaterialbackup/", import.meta.env.VITE_APP_API_URL);
    return axios
      .post(url.toString(), object, config)
      .then((res) => {
        dispatch(createMessage({ SUCCESS: res.data.detail }));
        dispatch(finishFetching());
        return res.data;
      })
      .catch((error) => {
        dispatch(returnError(error));
        dispatch(finishFetching());
        throw error;
      });
  };
};

export const calculateIGC = (object: IGCCalcSerializer) => {
  return (dispatch: Dispatch, getState: () => RootState): Promise<IGCCalcSerializer> => {
    const token = getState().auth.token;
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    };
    dispatch(startFetching());
    let url = new URL("igc/calculate/", import.meta.env.VITE_APP_API_URL);
    return axios
      .post(url.toString(), object, config)
      .then((res) => {
        // dispatch(setCalc(res.data));
        dispatch(createMessage({ SUCCESS: "Cálculado com sucesso" }));
        dispatch(finishFetching());
        return res.data;
      })
      .catch((error) => {
        dispatch(returnError(error));
        dispatch(finishFetching());
        throw error;
      });
  };
};

export const downloadPDFAction = (object: IGCCalcSerializer) => {
  return (dispatch: Dispatch, getState: () => RootState): Promise<IGCCalcSerializer> => {
    const token = getState().auth.token;
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      responseType: "blob",
    };
    dispatch(startFetching());
    let url = new URL("igc/calculate/?download=pdf", import.meta.env.VITE_APP_API_URL);
    return axios
      .post(url.toString(), object, config)
      .then((res) => {
        const contentDisposition = res.headers["content-disposition"];

        console.log(object.name);

        let filename;

        if (object.name) {
          filename = `Cálculo IGC - ${sanitizeFilename(object.name)}.pdf`;
        } else {
          filename = contentDisposition?.replace("attachment; filename=", "").replace("filename=", "");
        }
        if (!filename) {
          filename = "Cálculo IGC.pdf";
        }

        const file = new Blob([res.data], {
          type: res.headers["content-type"],
        });
        const fileURL = URL.createObjectURL(file);
        var fileLink = document.createElement("a");
        fileLink.href = fileURL;
        fileLink.download = filename;
        fileLink.click();
        URL.revokeObjectURL(fileURL);
        dispatch(finishFetching());
        return res.data;
      })
      .catch(async (error) => {
        error.response.data = JSON.parse(await error.response.data.text());
        dispatch(returnError(error));
        dispatch(finishFetching());
        throw error;
      });
  };
};
