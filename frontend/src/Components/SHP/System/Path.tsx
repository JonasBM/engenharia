import { Add, Delete } from "@mui/icons-material";
import {
  Box,
  Checkbox,
  IconButton,
  InputAdornment,
  MenuItem,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import {
  DiameterSerializer,
  FittingDiameterSerializer,
} from "api/types/shpTypes";
import React, { useEffect, useState } from "react";
import { actions, checkLetter } from "redux/shp";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { DecimalFormatter } from "utils";
import Fixture from "./Fixture";
import { showDialogCalcFittings } from "./DialogFittings";

const Path = ({ index }: { index: number }) => {
  const dispatch = useAppDispatch();
  const materials = useAppSelector((state) => state.shp.materials);
  const diameters = useAppSelector((state) => state.shp.diameters);
  const path = useAppSelector((state) => state.shpCalc.paths[index]);
  const fittingDiameters = useAppSelector(
    (state) => state.shp.fittingDiameters
  );

  const [currentFittingDiameters, setCurrentFittingDiameters] = useState<
    FittingDiameterSerializer[]
  >([]);

  const [currentDiameters, setCurrentDiameters] = useState<
    DiameterSerializer[]
  >([]);

  useEffect(() => {
    setCurrentFittingDiameters(
      fittingDiameters.find((d) => d.material === path.material_id)
        ?.fitting_diameter_array
    );
  }, [fittingDiameters, dispatch, index, path.material_id]);

  useEffect(() => {
    setCurrentDiameters(
      diameters
        .filter((d) => d.material === path.material_id)
        .sort((a, b) => a.internal_diameter - b.internal_diameter)
    );
  }, [diameters, dispatch, index, path.material_id]);

  useEffect(() => {
    if (currentDiameters.length > 0) {
      const currentDiameter = currentDiameters.find(
        (d) => d.id === path.diameter_id
      );
      if (!currentDiameter) {
        dispatch(
          actions.setPath([index, { diameter_id: currentDiameters[0].id }])
        );
      }
    }
  }, [currentDiameters, dispatch, index, path.diameter_id]);

  useEffect(() => {
    if (currentFittingDiameters?.length > 0) {
      let newEquivalentLength = 0;
      for (const _fitting_id of path.fittings_ids) {
        const _fitting = currentFittingDiameters?.find(
          (fd) => fd.diameter === path.diameter_id && fd.fitting === _fitting_id
        );
        if (_fitting && _fitting.equivalent_length) {
          newEquivalentLength += parseFloat(
            _fitting.equivalent_length.toString()
          );
        }
      }
      dispatch(
        actions.setPath([index, { equivalent_length: newEquivalentLength }])
      );
    }
  }, [
    currentFittingDiameters,
    dispatch,
    index,
    path.diameter_id,
    path.fittings_ids,
  ]);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton
            sx={{ visibility: path.start === "RES" ? "hidden" : "visible" }}
            onClick={() => {
              dispatch(actions.removePath(index));
            }}
          >
            <Delete />
          </IconButton>
        </TableCell>
        <TableCell>
          <TextField
            sx={{ width: "40px" }}
            variant="standard"
            disabled={path.start === "RES"}
            inputProps={{
              style: { textAlign: "center" },
            }}
            value={path.start}
            onChange={(event) => {
              const letter = event.target.value.toUpperCase();
              if (checkLetter(letter)) {
                dispatch(actions.setPath([index, { start: letter }]));
              }
            }}
          />
        </TableCell>
        <TableCell>
          <TextField
            sx={{
              width: "40px",
              visibility: path.has_fixture ? "hidden" : "visible",
            }}
            variant="standard"
            inputProps={{
              style: {
                textAlign: "center",
              },
            }}
            value={path.end}
            onChange={(event) => {
              const letter = event.target.value.toUpperCase();
              if (checkLetter(letter)) {
                dispatch(actions.setPath([index, { end: letter }]));
              }
            }}
          />
        </TableCell>
        <TableCell>
          <Checkbox
            checked={path.has_fixture || false}
            onChange={(event) => {
              dispatch(
                actions.setPath([index, { has_fixture: event.target.checked }])
              );
            }}
          />
        </TableCell>
        <TableCell align="center">
          {materials.length > 0 && (
            <TextField
              sx={{ width: "200px" }}
              variant="standard"
              select
              value={path.material_id || ""}
              onChange={(event) => {
                dispatch(
                  actions.setPath([
                    index,
                    {
                      material_id: parseInt(event.target.value),
                      diameter_id: undefined,
                    },
                  ])
                );
              }}
            >
              {materials.map((_material) => (
                <MenuItem key={_material.id} value={_material.id}>
                  {_material.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </TableCell>
        <TableCell align="center">
          {currentDiameters.length > 0 && (
            <TextField
              sx={{ width: "200px" }}
              variant="standard"
              select
              value={
                currentDiameters.find((d) => d.id === path.diameter_id)?.id ||
                ""
              }
              onChange={(event) => {
                dispatch(
                  actions.setPath([
                    index,
                    { diameter_id: parseInt(event.target.value) },
                  ])
                );
              }}
            >
              {currentDiameters.map((_diameter) => (
                <MenuItem key={_diameter.id} value={_diameter.id}>
                  {_diameter.name} ({_diameter.internal_diameter} mm)
                </MenuItem>
              ))}
            </TextField>
          )}
        </TableCell>
        <TableCell align="center">
          <TextField
            sx={{ width: "100px" }}
            variant="standard"
            inputProps={{
              // step: "0.01",
              style: { textAlign: "center" },
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">m</InputAdornment>,
            }}
            value={path.length ? DecimalFormatter(path.length) : ""}
            onChange={(event) => {
              console.log(DecimalFormatter(event.target.value));
              dispatch(
                actions.setPath([
                  index,
                  {
                    length: DecimalFormatter(event.target.value),
                  },
                ])
              );
            }}
          />
        </TableCell>
        <TableCell align="center">
          <TextField
            sx={{ width: "100px" }}
            variant="standard"
            inputProps={{
              step: "0.01",
              style: { textAlign: "center" },
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">m</InputAdornment>,
            }}
            value={path.level_difference || ""}
            onChange={(event) => {
              dispatch(
                actions.setPath([
                  index,
                  { level_difference: event.target.value },
                ])
              );
            }}
          />
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <TextField
              disabled
              sx={{ width: "100px" }}
              variant="standard"
              inputProps={{ step: "0.01", style: { textAlign: "center" } }}
              value={path.equivalent_length || "0,00"}
            />
            <IconButton
              onClick={() => {
                showDialogCalcFittings({ index });
              }}
            >
              <Add />
            </IconButton>
          </Box>
        </TableCell>
        <TableCell align="center">-</TableCell>
        <TableCell align="center">-</TableCell>
        <TableCell align="center">-</TableCell>
        <TableCell align="center">-</TableCell>
        <TableCell align="center">-</TableCell>
        <TableCell align="center">-</TableCell>
      </TableRow>
      {path.has_fixture && path.fixture && <Fixture index={index} />}
    </>
  );
};

export default Path;
