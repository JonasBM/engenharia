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
import React, { useEffect } from "react";

import System from "./Calculation";
import { documentTitles } from "myConstants";
import { useAppDispatch } from "redux/utils";

const SHP = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    document.title = "Cálculo de SHP";
    return () => {
      document.title = documentTitles.PORTAL;
    };
  }, []);

  useEffect(() => {
    dispatch(ConfigCRUDAction.list());
    dispatch(MaterialCRUDAction.list());
    dispatch(DiameterCRUDAction.list());
    dispatch(FittingCRUDAction.list());
    dispatch(FittingDiameterCRUDAction.list());
    dispatch(ReductionCRUDAction.list());
    dispatch(MaterialConnectionCRUDAction.list());
    dispatch(FixtureCRUDAction.list());
  }, [dispatch]);

  return <System />;
};

export default SHP;
