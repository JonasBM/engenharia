import { Add, Close, Save } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Toolbar,
} from "@mui/material";
import {
  Controller,
  UseFieldArrayAppend,
  useFormContext,
  useWatch,
} from "react-hook-form";
import React, { useEffect, useState } from "react";
import { SHPCalcState, getNewPath, initialState, setCalc } from "redux/shp";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { StyledTextField } from ".";
import { saveSHPCalc } from "utils";

const PathToolbar = ({
  append,
}: {
  append: UseFieldArrayAppend<SHPCalcState, "paths">;
}) => {
  const dispatch = useAppDispatch();
  const { control, getValues, setValue } = useFormContext<SHPCalcState>();
  const materials = useAppSelector((state) => state.shp.materials);
  const diameters = useAppSelector((state) =>
    [...state.shp.diameters].sort(
      (a, b) => a.internal_diameter - b.internal_diameter
    )
  );
  const material_id = useWatch({ control, name: "material_id" });
  const diameter_id = useWatch({ control, name: "diameter_id" });

  const [calcFile, setcalcFile] = useState<SHPCalcState>();

  useEffect(() => {
    if (!material_id && materials.length > 0) {
      setValue("material_id", materials[0].id);
    }
  }, [materials, material_id, setValue]);

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
        setValue("diameter_id", material.default_diameter);
      } else {
        setValue(
          "diameter_id",
          diameters.find((d) => d.material === material_id)?.id
        );
      }
    }
  }, [diameters, material_id, diameter_id, materials, setValue]);

  const handleLoadCalcFile = (file: Blob) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const _calcFile = JSON.parse(e.target.result.toString()) as SHPCalcState;
      if (
        _calcFile.fileinfo.type === "shp_calc" &&
        _calcFile.fileinfo.version.startsWith("1.0.")
      ) {
        setcalcFile(_calcFile);
      } else {
        let newLine = "\r\n";
        let message = "Problemas ao carregar o arquivo";
        message += newLine;
        message += `filetype: ${_calcFile.fileinfo.type}, expected: shp_calc`;
        message += newLine;
        message += `fileversion: ${_calcFile.fileinfo.version}, expected: 1.0.x`;
        alert(message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <AppBar position="static" color="secondary" sx={{ minWidth: 800 }}>
      <Toolbar variant="dense">
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
          width="100%"
        >
          {materials.length > 0 && (
            <Controller
              control={control}
              name="material_id"
              render={({ field: { value, onChange } }) => (
                <StyledTextField
                  sx={{ width: "200px" }}
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
                </StyledTextField>
              )}
            />
          )}
          {diameters.length > 0 && (
            <Controller
              control={control}
              name="diameter_id"
              render={({ field: { value, onChange } }) => (
                <StyledTextField
                  sx={{ width: "200px" }}
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
                </StyledTextField>
              )}
            />
          )}
          <Button
            startIcon={<Add />}
            onClick={() => {
              append(getNewPath(getValues()));
            }}
          >
            Trecho
          </Button>
          <Button
            color="error"
            onClick={() => {
              dispatch(setCalc({ ...initialState }));
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
                  //   dispatch(actions.setCalc(calcFile));
                  dispatch(setCalc(calcFile));
                  setcalcFile(undefined);
                }}
              >
                Carregar
              </Button>
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
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
              saveSHPCalc(getValues());
            }}
          >
            Baixar
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default PathToolbar;
