import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  DiameterSerializer,
  FittingDiameterResponseSerializer,
  MaterialSerializer,
} from "api/types/igcTypes";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { FittingDiameterCRUDAction } from "api/igc";
import { SettingsBackupRestore } from "@mui/icons-material";
import { showDiameterDialog } from "Components/IGC/DialogForm/DiameterDialogForm";
import { showFittingDialog } from "Components/IGC/DialogForm/FittingDialogForm";

const FittingDiameter = ({ material }: { material: MaterialSerializer }) => {
  const dispatch = useAppDispatch();
  const diameters = useAppSelector((state) => state.igc.diameters);
  const fittings = useAppSelector((state) => state.igc.fittings);
  const fittingDiameters = useAppSelector(
    (state) => state.igc.fittingDiameters
  );

  const [currentDiameters, setCurrentDiameters] = useState<
    DiameterSerializer[]
  >([]);
  const [currentFittingdiameters, setCurrentFittingdiameters] =
    useState<FittingDiameterResponseSerializer | null>(null);

  useEffect(() => {
    const current = fittingDiameters.find((el) => el.material === material.id);
    if (current) {
      setCurrentFittingdiameters({
        ...current,
        fitting_diameter_array: [
          ...current.fitting_diameter_array.map((o) => {
            return { ...o };
          }),
        ],
      });
    }
  }, [fittingDiameters, material]);

  useEffect(() => {
    setCurrentDiameters(
      diameters
        .filter((d) => d.material === material.id)
        .sort((a, b) => a.internal_diameter - b.internal_diameter)
    );
  }, [diameters, material]);

  const onSubmit = () => {
    if (currentFittingdiameters) {
      dispatch(FittingDiameterCRUDAction.create(currentFittingdiameters));
    }
  };

  const handleReset = () => {
    const current = fittingDiameters.find((el) => el.material === material.id);
    if (current) {
      setCurrentFittingdiameters({
        ...current,
        fitting_diameter_array: [
          ...current.fitting_diameter_array.map((o) => {
            return { ...o };
          }),
        ],
      });
    }
  };

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ marginTop: 2 }}
      key={material.id}
    >
      <Box>
        <Table sx={{ minWidth: 650 }} size="small">
          <caption>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
              >
                <Grid item xs>
                  <Typography>
                    Tabela de perdas de cargas das conexões
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <IconButton onClick={handleReset} color="warning">
                    <SettingsBackupRestore />
                  </IconButton>
                </Grid>
                <Grid item xs={2}>
                  <Button onClick={onSubmit}>Salvar</Button>
                </Grid>
              </Grid>
            </Stack>
          </caption>
          <TableHead>
            <TableRow>
              <TableCell width="30%" variant="head">
                Conexão
              </TableCell>
              {currentDiameters.map((_diameter) => (
                <TableCell
                  key={_diameter.id}
                  align="center"
                  sx={{ width: `${70 / currentDiameters.length}%` }}
                >
                  <Button
                    variant="text"
                    onClick={() => {
                      showDiameterDialog(_diameter);
                    }}
                    style={{ textTransform: "none" }}
                  >
                    {_diameter.name} ({_diameter.internal_diameter} mm)
                  </Button>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentFittingdiameters &&
              fittings &&
              currentDiameters &&
              fittings.map((_fitting) => (
                <TableRow key={_fitting.id}>
                  <TableCell component="th" scope="row">
                    <Button
                      variant="text"
                      onClick={() => {
                        showFittingDialog(_fitting);
                      }}
                      style={{ textTransform: "none" }}
                    >
                      {_fitting.name}
                    </Button>
                  </TableCell>
                  {currentDiameters.map((_diameter) => (
                    <TableCell key={_diameter.id} align="center">
                      <TextField
                        type="number"
                        variant="standard"
                        inputProps={{
                          style: { textAlign: "center" },
                          step: "0.01",
                        }}
                        value={
                          currentFittingdiameters.fitting_diameter_array.find(
                            (fd) =>
                              fd.fitting === _fitting.id &&
                              fd.diameter === _diameter.id
                          )?.equivalent_length || ""
                        }
                        onChange={(event) => {
                          let current =
                            currentFittingdiameters.fitting_diameter_array.find(
                              (fd) =>
                                fd.fitting === _fitting.id &&
                                fd.diameter === _diameter.id
                            );
                          const parserValue = event.target.value;
                          if (current) {
                            current.equivalent_length = parserValue;
                            setCurrentFittingdiameters({
                              ...currentFittingdiameters,
                              fitting_diameter_array: [
                                ...currentFittingdiameters.fitting_diameter_array.map(
                                  (o) =>
                                    current &&
                                    o.fitting === current.fitting &&
                                    o.diameter === current.diameter
                                      ? { ...current }
                                      : o
                                ),
                              ],
                            });
                          } else {
                            setCurrentFittingdiameters({
                              ...currentFittingdiameters,
                              fitting_diameter_array: [
                                ...currentFittingdiameters.fitting_diameter_array,
                                {
                                  id: 0,
                                  equivalent_length: parserValue,
                                  material: material.id,
                                  fitting: _fitting.id,
                                  diameter: _diameter.id,
                                },
                              ],
                            });
                          }
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Box>
    </TableContainer>
  );
};

export default FittingDiameter;
