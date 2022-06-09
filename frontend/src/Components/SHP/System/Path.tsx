import { Add, Delete, DragIndicator } from "@mui/icons-material";
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
  useFormContext,
  useWatch,
} from "react-hook-form";
import { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import React, { useEffect, useState } from "react";
import { SHPCalcState, checkLetter } from "redux/shp";

import { FittingDiameterSerializer } from "api/types/shpTypes";
import Fixture from "./Fixture";
import { showDialogCalcFittings } from "./DialogFittings";
import { useAppSelector } from "redux/utils";

const Path = ({
  index,
  remove,
  provided,
  snapshot,
}: {
  index: number;
  remove: UseFieldArrayRemove;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}) => {
  const materials = useAppSelector((state) => state.shp.materials);
  const diameters = useAppSelector((state) => state.shp.diameters);
  const fittingDiameters = useAppSelector(
    (state) => state.shp.fittingDiameters
  );

  const { register, control, watch, setValue, getValues, reset } =
    useFormContext<SHPCalcState>();
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
  const extra_equivalent_length = useWatch({
    control,
    name: `paths.${index}.extra_equivalent_length`,
  });

  const [currentFittingDiameters, setCurrentFittingDiameters] = useState<
    FittingDiameterSerializer[]
  >([]);

  useEffect(() => {
    if (has_fixture === false) {
      setValue(`paths.${index}.fixture.active`, false);
    }
  }, [has_fixture, index, setValue]);

  useEffect(() => {
    setCurrentFittingDiameters(
      fittingDiameters.find((d) => d.material === material_id)
        ?.fitting_diameter_array
    );
  }, [fittingDiameters, material_id]);

  useEffect(() => {
    const _diameter = diameters.find((d) => d.id === diameter_id);
    if (
      materials &&
      diameters &&
      material_id &&
      _diameter?.material !== material_id
    ) {
      const material = materials.find((m) => m.id === material_id);
      if (material?.default_diameter) {
        setValue(`paths.${index}.diameter_id`, material.default_diameter);
      } else {
        setValue(
          `paths.${index}.diameter_id`,
          diameters.find((d) => d.material === material_id)?.id
        );
      }
    }
  }, [diameters, material_id, diameter_id, materials, setValue, index]);

  useEffect(() => {
    let newEquivalentLength =
      parseFloat(extra_equivalent_length?.toString()) || 0;
    for (const _fitting_id of fittings_ids) {
      const _fitting = currentFittingDiameters?.find(
        (fd) => fd.diameter === diameter_id && fd.fitting === _fitting_id
      );
      if (_fitting && _fitting.equivalent_length) {
        newEquivalentLength += parseFloat(
          _fitting.equivalent_length.toString()
        );
      }
    }
    setValue(`paths.${index}.equivalent_length`, newEquivalentLength);
  }, [
    currentFittingDiameters,
    diameter_id,
    extra_equivalent_length,
    fittings_ids,
    index,
    setValue,
  ]);

  return (
    <>
      <TableRow ref={provided.innerRef} {...provided.draggableProps}>
        <TableCell>
          <IconButton
            sx={{ visibility: start === "RES" ? "hidden" : "visible" }}
            {...provided.dragHandleProps}
          >
            <DragIndicator />
          </IconButton>
        </TableCell>
        <TableCell>
          <IconButton
            sx={{ visibility: start === "RES" ? "hidden" : "visible" }}
            onClick={() => {
              remove(index);
              reset(getValues());
            }}
          >
            <Delete />
          </IconButton>
        </TableCell>
        <TableCell>
          <Controller
            name={`paths.${index}.start`}
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                sx={{ width: "40px" }}
                variant="standard"
                disabled={start === "RES"}
                inputProps={{
                  style: { textAlign: "center" },
                }}
                value={value || ""}
                onChange={(event) => {
                  if (checkLetter(event.target.value)) {
                    onChange(event.target.value);
                  }
                }}
              />
            )}
          />
        </TableCell>
        <TableCell>
          <Controller
            name={`paths.${index}.end`}
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                sx={{
                  width: "40px",
                  visibility: has_fixture ? "hidden" : "visible",
                }}
                variant="standard"
                inputProps={{
                  style: { textAlign: "center" },
                }}
                value={value || ""}
                onChange={(event) => {
                  if (checkLetter(event.target.value)) {
                    onChange(event.target.value);
                  }
                }}
              />
            )}
          />
        </TableCell>
        <TableCell>
          <Controller
            name={`paths.${index}.has_fixture`}
            control={control}
            render={({ field: { value, onChange } }) => (
              <Checkbox
                checked={value || false}
                onChange={(event) => onChange(event.target.checked)}
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
            type="number"
            sx={{ width: "100px" }}
            variant="standard"
            inputProps={{
              step: "0.01",
              style: { textAlign: "center" },
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">m</InputAdornment>,
            }}
            {...register(`paths.${index}.length`)}
          />
        </TableCell>
        <TableCell align="center">
          <TextField
            type="number"
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
              type="number"
              disabled
              sx={{ width: "100px" }}
              variant="standard"
              inputProps={{ style: { textAlign: "center" } }}
              value={equivalent_length?.toFixed(2) || "0,00"}
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
      {has_fixture && fixture && (
        <Fixture index={index} isDragging={snapshot.isDragging} />
      )}
    </>
  );
};

export default Path;
