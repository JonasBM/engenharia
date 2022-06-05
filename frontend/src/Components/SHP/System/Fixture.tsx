import {
  Checkbox,
  IconButton,
  InputAdornment,
  TableCell,
  TableRow,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { Delete } from "@mui/icons-material";
import React from "react";
import { actions } from "redux/shp";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
}));

const Fixture = ({ index }: { index: number }) => {
  const dispatch = useAppDispatch();
  const path = useAppSelector((state) => state.shpCalc.paths[index]);

  return (
    <StyledTableRow>
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
          value={path.fixture.end || ""}
          onChange={(event) => {
            dispatch(
              actions.setFixture([
                index,
                { end: event.target.value.toUpperCase() },
              ])
            );
          }}
        />
      </TableCell>
      <TableCell>
        <Checkbox
          checked={path.fixture.active || false}
          onChange={(event) => {
            dispatch(
              actions.setFixture([index, { active: event.target.checked }])
            );
          }}
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
          value={path.fixture.hose_internal_diameter || ""}
          onChange={(event) => {
            dispatch(
              actions.setFixture([
                index,
                { hose_internal_diameter: parseInt(event.target.value) },
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
          value={path.fixture.hose_length || ""}
          onChange={(event) => {
            dispatch(
              actions.setFixture([index, { hose_length: event.target.value }])
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
          value={path.fixture.level_difference || ""}
          onChange={(event) => {
            dispatch(
              actions.setFixture([
                index,
                { level_difference: event.target.value },
              ])
            );
          }}
        />
      </TableCell>
      <TableCell align="center">-</TableCell>
      <TableCell align="center">-</TableCell>
      <TableCell align="center">-</TableCell>
      <TableCell align="center">-</TableCell>
      <TableCell align="center">-</TableCell>
      <TableCell align="center">-</TableCell>
      <TableCell align="center">-</TableCell>
      {/* </TableRow>
          </TableBody>
        </Table>
      </TableCell> */}
    </StyledTableRow>
  );
};

export default Fixture;
