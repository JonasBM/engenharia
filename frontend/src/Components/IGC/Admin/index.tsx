import {
  ConfigCRUDAction,
  DiameterCRUDAction,
  FittingCRUDAction,
  FittingDiameterCRUDAction,
  GASCRUDAction,
  MaterialCRUDAction,
  MaterialConnectionCRUDAction,
  ReductionCRUDAction,
} from "api/igc";
import React, { useEffect } from "react";

import Config from "./Config";
import GAS from "./GAS";
import Material from "./Material";
import MaterialConnection from "./MaterialConnection";
import { Stack } from "@mui/material";
import { useAppDispatch } from "redux/utils";

const IGCAdmin = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(ConfigCRUDAction.list());
    dispatch(MaterialCRUDAction.list());
    dispatch(DiameterCRUDAction.list());
    dispatch(FittingCRUDAction.list());
    dispatch(FittingDiameterCRUDAction.list());
    dispatch(ReductionCRUDAction.list());
    dispatch(MaterialConnectionCRUDAction.list());
    dispatch(GASCRUDAction.list());
  }, [dispatch]);

  return (
    <Stack spacing={2}>
      <Config />
      <Material />
      <MaterialConnection />
      <GAS />
    </Stack>
  );
};

export default IGCAdmin;
