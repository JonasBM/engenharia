import { Box, Button, MenuItem, Stack, Toolbar } from "@mui/material";
import {
  CalcTypes,
  PressureTypes,
  SHPCalcSerializer,
} from "api/types/shpTypes";
import { Calculate, Save } from "@mui/icons-material";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import React, { useEffect } from "react";

import { StyledTextField } from ".";
import { saveSHPCalc } from "./utils";
import { useAppSelector } from "redux/utils";

const CalcToolbar = () => {
  const fixtures = useAppSelector((state) => state.shp.fixtures);
  const config = useAppSelector((state) => state.shp.configs[0]);

  const {
    control,
    setValue,
    getValues,
    formState: { isDirty },
  } = useFormContext<SHPCalcSerializer>();

  const calc_type = useWatch({
    control,
    name: "calc_type",
  });

  const fixture_id = useWatch({
    control,
    name: "fixture_id",
  });

  const pressure_type = useWatch({
    control,
    name: "pressure_type",
  });

  useEffect(() => {
    if (!calc_type && CalcTypes.length > 0 && config) {
      if (config.calc_type) {
        setValue("calc_type", config.calc_type);
      } else {
        setValue("calc_type", CalcTypes[0].value);
      }
    }
  }, [calc_type, setValue, config]);

  useEffect(() => {
    if (!fixture_id && fixtures.length > 0 && config) {
      if (config.fixture) {
        setValue("fixture_id", config.fixture);
      } else {
        setValue("fixture_id", fixtures[0].id);
      }
    }
  }, [fixtures, fixture_id, setValue, config]);

  useEffect(() => {
    if (!pressure_type && PressureTypes.length > 0 && config) {
      if (config.pressure_type) {
        setValue("pressure_type", config.pressure_type);
      } else {
        setValue("pressure_type", PressureTypes[0].value);
      }
    }
  }, [pressure_type, setValue, config]);

  return (
    <Toolbar sx={{ minWidth: 800 }}>
      <Stack direction="row" alignItems="center" spacing={3} width="100%">
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
              {CalcTypes.map((_calcType) => (
                <MenuItem key={_calcType.value} value={_calcType.value}>
                  {_calcType.name}
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
                label="Hidrante"
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
              {PressureTypes.map((_shpPressureType) => (
                <MenuItem
                  key={_shpPressureType.value}
                  value={_shpPressureType.value}
                >
                  {_shpPressureType.name}
                </MenuItem>
              ))}
            </StyledTextField>
          )}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<Save />}
          onClick={() => {
            saveSHPCalc(getValues());
          }}
          disabled={!isDirty}
          title={"Salva os dados no navegador"}
        >
          {isDirty ? "Salvar" : "Salvo"}
        </Button>
        <Button color="success" startIcon={<Calculate />} type="submit">
          Calcular
        </Button>
      </Stack>
    </Toolbar>
  );
};

export default CalcToolbar;
