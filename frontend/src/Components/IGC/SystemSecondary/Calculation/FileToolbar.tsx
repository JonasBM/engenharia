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

import { IGCCalcSerializer } from "api/types/igcTypes";
import { saveFileIGCCalc } from "./utils";
import { setCalc } from "redux/igcSecondary";
import { useAppDispatch } from "redux/utils";
import { useFormContext } from "react-hook-form";

const FileToolbar = () => {
  const dispatch = useAppDispatch();
  const {
    getValues,
    register,
    formState: { errors },
  } = useFormContext<IGCCalcSerializer>();

  const [calcFile, setcalcFile] = useState<IGCCalcSerializer>();

  const handleLoadCalcFile = (file: Blob) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const _calcFile = JSON.parse(
        e.target?.result?.toString() || ""
      ) as IGCCalcSerializer;
      if (
        _calcFile.fileinfo.type === "igc_secondary_calc" &&
        _calcFile.fileinfo.version.startsWith("1.0.")
      ) {
        setcalcFile(_calcFile);
      } else {
        let newLine = "\r\n";
        let message = "Problemas ao carregar o arquivo";
        message += newLine;
        message += `filetype: ${_calcFile.fileinfo.type}, expected: igc_secondary_calc`;
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
              value={calcFile.name || "Cálculo de IGC"}
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
            title="Carregar arquivo de cálculo do IGC"
          >
            Carregar Cálculo
            <input
              type="file"
              accept=".igcsccalc"
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
            saveFileIGCCalc(getValues());
          }}
          title="Salvar arquivo de cálculo do IGC"
        >
          Baixar
        </Button>
      </Stack>
    </Toolbar>
  );
};

export default FileToolbar;
