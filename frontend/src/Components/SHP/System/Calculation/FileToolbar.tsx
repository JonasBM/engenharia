import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Toolbar,
} from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import React, { useState } from "react";

import { SHPCalcSerializer } from "api/types/shpTypes";
import { saveFileSHPCalc } from "./utils";
import { setCalc } from "redux/shp";
import { useAppDispatch } from "redux/utils";
import { useFormContext } from "react-hook-form";

const FileToolbar = () => {
  const dispatch = useAppDispatch();
  const {
    getValues,
    register,
    formState: { errors },
  } = useFormContext<SHPCalcSerializer>();

  const [calcFile, setcalcFile] = useState<SHPCalcSerializer>();

  const handleLoadCalcFile = (file: Blob) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const _calcFile = JSON.parse(
        e.target?.result?.toString() || ""
      ) as SHPCalcSerializer;
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
    <Toolbar sx={{ minWidth: 800 }}>
      <Stack direction="row" alignItems="center" spacing={3} width="100%">
        <TextField
          label="Nome"
          sx={{ width: 400 }}
          InputLabelProps={{ shrink: true }}
          error={errors.name ? true : false}
          helperText={errors.name?.message}
          {...register("name")}
        />
        <TextField
          label="Observação (multilinha)"
          multiline
          sx={{ width: 400 }}
          InputLabelProps={{ shrink: true }}
          error={errors.observation ? true : false}
          helperText={errors.observation?.message}
          {...register("observation")}
        />
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
                dispatch(setCalc(calcFile));
                setcalcFile(undefined);
              }}
              title="Salvar cálculo carregado"
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
          <Button
            variant="contained"
            component="label"
            title="Carregar arquivo de cálculo do SHP"
          >
            Carregar Cálculo
            <input
              type="file"
              accept=".shpcalc"
              hidden
              onChange={(e) => {
                if (e.target.files) {
                  handleLoadCalcFile(e.target.files[0]);
                }
              }}
            />
          </Button>
        )}
        <Button
          startIcon={<Save />}
          onClick={() => {
            saveFileSHPCalc(getValues());
          }}
          title="Salvar arquivo de cálculo do SHP"
        >
          Baixar
        </Button>
      </Stack>
    </Toolbar>
  );
};

export default FileToolbar;
