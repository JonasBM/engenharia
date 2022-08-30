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
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { FixtureSerializer, ReductionSerializer } from "api/types/shpTypes";
import React, { useEffect, useState } from "react";
import { closeDialog, openDialog } from "redux/modal";

import { decimalFormatter } from "utils";
import store from "redux/store";
import { useAppSelector } from "redux/utils";
import { useFormContext } from "react-hook-form";

const _dialogName = "DIALOG_REDUCTIONSFIXTURE";

export const showDialogFixtureReductions = () => {
  store.dispatch(
    openDialog({
      dialogName: _dialogName,
      dialogObject: {},
    })
  );
};

export const closeDialogFixtureReductions = () => {
  store.dispatch(closeDialog(_dialogName));
};

const FixtureDialogReductions = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const reductions = useAppSelector((state) => state.shp.reductions);

  const openModals = useAppSelector((state) => state.modal.openModals);

  const { watch, setValue, register } = useFormContext<FixtureSerializer>();

  const material_id = watch("material");
  const diameter_id = watch("inlet_diameter");
  const reductions_ids = watch("reductions_ids");
  const reductions_equivalent_length = watch("reductions_equivalent_length");

  const [currentReductions, setCurrentReductions] = useState<
    ReductionSerializer[]
  >([]);

  useEffect(() => {
    setCurrentReductions(reductions.filter((r) => r.material === material_id));
  }, [reductions, material_id]);

  const getEquivalentLengthString = (_reduction_id: number): string => {
    const reduction = currentReductions?.find((r) => r.id === _reduction_id);
    if (reduction?.equivalent_length) {
      return ` (${reduction?.equivalent_length} m)`;
    }
    return "";
  };

  useEffect(() => {
    let newEquivalentLength = 0;
    if (reductions_ids?.length || 0 > 0) {
      for (const _reduction_id of reductions_ids || []) {
        const _reduction = currentReductions?.find(
          (r) => r.id === _reduction_id
        );
        if (_reduction && _reduction.equivalent_length) {
          newEquivalentLength += parseFloat(
            _reduction.equivalent_length.toString()
          );
        }
      }
    }
    setValue("reductions_equivalent_length", newEquivalentLength);
  }, [currentReductions, reductions_ids, setValue]);

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;
    if (result.source.index !== result.destination.index) {
      const newArray = [...(reductions_ids || [])];
      const element = newArray.splice(result.source.index, 1)[0];
      newArray.splice(result.destination.index, 0, element);
      setValue("reductions_ids", newArray);
    }
  };

  const handleClose = () => {
    closeDialogFixtureReductions();
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
      open={openModals.includes(_dialogName)}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
    >
      <Box>
        <DialogTitle>
          Adicione as reduções ou ampliações do Hidrante
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
              xs={12}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              height={60}
            >
              {`Comprimento equivalente das reduções/ampliações: ${
                decimalFormatter(reductions_equivalent_length) || "0,00"
              } m`}
            </Grid>
            <Grid item xs={5} height={"100%"}>
              <List dense component={Paper}>
                {currentReductions &&
                  currentReductions.map((_reduction) => (
                    <ListItemButton
                      key={_reduction.id}
                      onClick={() => {
                        if (_reduction.id) {
                          setValue("reductions_ids", [
                            ...(reductions_ids || []),
                            _reduction.id,
                          ]);
                        }
                      }}
                    >
                      <ListItemText primary={_reduction.name} />
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
                <Droppable droppableId="reductions_ids">
                  {(provided) => (
                    <List
                      dense
                      component={Paper}
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {currentReductions &&
                      reductions_ids &&
                      reductions_ids.length > 0 ? (
                        reductions_ids.map((_reduction_id, _index) => (
                          <Draggable
                            key={_index}
                            draggableId={`reductions_ids-${_index}`}
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
                                        reductions.find(
                                          (f) => f.id === _reduction_id
                                        )?.name
                                      }
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      width={80}
                                      noWrap
                                      textAlign="end"
                                    >
                                      {getEquivalentLengthString(_reduction_id)}
                                    </Typography>
                                  </Stack>
                                </ListItemText>
                                <ListItemSecondaryAction>
                                  <IconButton
                                    edge="end"
                                    onClick={() => {
                                      const newReductions_ids = [
                                        ...reductions_ids,
                                      ];
                                      newReductions_ids.splice(_index, 1);
                                      setValue(
                                        "reductions_ids",
                                        newReductions_ids
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

export default FixtureDialogReductions;
