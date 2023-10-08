import React, { useEffect } from "react";

import Signatories from "./Signatory";
import { Stack } from "@mui/material";
import { useAppDispatch } from "redux/utils";
import { SignatoryCRUDAction } from "api/core";

const IGCAdmin = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(SignatoryCRUDAction.list());
  }, [dispatch]);

  return (
    <Stack spacing={2}>
      <Signatories />
    </Stack>
  );
};

export default IGCAdmin;
