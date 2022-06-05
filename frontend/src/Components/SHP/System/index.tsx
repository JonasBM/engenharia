import { Add, Calculate } from "@mui/icons-material";
import {
  AppBar,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  alpha,
  styled,
  tableBodyClasses,
  tableCellClasses,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { DiameterSerializer } from "api/types/shpTypes";
import Path from "./Path";
import { actions } from "redux/shp";
import { documentTitles } from "myConstants";

const StyledTable = styled(Table)(({ theme }) => ({
  [`.${tableCellClasses.head}`]: { fontWeight: "bold" },
  [`.${tableCellClasses.root}`]: {
    paddingLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.25),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  [`.${tableBodyClasses.root} .${tableCellClasses.root}`]: {
    paddingTop: theme.spacing(0.25),
    paddingBottom: theme.spacing(0.25),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.3),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.5),
  },
  margin: theme.spacing(1),
}));

const SHP = () => {
  const dispatch = useAppDispatch();
  const shpCalc = useAppSelector((state) => state.shpCalc);
  const materials = useAppSelector((state) => state.shp.materials);
  const fixtures = useAppSelector((state) => state.shp.fixtures);
  const diameters = useAppSelector((state) => state.shp.diameters);

  const [currentDiameters, setCurrentDiameters] = useState<
    DiameterSerializer[]
  >([]);

  useEffect(() => {
    setCurrentDiameters((_) => {
      const current = diameters
        .filter((d) => d.material === shpCalc.material_id)
        .sort((a, b) => a.internal_diameter - b.internal_diameter);
      return current;
    });
  }, [diameters, dispatch, shpCalc.material_id]);

  useEffect(() => {
    if (materials.length > 0) {
      if (shpCalc.material_id === undefined || shpCalc.material_id === null) {
        dispatch(actions.setMaterial(materials[0].id));
      }
    }
  }, [dispatch, materials, shpCalc.material_id]);

  useEffect(() => {
    if (fixtures.length > 0) {
      if (shpCalc.fixture_id === undefined || shpCalc.fixture_id === null) {
        dispatch(actions.setCalcFixture(fixtures[0].id));
      }
    }
  }, [dispatch, fixtures, shpCalc.fixture_id]);

  useEffect(() => {
    if (currentDiameters.length > 0) {
      const currentDiameter = currentDiameters.find(
        (d) => d.id === shpCalc.diameter_id
      );
      if (!currentDiameter) {
        dispatch(actions.setDiameter(currentDiameters[0].id));
      }
    }
  }, [currentDiameters, dispatch, shpCalc.diameter_id]);

  useEffect(() => {
    document.title = "Cálculo de SHP";
    return () => {
      document.title = documentTitles.PORTAL;
    };
  }, []);

  // const onSubmit = async (data: SHPSystem) => {
  //   console.log(data);
  // };

  return (
    <Container sx={{ marginTop: 3, marginBottom: 5 }} maxWidth="xl">
      <AppBar position="static" color="secondary">
        <Toolbar variant="dense">
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1}
          >
            {materials.length > 0 && (
              <StyledTextField
                sx={{ width: "200px" }}
                select
                value={shpCalc.material_id || ""}
                onChange={(event) => {
                  dispatch(actions.setMaterial(parseInt(event.target.value)));
                }}
              >
                {materials.map((_material) => (
                  <MenuItem key={_material.id} value={_material.id}>
                    {_material.name}
                  </MenuItem>
                ))}
              </StyledTextField>
            )}
            {currentDiameters.length > 0 && (
              <StyledTextField
                sx={{ width: "200px" }}
                select
                value={
                  currentDiameters.find((d) => d.id === shpCalc.diameter_id)
                    ?.id || ""
                }
                onChange={(event) => {
                  dispatch(actions.setDiameter(parseInt(event.target.value)));
                }}
              >
                {currentDiameters.map((_diameter) => (
                  <MenuItem key={_diameter.id} value={_diameter.id}>
                    {_diameter.name} ({_diameter.internal_diameter} mm)
                  </MenuItem>
                ))}
              </StyledTextField>
            )}
            <Button
              startIcon={<Add />}
              onClick={() => {
                dispatch(actions.setPath([-1, null]));
              }}
            >
              Trecho
            </Button>

            {fixtures.length > 0 && (
              <StyledTextField
                sx={{ width: "300px" }}
                select
                value={shpCalc.fixture_id || ""}
                onChange={(event) => {
                  dispatch(
                    actions.setCalcFixture(parseInt(event.target.value))
                  );
                }}
              >
                {fixtures.map((_fixture) => (
                  <MenuItem key={_fixture.id} value={_fixture.id}>
                    {_fixture.name}
                  </MenuItem>
                ))}
              </StyledTextField>
            )}
            <Button
              color="success"
              startIcon={<Calculate />}
              onClick={() => {
                console.log("calcular");
              }}
            >
              Calcular
            </Button>
            <Button
              color="error"
              onClick={() => {
                dispatch(actions.reset());
              }}
            >
              Limpar
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <TableContainer component={Paper}>
        <StyledTable
          sx={{ minWidth: 650 }}
          size="small"
          aria-label="a dense table"
        >
          <TableHead>
            <TableRow>
              <TableCell align="center" />
              <TableCell align="center" width={"50px"} colSpan={2}>
                TRECHO
              </TableCell>
              <TableCell align="center" width={"30px"}>
                H
              </TableCell>
              <TableCell align="center" width={"100px"}>
                Material
              </TableCell>
              <TableCell align="center">&empty;</TableCell>
              <TableCell align="center">Comprimento</TableCell>
              <TableCell align="center">Desnível</TableCell>
              <TableCell align="center">Equivalente</TableCell>
              <TableCell align="center">Vazão L/min</TableCell>
              <TableCell align="center">Velocidade m/s</TableCell>
              <TableCell align="center">Comprimento Total</TableCell>
              <TableCell align="center">Jt</TableCell>
              <TableCell align="center">&Delta;t</TableCell>
              <TableCell align="center">M.C.A.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shpCalc.paths.map((path, index) => (
              <Path key={index} index={index} />
            ))}
          </TableBody>
        </StyledTable>
      </TableContainer>
    </Container>
  );
};

export default SHP;
