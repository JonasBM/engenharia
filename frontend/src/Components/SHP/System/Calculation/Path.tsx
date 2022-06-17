import { Add, Delete, DragIndicator, Info } from "@mui/icons-material";
import {
  Box,
  Checkbox,
  IconButton,
  InputAdornment,
  MenuItem,
  Popover,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import {
  CalcType,
  FittingDiameterSerializer,
  FixtureSerializer,
  PressureType,
  SHPCalcSerializer,
} from "api/types/shpTypes";
import {
  Controller,
  UseFieldArrayRemove,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import React, { useEffect, useState } from "react";

import ConnectionsPopover from "./ConnectionsPopover";
import Fixture from "./Fixture";
import { StyledTableCellBorderLeft } from ".";
import { checkLetter } from "redux/shp";
import { decimalFormatter } from "utils";
import { flow_to_l_p_min } from "./utils";
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
  const fixtures = useAppSelector((state) => state.shp.fixtures);
  const fittingDiameters = useAppSelector(
    (state) => state.shp.fittingDiameters
  );

  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useFormContext<SHPCalcSerializer>();
  const material_id = useWatch({ control, name: `paths.${index}.material_id` });
  const diameter_id = watch(`paths.${index}.diameter_id`);
  const start = useWatch({ control, name: `paths.${index}.start` });
  const calc_type = useWatch({ control, name: `calc_type` });
  const pressure_type = useWatch({ control, name: `pressure_type` });
  const has_fixture = useWatch({ control, name: `paths.${index}.has_fixture` });
  const fixture = useWatch({ control, name: `paths.${index}.fixture` });
  const fixture_id = useWatch({ control, name: `fixture_id` });
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

  const [currentFixture, setCurrentFixture] = useState<FixtureSerializer>();

  const [anchorPopover, setAnchorPopover] =
    React.useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (fixture_id) {
      setCurrentFixture(fixtures.find((f) => f.id === fixture_id));
    }
  }, [fixture_id, fixtures]);

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
    if (materials?.length > 0 && !material_id) {
      setValue(`paths.${index}.material_id`, materials[0].id);
    }
  }, [material_id, materials, setValue, index]);

  useEffect(() => {
    const _diameter = diameters.find((d) => d.id === diameter_id);
    if (
      materials &&
      materials.length > 0 &&
      diameters &&
      diameters.length > 0 &&
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
    if (fittings_ids?.length > 0) {
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
            title="Mover trecho"
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
            title="Remover trecho"
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
                  const string = event.target.value.toUpperCase();
                  if (checkLetter(string)) {
                    onChange(string);
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
                  const string = event.target.value.toUpperCase();
                  if (checkLetter(string)) {
                    onChange(string);
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
                sx={{ visibility: start === "RES" ? "hidden" : "visible" }}
                checked={value || false}
                onChange={(event) => {
                  if (event.target.checked) {
                    setValue(
                      `paths.${index}.material_id`,
                      currentFixture.material
                    );
                    setValue(
                      `paths.${index}.diameter_id`,
                      currentFixture.inlet_diameter
                    );
                  }
                  onChange(event.target.checked);
                }}
                title={`${
                  has_fixture ? "Remover" : "Adicionar"
                } hidrante do trecho`}
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
                  sx={{ width: 200 }}
                  variant="standard"
                  select
                  value={value || ""}
                  onChange={(event) => {
                    onChange(event.target.value);
                  }}
                  disabled={has_fixture}
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
                  sx={{ width: 150 }}
                  variant="standard"
                  select
                  value={value || ""}
                  onChange={(event) => {
                    onChange(event.target.value);
                  }}
                  disabled={has_fixture}
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
            error={errors?.paths?.[index]?.length ? true : false}
            helperText={errors?.paths?.[index]?.length?.message}
            {...register(`paths.${index}.length`)}
          />
        </TableCell>
        <TableCell align="center">
          <TextField
            type="number"
            sx={{ width: "100px" }}
            variant="standard"
            inputProps={
              start === "RES" &&
              calc_type === CalcType.VAZAO_MINIMA.value &&
              pressure_type === PressureType.GRAVITACIONAL.value
                ? {
                    step: "0.01",
                    style: {
                      textAlign: "center",
                      color: "green",
                      fontWeight: "bold",
                    },
                    disabled: true,
                  }
                : {
                    step: "0.01",
                    style: {
                      textAlign: "center",
                    },
                  }
            }
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
                showDialogCalcFittings(index);
              }}
              title="Alterar conexões no trecho"
            >
              <Add />
            </IconButton>
          </Box>
        </TableCell>
        <StyledTableCellBorderLeft align="center">
          {decimalFormatter(
            flow_to_l_p_min(getValues(`paths.${index}.flow`)),
            2
          ) || "-"}
        </StyledTableCellBorderLeft>
        <StyledTableCellBorderLeft align="center">
          {decimalFormatter(getValues(`paths.${index}.speed`), 2) || "-"}
        </StyledTableCellBorderLeft>
        <StyledTableCellBorderLeft align="right">
          {decimalFormatter(getValues(`paths.${index}.total_length`), 2) || "-"}
          <IconButton
            sx={{ marginLeft: 1 }}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              setAnchorPopover(event.currentTarget);
            }}
            title={"Lista de conexões"}
            size={"small"}
          >
            <Info color={"secondary"} />
          </IconButton>
          <Popover
            open={Boolean(anchorPopover) && !snapshot.isDragging}
            anchorEl={anchorPopover}
            onClose={() => {
              setAnchorPopover(null);
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <ConnectionsPopover
              connectionNames={getValues(`paths.${index}.connection_names`)}
            />
          </Popover>
        </StyledTableCellBorderLeft>
        <StyledTableCellBorderLeft align="center">
          {decimalFormatter(
            getValues(`paths.${index}.unit_pressure_drop`),
            4
          ) || "-"}
        </StyledTableCellBorderLeft>
        <StyledTableCellBorderLeft align="center">
          {decimalFormatter(getValues(`paths.${index}.pressure_drop`), 3) ||
            "-"}
        </StyledTableCellBorderLeft>
        <StyledTableCellBorderLeft align="center">
          {decimalFormatter(getValues(`paths.${index}.end_pressure`), 3) || "-"}
        </StyledTableCellBorderLeft>
      </TableRow>
      {has_fixture && fixture && (
        <Fixture index={index} isDragging={snapshot.isDragging} />
      )}
    </>
  );
};

export default Path;
