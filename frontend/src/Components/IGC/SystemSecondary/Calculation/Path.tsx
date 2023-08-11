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
import { FittingDiameterSerializer, GASSerializer, IGCCalcSerializer } from "api/types/igcTypes";
import { Controller, UseFieldArrayRemove, useFormContext, useWatch } from "react-hook-form";
import { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import React, { useEffect, useState } from "react";

import ConnectionsPopover from "./ConnectionsPopover";
import { StyledTableCellBorderLeft } from ".";
import { checkLetter } from "redux/igcSecondary";
import { decimalFormatter } from "utils";
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
  const materials = useAppSelector((state) => state.igc.materials);
  const diameters = useAppSelector((state) => state.igc.diameters);
  const gases = useAppSelector((state) => state.igc.gases);
  const fittingDiameters = useAppSelector((state) => state.igc.fittingDiameters);

  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useFormContext<IGCCalcSerializer>();
  const material_id = useWatch({ control, name: `paths.${index}.material_id` });
  const diameter_id = watch(`paths.${index}.diameter_id`);
  const start = useWatch({ control, name: `paths.${index}.start` });
  const fittings_ids = watch(`paths.${index}.fittings_ids`);

  const equivalent_length = useWatch({
    control,
    name: `paths.${index}.equivalent_length`,
  });
  const extra_equivalent_length = useWatch({
    control,
    name: `paths.${index}.extra_equivalent_length`,
  });

  const [currentFittingDiameters, setCurrentFittingDiameters] = useState<FittingDiameterSerializer[]>([]);
  const [currentFixture, setCurrentFixture] = useState<GASSerializer>();
  const [anchorPopover, setAnchorPopover] = React.useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    setCurrentFittingDiameters(fittingDiameters.find((d) => d.material === material_id)?.fitting_diameter_array || []);
  }, [fittingDiameters, material_id]);

  useEffect(() => {
    if (materials?.length > 0 && !material_id) {
      setValue(`paths.${index}.material_id`, materials[0].id || null);
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
        setValue(`paths.${index}.diameter_id`, diameters.find((d) => d.material === material_id)?.id || null);
      }
    }
  }, [diameters, material_id, diameter_id, materials, setValue, index]);

  useEffect(() => {
    let newEquivalentLength = parseFloat(extra_equivalent_length?.toString() || "0");
    if (fittings_ids && fittings_ids?.length > 0) {
      for (const _fitting_id of fittings_ids) {
        const _fitting = currentFittingDiameters?.find(
          (fd) => fd.diameter === diameter_id && fd.fitting === _fitting_id
        );
        if (_fitting && _fitting.equivalent_length) {
          newEquivalentLength += parseFloat(_fitting.equivalent_length.toString());
        }
      }
    }
    setValue(`paths.${index}.equivalent_length`, newEquivalentLength);
  }, [currentFittingDiameters, diameter_id, extra_equivalent_length, fittings_ids, index, setValue]);

  return (
    <>
      <TableRow ref={provided.innerRef} {...provided.draggableProps}>
        <TableCell>
          <IconButton
            sx={{ visibility: start === "CG" ? "hidden" : "visible" }}
            {...provided.dragHandleProps}
            title="Mover trecho"
          >
            <DragIndicator />
          </IconButton>
        </TableCell>
        <TableCell>
          <IconButton
            sx={{ visibility: start === "CG" ? "hidden" : "visible" }}
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
                disabled={start === "CG"}
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
        <TableCell align="center">
          {materials.length > 0 && (
            <Controller
              control={control}
              name={`paths.${index}.material_id`}
              render={({ field: { value, onChange } }) => (
                <TextField
                  sx={{ width: 150 }}
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
                  sx={{ width: 100 }}
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
                        display: _diameter.material === material_id ? "" : "none",
                      }}
                    >
                      {_diameter.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}
        </TableCell>

        <StyledTableCellBorderLeft align="center">
          <TextField
            type="number"
            sx={{ width: "100px" }}
            variant="standard"
            inputProps={{
              step: "0.01",
              style: { textAlign: "center" },
            }}
            error={errors?.paths?.[index]?.power_rating_added ? true : false}
            helperText={errors?.paths?.[index]?.power_rating_added?.message}
            {...register(`paths.${index}.power_rating_added`)}
          />
        </StyledTableCellBorderLeft>
        <TableCell align="center" sx={{ minWidth: "80px" }}>
          {decimalFormatter(getValues(`paths.${index}.power_rating_accumulated`), 0) || "-"}
        </TableCell>

        <StyledTableCellBorderLeft align="center">
          <TextField
            type="number"
            sx={{ width: "80px" }}
            variant="standard"
            inputProps={{
              step: "0.01",
              style: { textAlign: "center" },
            }}
            error={errors?.paths?.[index]?.length ? true : false}
            helperText={errors?.paths?.[index]?.length?.message}
            {...register(`paths.${index}.length`)}
          />
        </StyledTableCellBorderLeft>
        <TableCell align="center">
          <TextField
            type="number"
            sx={{ width: "60px" }}
            variant="standard"
            inputProps={{
              step: "0.01",
              style: { textAlign: "center" },
            }}
            error={errors?.paths?.[index]?.length_up ? true : false}
            helperText={errors?.paths?.[index]?.length_up?.message}
            {...register(`paths.${index}.length_up`)}
          />
        </TableCell>
        <TableCell align="center">
          <TextField
            type="number"
            sx={{ width: "60px" }}
            variant="standard"
            inputProps={{
              step: "0.01",
              style: { textAlign: "center" },
            }}
            error={errors?.paths?.[index]?.length_down ? true : false}
            helperText={errors?.paths?.[index]?.length_down?.message}
            {...register(`paths.${index}.length_down`)}
          />
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <TextField
              type="number"
              disabled
              sx={{ width: "80px" }}
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
        <StyledTableCellBorderLeft align="right" sx={{ minWidth: "100px" }}>
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
            <ConnectionsPopover connectionNames={getValues(`paths.${index}.connection_names`) || []} />
          </Popover>
        </StyledTableCellBorderLeft>

        <StyledTableCellBorderLeft align="center" sx={{ minWidth: "60px" }}>
          {decimalFormatter(getValues(`paths.${index}.flow`), 2) || "-"}
        </StyledTableCellBorderLeft>
        <StyledTableCellBorderLeft align="center" sx={{ minWidth: "60px" }}>
          {decimalFormatter(getValues(`paths.${index}.speed`), 2) || "-"}
        </StyledTableCellBorderLeft>

        <StyledTableCellBorderLeft align="center" sx={{ minWidth: "60px" }}>
          {decimalFormatter(getValues(`paths.${index}.start_pressure`), 2) || "-"}
        </StyledTableCellBorderLeft>
        <StyledTableCellBorderLeft
          align="center"
          sx={{ minWidth: "60px", color: getValues(`paths.${index}.pressure_drop_color`) || null }}
          title={getValues(`paths.${index}.fail_level`)?.toString()}
        >
          {decimalFormatter(getValues(`paths.${index}.pressure_drop`), 2) || "-"}
        </StyledTableCellBorderLeft>
        <StyledTableCellBorderLeft align="center" sx={{ minWidth: "60px" }}>
          {decimalFormatter(getValues(`paths.${index}.end_pressure`), 2) || "-"}
        </StyledTableCellBorderLeft>

        <StyledTableCellBorderLeft
          align="center"
          sx={{ minWidth: "60px", color: getValues(`paths.${index}.pressure_drop_accumulated_color`) || null }}
        >
          {decimalFormatter((getValues(`paths.${index}.pressure_drop_accumulated`) || 0) * 100, 2) || "-"}
        </StyledTableCellBorderLeft>
      </TableRow>
    </>
  );
};

export default Path;
