import {
  CilinderCRUDAction,
  ConfigCRUDAction,
  DiameterCRUDAction,
  FittingCRUDAction,
  FittingDiameterCRUDAction,
  GASCRUDAction,
  MaterialCRUDAction,
  MaterialConnectionCRUDAction,
  MeterCRUDAction,
  ReductionCRUDAction,
} from "api/igc";
import React, { useEffect } from "react";

import System from "./Calculation";
import { documentTitles } from "myConstants";
import { useAppDispatch } from "redux/utils";
import { SignatoryCRUDAction } from "api/core";

const IGC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    document.title = "Cálculo de IGC Primária";
    return () => {
      document.title = documentTitles.PORTAL;
    };
  }, []);

  useEffect(() => {
    dispatch(SignatoryCRUDAction.list());
    dispatch(ConfigCRUDAction.list());
    dispatch(MaterialCRUDAction.list());
    dispatch(DiameterCRUDAction.list());
    dispatch(FittingCRUDAction.list());
    dispatch(FittingDiameterCRUDAction.list());
    dispatch(ReductionCRUDAction.list());
    dispatch(MaterialConnectionCRUDAction.list());
    dispatch(GASCRUDAction.list());
    dispatch(CilinderCRUDAction.list());
    dispatch(MeterCRUDAction.list());
  }, [dispatch]);

  return <System />;
};

export default IGC;
