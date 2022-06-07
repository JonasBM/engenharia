import { Add, Calculate, Close, Save } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
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
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { SHPCalcState, SHPCalcType, actions, shpCalcTypes } from "redux/shp";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { DiameterSerializer } from "api/types/shpTypes";
import Path from "./Path";
import { documentTitles } from "myConstants";
import { saveSHPCalc } from "utils";

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

  const formMethods = useForm<SHPCalcState>({
    defaultValues: shpCalc,
  });

  const [currentDiameters, setCurrentDiameters] = useState<
    DiameterSerializer[]
  >([]);

  const [calcFile, setcalcFile] = useState<SHPCalcState>();

  useEffect(() => {
    setCurrentDiameters((_) => {
      const current = diameters
        .filter((d) => d.material === material_id)
        .sort((a, b) => a.internal_diameter - b.internal_diameter);
      return current;
    });
  }, [diameters, dispatch, material_id]);

  useEffect(() => {
    if (materials.length > 0) {
      if (material_id === undefined || material_id === null) {
        dispatch(actions.setMaterial(materials[0].id));
      }
    }
  }, [dispatch, materials, material_id]);

  useEffect(() => {
    if (fixtures.length > 0) {
      if (fixture_id === undefined || fixture_id === null) {
        dispatch(actions.setCalcFixture(fixtures[0].id));
      }
    }
  }, [dispatch, fixtures, fixture_id]);

  useEffect(() => {
    if (currentDiameters.length > 0) {
      const currentDiameter = currentDiameters.find(
        (d) => d.id === diameter_id
      );
      if (!currentDiameter) {
        dispatch(actions.setDiameter(currentDiameters[0].id));
      }
    }
  }, [currentDiameters, dispatch, diameter_id]);

  useEffect(() => {
    document.title = "Cálculo de SHP";
    return () => {
      document.title = documentTitles.PORTAL;
    };
  }, []);

  const handleLoadCalcFile = (file: Blob) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const _calcFile = JSON.parse(e.target.result.toString()) as SHPCalcState;
      if (
        _calcFile.fileinfo.type === "shp_calc" &&
        _calcFile.fileinfo.version.startsWith("1.0.")
      ) {
        setcalcFile(_calcFile);
      }
    };
    reader.readAsText(file);
  };

  const onSubmit = async (data: SHPCalcState) => {
    console.log(data);
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Container maxWidth="xl">
          <Toolbar>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={1}
              width="100%"
            >
              <StyledTextField
                label="Nome"
                sx={{ width: 300 }}
                {...formMethods.register("name")}
                // value={name}
                // onChange={(e) => {
                //   dispatch(actions.setName(e.target.value));
                // }}
              />
              {fixtures.length > 0 && (
                <Controller
                  control={formMethods.control}
                  name="fixture_id"
                  render={({ field: { value, onChange } }) => (
                    <StyledTextField
                      label="Tipo de Hidrante"
                      sx={{ width: 300 }}
                      select
                      value={value || ""}
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}
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
                />
              )}

              <StyledTextField
                label="Tipo de cálculo"
                sx={{ width: 150, margin: 0 }}
                select
                value={type || ""}
                onChange={(event) => {
                  dispatch(actions.setType(event.target.value as SHPCalcType));
                }}
              >
                {shpCalcTypes.map((_shpCalcType) => (
                  <MenuItem key={_shpCalcType} value={_shpCalcType}>
                    {_shpCalcType}
                  </MenuItem>
                ))}
              </StyledTextField>
              {type === "bomba" && (
                <TextField
                  label="Nome do ponto da Bomba"
                  value={pump_node}
                  onChange={(e) => {
                    dispatch(actions.setPumpNode(e.target.value.toUpperCase()));
                  }}
                  fullWidth={false}
                />
              )}
              <Box sx={{ flexGrow: 1 }} />
              <Button
                color="success"
                startIcon={<Calculate />}
                onClick={() => {
                  console.log("calcular");
                }}
              >
                Calcular
              </Button>
            </Stack>
          </Toolbar>
          <AppBar position="static" color="secondary">
            <Toolbar variant="dense">
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
                width="100%"
              >
                {materials.length > 0 && (
                  <StyledTextField
                    sx={{ width: "200px" }}
                    select
                    value={material_id || ""}
                    onChange={(event) => {
                      dispatch(
                        actions.setMaterial(parseInt(event.target.value))
                      );
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
                      currentDiameters.find((d) => d.id === diameter_id)?.id ||
                      ""
                    }
                    onChange={(event) => {
                      dispatch(
                        actions.setDiameter(parseInt(event.target.value))
                      );
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
                <Button
                  color="error"
                  onClick={() => {
                    dispatch(actions.reset());
                  }}
                >
                  Limpar
                </Button>
                <Box sx={{ flexGrow: 1 }} />

                {calcFile ? (
                  <Paper
                    sx={{
                      p: "2px 4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <TextField
                      label="Cálculo carregado"
                      value={calcFile.name || "Cálculo de SHP"}
                      disabled
                      fullWidth={false}
                    />
                    <Button
                      sx={{ marginX: 1 }}
                      onClick={() => {
                        console.log(calcFile);
                        dispatch(actions.setCalc(calcFile));
                        setcalcFile(undefined);
                      }}
                    >
                      Carregar
                    </Button>
                    <Divider
                      sx={{ height: 28, m: 0.5 }}
                      orientation="vertical"
                    />
                    <IconButton
                      onClick={() => {
                        setcalcFile(undefined);
                      }}
                    >
                      <Close />
                    </IconButton>
                  </Paper>
                ) : (
                  <Button variant="contained" component="label">
                    Carregar Cálculo
                    <input
                      type="file"
                      accept=".shpcalc"
                      hidden
                      onChange={(e) => {
                        handleLoadCalcFile(e.target.files[0]);
                      }}
                    />
                  </Button>
                )}
                <Button
                  startIcon={<Save />}
                  onClick={() => {
                    saveSHPCalc();
                  }}
                >
                  Baixar
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
                {paths.map((path, index) => (
                  <Path key={index} index={index} />
                ))}
              </TableBody>
            </StyledTable>
          </TableContainer>
        </Container>
      </form>
    </FormProvider>
  );
};

export default SHP;
