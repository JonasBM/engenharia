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
import { SHPCalcState, shpCalcTypes } from "redux/shp";

import { Calculate } from "@mui/icons-material";
import { StyledTextField } from ".";
import { useAppSelector } from "redux/utils";

const CalcToolbar = () => {
  const fixtures = useAppSelector((state) => state.shp.fixtures);

  const { register, control, setValue } = useFormContext<SHPCalcState>();

  const type = useWatch({
    control,
    name: "type",
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
          InputLabelProps={{ shrink: true }}
          {...register("name")}
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
          name="type"
          render={({ field: { value, onChange } }) => (
            <StyledTextField
              label="Tipo de cálculo"
              sx={{ width: 150, margin: 0 }}
              select
              value={value || ""}
              onChange={(event) => {
                onChange(event.target.value);
              }}
            >
              {shpCalcTypes.map((_shpCalcType) => (
                <MenuItem key={_shpCalcType} value={_shpCalcType}>
                  {_shpCalcType}
                </MenuItem>
              ))}
            </StyledTextField>
          )}
        />
        {type === "bomba" && (
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
