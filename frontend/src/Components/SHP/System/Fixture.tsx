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

import React from "react";
import { SHPCalcState } from "redux/shp";

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
        <TextField
          sx={{ width: "30px" }}
          variant="standard"
          inputProps={{
            style: { textAlign: "center" },
          }}
          {...register(`paths.${index}.fixture.end`)}
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
      <TableCell align="center">
        <TextField
          sx={{ width: "100px" }}
          variant="standard"
          inputProps={{
            step: "0.01",
            style: { textAlign: "center" },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">&empty;</InputAdornment>
            ),
            endAdornment: <InputAdornment position="end">mm</InputAdornment>,
          }}
          {...register(`paths.${index}.fixture.hose_internal_diameter`)}
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
