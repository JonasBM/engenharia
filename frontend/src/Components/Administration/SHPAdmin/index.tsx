import {
  DiameterCRUDAction,
  FittingCRUDAction,
  FittingDiameterCRUDAction,
  FixtureCRUDAction,
  MaterialCRUDAction,
  MaterialConnectionCRUDAction,
  ReductionCRUDAction,
} from "api/shp";
import React, { useEffect } from "react";

import Fixture from "./Fixture";
import Material from "./Material";
import MaterialConnection from "./MaterialConnection";
import { Stack } from "@mui/material";
import { useAppDispatch } from "redux/utils";

const SHPAdmin = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(MaterialCRUDAction.list());
    dispatch(DiameterCRUDAction.list());
    dispatch(FittingCRUDAction.list());
    dispatch(FittingDiameterCRUDAction.list());
    dispatch(ReductionCRUDAction.list());
    dispatch(MaterialConnectionCRUDAction.list());
    dispatch(FixtureCRUDAction.list());
  }, [dispatch]);

  return (
    <Stack spacing={2}>
      <Material />
      <MaterialConnection />
      <Fixture />
    </Stack>
  );
};

export default SHPAdmin;
