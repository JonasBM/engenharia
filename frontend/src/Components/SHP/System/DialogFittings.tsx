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
import { Close, Delete, DragIndicator } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { hideDialog, showDialog } from "redux/modal";

import { FittingSerializer } from "api/types/shpTypes";
import { SHPCalcState } from "redux/shp";
import store from "redux/store";
import { useAppSelector } from "redux/utils";
import { useFormContext } from "react-hook-form";

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
  const fittings = useAppSelector((state) => state.shp.fittings);
  const {
    dialogName,
    dialogObject: { index },
  } = useAppSelector((state) => state.modal) as {
    dialogName: string | null;
    dialogObject: { index: number };
  };

  const { watch, setValue } = useFormContext<SHPCalcState>();

  const material_id = watch(`paths.${index}.material_id`);
  const start = watch(`paths.${index}.start`);
  const end = watch(`paths.${index}.end`);
  const has_fixture = watch(`paths.${index}.has_fixture`);
  const fixture = watch(`paths.${index}.fixture`);
  const equivalent_length = watch(`paths.${index}.equivalent_length`);
  const fittings_ids = watch(`paths.${index}.fittings_ids`);

  const [currentFittings, setCurrentFittings] = useState<FittingSerializer[]>(
    []
  );

  useEffect(() => {
    if (material_id > -1) {
      setCurrentFittings((_) => {
        const current = fittings
          .filter((d) => d.material === material_id)
          .sort((a, b) => a.name.localeCompare(b.name));
        return current;
      });
    }
  }, [fittings, material_id]);

  const handleClose = () => {
    closeDialogCalcFittings();
  };

  return (
    <Dialog
      open={dialogName === _dialogName ? true : false}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
    >
      <Box>
        <DialogTitle>
          {`Adicione as conexões no trecho ${start} - ${
            has_fixture ? fixture.end : end
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
            {`Comprimento ${index} equivalente total: ${
              equivalent_length || "0,00"
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
                        setValue(`paths.${index}.fittings_ids`, [
                          ...fittings_ids,
                          _fitting.id,
                        ]);
                      }}
                    >
                      <ListItemText primary={_fitting.name} />
                    </ListItemButton>
                  ))}
              </List>
            </Grid>
            <Grid item xs={6}>
              <List dense component={Paper}>
                {currentFittings && fittings_ids && fittings_ids.length > 0 ? (
                  fittings_ids.map((_fitting_id, _index) => (
                    <ListItemButton key={_index}>
                      <ListItemIcon>
                        <DragIndicator />
                      </ListItemIcon>
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
                            const newFittings_ids = [...fittings_ids];
                            newFittings_ids.splice(_index, 1);
                            setValue(
                              `paths.${index}.fittings_ids`,
                              newFittings_ids
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
    </Dialog>
  );
};

export default DialogFittings;
