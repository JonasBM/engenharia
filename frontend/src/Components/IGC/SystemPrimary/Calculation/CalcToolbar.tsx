import { Box, Button, MenuItem, Stack, TextField, Toolbar } from "@mui/material";
import { IGCCalcSerializer } from "api/types/igcTypes";
import { Calculate, Print, Save } from "@mui/icons-material";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { StyledTextField } from ".";
import { downloadPDFAction } from "api/igc";
import { saveIGCCalc } from "./utils";

const CalcToolbar = () => {
  const dispatch = useAppDispatch();
  const gases = useAppSelector((state) => state.igc.gases);
  const signatories = useAppSelector((state) => state.core.signatories);
  const config = useAppSelector((state) => state.igc.configs[0]);

  const {
    control,
    register,
    reset,
    setValue,
    getValues,
    formState: { isDirty, errors },
  } = useFormContext<IGCCalcSerializer>();

  const gas_id = useWatch({
    control,
    name: "gas_id",
  });

  useEffect(() => {
    if (!gas_id && gases.length > 0 && config) {
      if (config.gas) {
        setValue("gas_id", config.gas);
      } else {
        setValue("gas_id", gases[0].id || null);
      }
    }
  }, [gases, gas_id, setValue, config]);

  const downloadPDF = (data: IGCCalcSerializer) => {
    dispatch(downloadPDFAction(saveIGCCalc(data)));
  };

  return (
    <Toolbar sx={{ minWidth: 800 }}>
      <Stack direction="row" alignItems="center" spacing={3} width="100%">
        {gases.length > 0 && (
          <Controller
            control={control}
            name="gas_id"
            render={({ field: { value, onChange } }) => (
              <StyledTextField
                label="Gás"
                sx={{ width: 300 }}
                select
                value={value || ""}
                onChange={(event) => {
                  onChange(event.target.value);
                }}
                error={errors.gas_id ? true : false}
                helperText={errors.gas_id?.message}
              >
                {gases.map((_gas) => (
                  <MenuItem key={_gas.id} value={_gas.id}>
                    {_gas.name}
                  </MenuItem>
                ))}
              </StyledTextField>
            )}
          />
        )}
        <TextField
          type="number"
          inputProps={{ step: "0.01" }}
          label="Pressão inicial (kPa)"
          sx={{ width: 200 }}
          error={errors.start_pressure ? true : false}
          helperText={errors.start_pressure?.message}
          {...register("start_pressure")}
        />
        {signatories.length > 0 && (
          <Controller
            control={control}
            name="signatory_id"
            render={({ field: { value, onChange } }) => (
              <StyledTextField
                label="Signatário"
                sx={{ width: 200 }}
                select
                value={value || ""}
                onChange={(event) => {
                  onChange(event.target.value);
                }}
                error={errors.signatory_id ? true : false}
                helperText={errors.signatory_id?.message}
              >
                <MenuItem value={0}>-------</MenuItem>
                {signatories.map((_signatory) => (
                  <MenuItem key={_signatory.id} value={_signatory.id}>
                    {_signatory.name}
                  </MenuItem>
                ))}
              </StyledTextField>
            )}
          />
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<Save />}
          onClick={() => {
            saveIGCCalc(getValues());
          }}
          disabled={!isDirty}
          title={"Salva os dados no navegador"}
        >
          {isDirty ? "Salvar" : "Salvo"}
        </Button>
        <Button color="success" startIcon={<Calculate />} type="submit">
          Calcular
        </Button>
        <Button
          color="warning"
          startIcon={<Print />}
          onClick={() => {
            downloadPDF(getValues());
          }}
        >
          Imprimir
        </Button>
      </Stack>
    </Toolbar>
  );
};

export default CalcToolbar;
