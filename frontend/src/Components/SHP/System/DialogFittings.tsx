import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close, Delete } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { hideDialog, showDialog } from "redux/modal";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { FittingSerializer } from "api/types/shpTypes";
import { actions } from "redux/shp";
import store from "redux/store";

const _dialogName = "DIALOG_FITTINGSCALC";

export const showDialogCalcFittings = (_dialogObject: { index: number }) => {
  store.dispatch(
    showDialog({
      dialogName: _dialogName,
      dialogObject: { ..._dialogObject },
    })
  );
};

export const closeDialogCalcFittings = () => {
  store.dispatch(hideDialog());
};

const DialogFittings = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useAppDispatch();
  const fittings = useAppSelector((state) => state.shp.fittings);
  const {
    dialogName,
    dialogObject: { index },
  } = useAppSelector((state) => state.modal) as {
    dialogName: string | null;
    dialogObject: { index: number };
  };
  const path = useAppSelector((state) => state.shpCalc.paths[index]);

  const [currentFittings, setCurrentFittings] = useState<FittingSerializer[]>(
    []
  );

  useEffect(() => {
    if (path && path.material_id > -1) {
      setCurrentFittings((_) => {
        const current = fittings
          .filter((d) => d.material === path.material_id)
          .sort((a, b) => a.name.localeCompare(b.name));
        return current;
      });
    }
  }, [fittings, dispatch, path]);

  const handleClose = () => {
    closeDialogCalcFittings();
  };

  return (
    <Dialog
      open={path && dialogName === _dialogName ? true : false}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
    >
      {path && (
        <Box>
          <DialogTitle>
            {`Adicione as conexões no trecho ${path.start} - ${
              path.has_fixture ? path.fixture.end : path.end
            }`}
            <IconButton
              onClick={handleClose}
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
          <DialogContent dividers>
            <Typography>
              {`Comprimento equivalente total: ${
                path.equivalent_length || "0,00"
              }`}
            </Typography>
            <Grid container direction="row" spacing={1} maxHeight={500}>
              <Grid item xs={6}>
                <List dense component={Paper}>
                  <ListSubheader>Escolha a conexão para o trecho</ListSubheader>
                  {currentFittings &&
                    currentFittings.map((_fitting) => (
                      <ListItemButton
                        key={_fitting.id}
                        onClick={() => {
                          dispatch(
                            actions.setPath([
                              index,
                              {
                                fittings_ids: [
                                  ...path.fittings_ids,
                                  _fitting.id,
                                ],
                              },
                            ])
                          );
                        }}
                      >
                        <ListItemText primary={_fitting.name} />
                      </ListItemButton>
                    ))}
                </List>
              </Grid>
              <Grid item xs={6}>
                <List dense component={Paper}>
                  {currentFittings &&
                  path?.fittings_ids &&
                  path.fittings_ids.length > 0 ? (
                    path.fittings_ids.map((_fitting_id, _index) => (
                      <ListItemButton key={_index}>
                        {/* <ListItemIcon>
                          <DragIndicator />
                        </ListItemIcon> */}
                        <ListItemText
                          primary={
                            currentFittings.find((f) => f.id === _fitting_id)
                              ?.name
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => {
                              const newFittings_ids = [...path.fittings_ids];
                              newFittings_ids.splice(_index, 1);
                              dispatch(
                                actions.setPath([
                                  index,
                                  {
                                    fittings_ids: newFittings_ids,
                                  },
                                ])
                              );
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItemButton>
                    ))
                  ) : (
                    <ListItem>Sem conexões</ListItem>
                  )}
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Fechar</Button>
          </DialogActions>
        </Box>
      )}
    </Dialog>
  );
};

export default DialogFittings;
