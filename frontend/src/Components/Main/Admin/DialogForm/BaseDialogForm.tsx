import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close, Delete, SettingsBackupRestore } from "@mui/icons-material";

import React from "react";

export interface BaseDialogFormProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  onReset: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  maxWidth?: DialogProps["maxWidth"];
}

const BaseDialogForm = ({
  open,
  title,
  onClose,
  onSubmit,
  onReset,
  onDelete,
  canDelete = false,
  maxWidth = "sm",
  children,
}: BaseDialogFormProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const onCloseWithoutBackDrop = (
    event: object,
    reason: "backdropClick" | "escapeKeyDown"
  ) => {
    if (reason !== "backdropClick") {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth={maxWidth}
      onClose={onCloseWithoutBackDrop}
      fullScreen={fullScreen}
      fullWidth
    >
      <Box component="form" onSubmit={onSubmit}>
        <DialogTitle>
          {title}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>{children}</DialogContent>
        <DialogActions>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item xs={2}>
              {onDelete && (
                <IconButton onClick={onDelete} color="error">
                  <Delete />
                </IconButton>
              )}
            </Grid>
            <Grid item xs />
            <Grid item xs={2}>
              <IconButton onClick={onReset} color="warning">
                <SettingsBackupRestore />
              </IconButton>
            </Grid>
            <Grid item xs={2}>
              <Button onClick={onClose}>Fechar</Button>
            </Grid>
            <Grid item xs={2}>
              <Button type="submit">Salvar</Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default BaseDialogForm;
