import * as React from "react";

import { SnackbarKey, useSnackbar } from "notistack";

import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";

function SnackbarCloseButton({ id }: { id: SnackbarKey }) {
  const { closeSnackbar } = useSnackbar();

  return (
    <IconButton onClick={() => closeSnackbar(id)}>
      <Close />
    </IconButton>
  );
}

export default SnackbarCloseButton;
