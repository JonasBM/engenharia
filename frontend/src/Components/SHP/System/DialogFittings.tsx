import {
  ArrowForward,
  Close,
  Delete,
  DragIndicator,
} from "@mui/icons-material";
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
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import {
  FittingDiameterSerializer,
  SHPCalcSerializer,
} from "api/types/shpTypes";
import React, { useEffect, useState } from "react";
import { hideDialog, showDialog } from "redux/modal";

import { decimalFormatter } from "utils";
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
  const fittingDiameters = useAppSelector(
    (state) => state.shp.fittingDiameters
  );
  const {
    dialogName,
    dialogObject: { index },
  } = useAppSelector((state) => state.modal) as {
    dialogName: string | null;
    dialogObject: { index: number };
  };

  const { watch, setValue, register } = useFormContext<SHPCalcSerializer>();

  const material_id = watch(`paths.${index}.material_id`);
  const diameter_id = watch(`paths.${index}.diameter_id`);

  const start = watch(`paths.${index}.start`);
  const end = watch(`paths.${index}.end`);
  const has_fixture = watch(`paths.${index}.has_fixture`);
  const fixture = watch(`paths.${index}.fixture`);
  const equivalent_length = watch(`paths.${index}.equivalent_length`);
  const fittings_ids = watch(`paths.${index}.fittings_ids`);

  const [currentFittingDiameters, setCurrentFittingDiameters] = useState<
    FittingDiameterSerializer[]
  >([]);

  useEffect(() => {
    setCurrentFittingDiameters(
      fittingDiameters.find((d) => d.material === material_id)
        ?.fitting_diameter_array
    );
  }, [fittingDiameters, material_id]);

  const getEquivalentLengthString = (_fitting_id: number): string => {
    const fittingDiameter = currentFittingDiameters?.find(
      (fd) => fd.diameter === diameter_id && fd.fitting === _fitting_id
    );
    if (fittingDiameter?.equivalent_length) {
      return ` (${fittingDiameter?.equivalent_length} m)`;
    }
    return "";
  };

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;
    if (result.source.index !== result.destination.index) {
      const newArray = [...fittings_ids];
      const element = newArray.splice(result.source.index, 1)[0];
      newArray.splice(result.destination.index, 0, element);
      setValue(`paths.${index}.fittings_ids`, newArray);
    }
  };

  const handleClose = () => {
    closeDialogCalcFittings();
  };

  const onClose = (
    event: object,
    reason: "backdropClick" | "escapeKeyDown"
  ) => {
    if (reason !== "backdropClick") {
      handleClose();
    }
  };

  return (
    <Dialog
      open={dialogName === _dialogName ? true : false}
      onClose={onClose}
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
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="flex-start"
            spacing={1}
            height={500}
          >
            <Grid
              item
              xs={8}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              paddingTop={0}
              height={60}
            >
              {`Comprimento equivalente total:
                ${decimalFormatter(equivalent_length) || "0,00"} m`}
            </Grid>
            <Grid item xs={4} paddingTop={0} height={60}>
              <TextField
                type="number"
                label="Comprimento extra"
                {...register(`paths.${index}.extra_equivalent_length`)}
              />
            </Grid>
            <Grid item xs={5} height={"100%"}>
              <List dense component={Paper}>
                {fittings &&
                  fittings.map((_fitting) => (
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
                      <ListItemSecondaryAction>
                        <IconButton edge="end">
                          <ArrowForward />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItemButton>
                  ))}
              </List>
            </Grid>
            <Grid item xs={7}>
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="fittings_ids">
                  {(provided) => (
                    <List
                      dense
                      component={Paper}
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {fittings && fittings_ids && fittings_ids.length > 0 ? (
                        fittings_ids.map((_fitting_id, _index) => (
                          <Draggable
                            key={_index}
                            draggableId={`fittings_ids-${_index}`}
                            index={_index}
                          >
                            {(provided) => (
                              <ListItemButton
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <ListItemIcon
                                  sx={{ minWidth: 30 }}
                                  {...provided.dragHandleProps}
                                >
                                  <DragIndicator />
                                </ListItemIcon>
                                <ListItemText>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    width="90%"
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ flexGrow: 1 }}
                                    >
                                      {
                                        fittings.find(
                                          (f) => f.id === _fitting_id
                                        )?.name
                                      }
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      width={80}
                                      noWrap
                                      textAlign="end"
                                    >
                                      {getEquivalentLengthString(_fitting_id)}
                                    </Typography>
                                  </Stack>
                                </ListItemText>
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
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <ListItem>Sem conexões</ListItem>
                      )}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>
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
