import {
  CRUDAction,
  createMessage,
  finishFetching,
  returnError,
  startFetching,
} from "redux-simplified";
import {
  ConfigSerializer,
  DiameterSerializer,
  FittingDiameterResponseSerializer,
  FittingSerializer,
  FixtureSerializer,
  MaterialConnectionSerializer,
  MaterialFileSerializer,
  MaterialSerializer,
  ReductionSerializer,
  SHPCalcSerializer,
} from "./types/shpTypes";
import axios, { AxiosRequestConfig } from "axios";

import { Dispatch } from "@reduxjs/toolkit";
import store from "redux/store";

export const ConfigCRUDAction = new CRUDAction<ConfigSerializer>(
  "shp/configs",
  new URL("/shp/configs/", process.env.REACT_APP_API_URL).href
);

export const MaterialCRUDAction = new CRUDAction<MaterialSerializer>(
  "shp/materials",
  new URL("/shp/materials/", process.env.REACT_APP_API_URL).href
);

export const DiameterCRUDAction = new CRUDAction<DiameterSerializer>(
  "shp/diameters",
  new URL("/shp/diameters/", process.env.REACT_APP_API_URL).href
);

export const FittingCRUDAction = new CRUDAction<FittingSerializer>(
  "shp/fittings",
  new URL("/shp/fittings/", process.env.REACT_APP_API_URL).href
);

export const FittingDiameterCRUDAction =
  new CRUDAction<FittingDiameterResponseSerializer>(
    "shp/fittingdiameter",
    new URL("/shp/fittingdiameter/", process.env.REACT_APP_API_URL).href,
    {
      payloadIdName: "material",
      actionMessages: { create: "Conexões salvas com sucesso!" },
    }
  );

export const ReductionCRUDAction = new CRUDAction<ReductionSerializer>(
  "shp/reductions",
  new URL("/shp/reductions/", process.env.REACT_APP_API_URL).href
);

export const MaterialConnectionCRUDAction =
  new CRUDAction<MaterialConnectionSerializer>(
    "shp/materialconnections",
    new URL("/shp/materialconnections/", process.env.REACT_APP_API_URL).href
  );

export const FixtureCRUDAction = new CRUDAction<FixtureSerializer>(
  "shp/fixtures",
  new URL("/shp/fixtures/", process.env.REACT_APP_API_URL).href
);

export const loadMaterialBackup = (object: MaterialFileSerializer) => {
  return (dispatch: Dispatch): Promise<any> => {
    const token = store.getState().auth.token;
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    };
    dispatch(startFetching());
    let url = new URL("shp/loadmaterialbackup/", process.env.REACT_APP_API_URL);
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

export const calculateSHP = (object: SHPCalcSerializer) => {
  return (dispatch: Dispatch): Promise<SHPCalcSerializer> => {
    const token = store.getState().auth.token;
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    };
    dispatch(startFetching());
    let url = new URL("shp/calculate/", process.env.REACT_APP_API_URL);
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
