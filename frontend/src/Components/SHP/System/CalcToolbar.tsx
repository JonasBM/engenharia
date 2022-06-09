import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
} from "@mui/material";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import React, { useEffect } from "react";
import { SHPCalcState, shpCalcTypes, shpPressureTypes } from "redux/shp";

import { Calculate } from "@mui/icons-material";
import { StyledTextField } from ".";
import { useAppSelector } from "redux/utils";

const CalcToolbar = () => {
  const fixtures = useAppSelector((state) => state.shp.fixtures);

  const { register, control, setValue } = useFormContext<SHPCalcState>();

  const pressure_type = useWatch({
    control,
    name: "pressure_type",
  });

  const fixture_id = useWatch({
    control,
    name: "fixture_id",
  });

  useEffect(() => {
    if (!fixture_id && fixtures.length > 0) {
      setValue("fixture_id", fixtures[0].id);
    }
  }, [fixtures, fixture_id, setValue]);

  return (
    <Toolbar sx={{ minWidth: 800 }}>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        width="100%"
      >
        <Controller
          control={control}
          name="calc_type"
          render={({ field: { value, onChange } }) => (
            <StyledTextField
              label="Tipo de cálculo"
              sx={{ width: 200, margin: 0 }}
              select
              value={value || ""}
              onChange={(event) => {
                onChange(event.target.value);
              }}
            >
              {shpCalcTypes.map((_shpCalcType) => (
                <MenuItem key={_shpCalcType.value} value={_shpCalcType.value}>
                  {_shpCalcType.title}
                </MenuItem>
              ))}
            </StyledTextField>
          )}
        />
        {fixtures.length > 0 && (
          <Controller
            control={control}
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
        <Controller
          control={control}
          name="pressure_type"
          render={({ field: { value, onChange } }) => (
            <StyledTextField
              label="Tipo de pressurização"
              sx={{ width: 150, margin: 0 }}
              select
              value={value || ""}
              onChange={(event) => {
                onChange(event.target.value);
              }}
            >
              {shpPressureTypes.map((_shpPressureType) => (
                <MenuItem
                  key={_shpPressureType.value}
                  value={_shpPressureType.value}
                >
                  {_shpPressureType.title}
                </MenuItem>
              ))}
            </StyledTextField>
          )}
        />
        {pressure_type === "bomba" && (
          <TextField
            label="Nome do ponto da Bomba"
            InputLabelProps={{ shrink: true }}
            fullWidth={false}
            {...register("pump_node")}
          />
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Button color="success" startIcon={<Calculate />} type="submit">
          Calcular
        </Button>
      </Stack>
    </Toolbar>
  );
};

export default CalcToolbar;
