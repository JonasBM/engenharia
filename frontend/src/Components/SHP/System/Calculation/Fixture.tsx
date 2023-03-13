import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Delete, DragIndicator, Info } from "@mui/icons-material";
import {
  IconButton,
  InputAdornment,
  Popover,
  Switch,
  TableCell,
  TableRow,
  TextField,
  Typography,
  alpha,
  styled,
} from "@mui/material";

import ConnectionsPopover from "./ConnectionsPopover";
import React from "react";
import { SHPCalcSerializer } from "api/types/shpTypes";
import { StyledTableCellBorderLeft } from ".";
import { checkLetter } from "redux/shp";
import { decimalFormatter } from "utils";
import { flow_to_l_p_min } from "./utils";

const StyledTableRow = styled(TableRow)<{
  active: string;
  lessfavorable: string;
}>(({ theme, active, lessfavorable }) => ({
  backgroundColor:
    active === "true"
      ? lessfavorable === "true"
        ? alpha(theme.palette.success.main, 0.7)
        : alpha(theme.palette.success.light, 0.3)
      : theme.palette.action.hover,
}));

const Fixture = ({ index, isDragging }: { index: number; isDragging: boolean }) => {
  const { register, control, getValues } = useFormContext<SHPCalcSerializer>();
  const active = useWatch({ control, name: `paths.${index}.fixture.active` });
  const less_favorable_path_fixture_index = useWatch({
    control,
    name: `less_favorable_path_fixture_index`,
  });

  const [anchorPopover, setAnchorPopover] = React.useState<HTMLButtonElement | null>(null);

  return (
    <StyledTableRow
      sx={{ visibility: isDragging ? "hidden" : "visible" }}
      active={active ? "true" : "false"}
      lessfavorable={index === less_favorable_path_fixture_index ? "true" : "false"}
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
          name={`paths.${index}.fixture.active`}
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch
              size="small"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              title={`${active ? "Desativar" : "Ativar"} hidrante`}
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
      <StyledTableCellBorderLeft align="center">
        {decimalFormatter(flow_to_l_p_min(getValues(`paths.${index}.fixture.flow`)), 2) || "-"}
      </StyledTableCellBorderLeft>
      <StyledTableCellBorderLeft align="center">-</StyledTableCellBorderLeft>
      <StyledTableCellBorderLeft align="right">
        {decimalFormatter(getValues(`paths.${index}.fixture.total_length`), 2) || "-"}
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
          open={Boolean(anchorPopover) && !isDragging}
          anchorEl={anchorPopover}
          onClose={() => {
            setAnchorPopover(null);
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <ConnectionsPopover connectionNames={getValues(`paths.${index}.fixture.connection_names`) || []} />
        </Popover>
      </StyledTableCellBorderLeft>
      <StyledTableCellBorderLeft align="center">
        <span title="Perda de carga unitária no hidrante">
          {decimalFormatter(getValues(`paths.${index}.fixture.unit_pressure_drop`), 6) || "-"}
        </span>
        <br />
        <span title="Perda de carga unitária na mangueira">
          {decimalFormatter(getValues(`paths.${index}.fixture.unit_hose_pressure_drop`), 6) || "-"}
        </span>
        <br />
        {"-"}
      </StyledTableCellBorderLeft>
      <StyledTableCellBorderLeft align="center">
        <span title="Perda de carga no hidrante">
          {decimalFormatter(getValues(`paths.${index}.fixture.pressure_drop`), 4) || "-"}
        </span>
        <br />
        <span title="Perda de carga na mangueira">
          {decimalFormatter(getValues(`paths.${index}.fixture.hose_pressure_drop`), 4) || "-"}
        </span>
        <br />
        <span title="Perda de carga no esguicho">
          {decimalFormatter(getValues(`paths.${index}.fixture.nozzle_pressure_drop`), 4) || "-"}
        </span>
      </StyledTableCellBorderLeft>
      <StyledTableCellBorderLeft align="center">
        {decimalFormatter(getValues(`paths.${index}.fixture.end_pressure`), 4) || "-"}
      </StyledTableCellBorderLeft>
    </StyledTableRow>
  );
};

export default Fixture;
