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
  Controller,
  UseFieldArrayRemove,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import {
  DiameterSerializer,
  FittingDiameterSerializer,
} from "api/types/shpTypes";
import React, { useEffect, useState } from "react";
import { SHPCalcState, checkLetter } from "redux/shp";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { DecimalFormatter } from "utils";
import Fixture from "./Fixture";
import { cleanup } from "@testing-library/react";
import { showDialogCalcFittings } from "./DialogFittings";

const Path = ({
  index,
  remove,
}: {
  index: number;
  remove: UseFieldArrayRemove;
}) => {
  const materials = useAppSelector((state) => state.shp.materials);
  const diameters = useAppSelector((state) => state.shp.diameters);
  const fittingDiameters = useAppSelector(
    (state) => state.shp.fittingDiameters
  );

  const { register, control, watch, setValue } = useFormContext<SHPCalcState>();
  const material_id = useWatch({ control, name: `paths.${index}.material_id` });
  const diameter_id = watch(`paths.${index}.diameter_id`);
  const start = useWatch({ control, name: `paths.${index}.start` });
  const has_fixture = useWatch({ control, name: `paths.${index}.has_fixture` });
  const fixture = useWatch({ control, name: `paths.${index}.fixture` });
  const fittings_ids = watch(`paths.${index}.fittings_ids`);
  const equivalent_length = useWatch({
    control,
    name: `paths.${index}.equivalent_length`,
  });

  const [currentFittingDiameters, setCurrentFittingDiameters] = useState<
    FittingDiameterSerializer[]
  >([]);

  useEffect(() => {
    setCurrentFittingDiameters(
      fittingDiameters.find((d) => d.material === material_id)
        ?.fitting_diameter_array
    );
    // setValue(`paths.${index}.fittings_ids`, []);
  }, [fittingDiameters, index, material_id, setValue]);

  useEffect(() => {
    if (diameters.length > 0 && material_id) {
      const _currentDiameter = diameters.find((d) => d.id === diameter_id);
      if (_currentDiameter?.material !== material_id) {
        const _currentDiameters = diameters.filter(
          (d) => d.material === material_id
        );
        if (_currentDiameters.length > 0) {
          const _currentDiameter = _currentDiameters.find(
            (d) => d.id === diameter_id
          );
          if (!_currentDiameter) {
            setValue(`paths.${index}.diameter_id`, _currentDiameters[0].id);
          }
        }
      }
    }
  }, [diameter_id, diameters, index, material_id, setValue]);

  useEffect(() => {
    if (currentFittingDiameters?.length > 0) {
      let newEquivalentLength = 0;
      for (const _fitting_id of fittings_ids) {
        const _fitting = currentFittingDiameters?.find(
          (fd) => fd.diameter === diameter_id && fd.fitting === _fitting_id
        );
        // if (!_fitting) {
        //   setValue(`paths.${index}.fittings_ids`, [
        //     ...fittings_ids.filter((id) => id !== _fitting_id),
        //   ]);
        // }
        if (_fitting && _fitting.equivalent_length) {
          newEquivalentLength += parseFloat(
            _fitting.equivalent_length.toString()
          );
        }
      }
      setValue(`paths.${index}.equivalent_length`, newEquivalentLength);
    }
  }, [currentFittingDiameters, diameter_id, fittings_ids, index, setValue]);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton
            sx={{ visibility: start === "RES" ? "hidden" : "visible" }}
            onClick={() => {
              remove(index);
            }}
          >
            <Delete />
          </IconButton>
        </TableCell>
        <TableCell>
          <TextField
            sx={{ width: "40px" }}
            variant="standard"
            disabled={start === "RES"}
            inputProps={{
              style: { textAlign: "center" },
            }}
            {...register(`paths.${index}.start`)}
          />
        </TableCell>
        <TableCell>
          <TextField
            sx={{
              width: "40px",
              visibility: has_fixture ? "hidden" : "visible",
            }}
            variant="standard"
            inputProps={{
              style: {
                textAlign: "center",
              },
            }}
            {...register(`paths.${index}.end`)}
          />
        </TableCell>
        <TableCell>
          <Controller
            name={`paths.${index}.has_fixture`}
            control={control}
            render={({ field: { value, onChange } }) => (
              <Checkbox
                checked={value || false}
                onChange={(e) => onChange(e.target.checked)}
              />
            )}
          />
        </TableCell>
        <TableCell align="center">
          {materials.length > 0 && (
            <Controller
              control={control}
              name={`paths.${index}.material_id`}
              render={({ field: { value, onChange } }) => (
                <TextField
                  sx={{ width: "200px" }}
                  variant="standard"
                  select
                  value={value || ""}
                  onChange={(event) => {
                    onChange(event.target.value);
                  }}
                >
                  {materials.map((_material) => (
                    <MenuItem key={_material.id} value={_material.id}>
                      {_material.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}
        </TableCell>
        <TableCell align="center">
          {diameters.length > 0 && (
            <Controller
              control={control}
              name={`paths.${index}.diameter_id`}
              render={({ field: { value, onChange } }) => (
                <TextField
                  sx={{ width: "200px" }}
                  variant="standard"
                  select
                  value={value || ""}
                  onChange={(event) => {
                    onChange(event.target.value);
                  }}
                >
                  {diameters.map((_diameter) => (
                    <MenuItem
                      key={_diameter.id}
                      value={_diameter.id}
                      sx={{
                        display:
                          _diameter.material === material_id ? "" : "none",
                      }}
                    >
                      {_diameter.name} ({_diameter.internal_diameter} mm)
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}
        </TableCell>
        <TableCell align="center">
          <TextField
            sx={{ width: "100px" }}
            variant="standard"
            inputProps={{
              style: { textAlign: "center" },
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">m</InputAdornment>,
            }}
            {...register(`paths.${index}.length`)}
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
            {...register(`paths.${index}.level_difference`)}
          />
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <TextField
              disabled
              sx={{ width: "100px" }}
              variant="standard"
              inputProps={{ step: "0.01", style: { textAlign: "center" } }}
              value={equivalent_length || "0,00"}
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
      {has_fixture && fixture && <Fixture index={index} />}
    </>
  );
};

export default Path;
