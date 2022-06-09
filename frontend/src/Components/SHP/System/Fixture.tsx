import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Delete, DragIndicator } from "@mui/icons-material";
import {
  IconButton,
  InputAdornment,
  Switch,
  TableCell,
  TableRow,
  TextField,
  Typography,
  alpha,
  styled,
} from "@mui/material";
import { SHPCalcState, checkLetter } from "redux/shp";

import React from "react";

const StyledTableRow = styled(TableRow)<{ active: string }>(
  ({ theme, active }) => ({
    backgroundColor:
      active === "true"
        ? alpha(theme.palette.success.light, 0.3)
        : theme.palette.action.hover,
  })
);

const Fixture = ({
  index,
  isDragging,
}: {
  index: number;
  isDragging: boolean;
}) => {
  const { register, control } = useFormContext<SHPCalcState>();
  const active = useWatch({ control, name: `paths.${index}.fixture.active` });

  return (
    <StyledTableRow
      sx={{ visibility: isDragging ? "hidden" : "visible" }}
      active={active ? "true" : "false"}
    >
      <TableCell>
        <IconButton sx={{ visibility: "hidden" }}>
          <DragIndicator />
        </IconButton>
      </TableCell>
      <TableCell>
        <IconButton sx={{ visibility: "hidden" }}>
          <Delete />
        </IconButton>
      </TableCell>
      <TableCell>
        <Typography width="30px" textAlign="center" fontWeight="bold">
          &#x2517;
        </Typography>
      </TableCell>
      <TableCell>
        <Controller
          name={`paths.${index}.fixture.end`}
          control={control}
          render={({ field: { value, onChange } }) => (
            <TextField
              sx={{ width: "40px" }}
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
          name={`paths.${index}.fixture.active`}
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
            />
          )}
        />
      </TableCell>
      <TableCell align="center">-</TableCell>
      <TableCell align="center">-</TableCell>
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
          {...register(`paths.${index}.fixture.hose_length`)}
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
          {...register(`paths.${index}.fixture.level_difference`)}
        />
      </TableCell>
      <TableCell align="center">-</TableCell>
      <TableCell align="center">-</TableCell>
      <TableCell align="center">-</TableCell>
      <TableCell align="center">-</TableCell>
      <TableCell align="center">-</TableCell>
      <TableCell align="center">-</TableCell>
      <TableCell align="center">-</TableCell>
    </StyledTableRow>
  );
};

export default Fixture;
