import * as yup from "yup";

import {
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { CalcTypes, ConfigSerializer, PressureTypes } from "api/types/shpTypes";
import { Controller, useForm } from "react-hook-form";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { ConfigCRUDAction } from "api/shp";
import { addServerErrors } from "utils";
import { yupResolver } from "@hookform/resolvers/yup";

const validationSchema = () =>
  yup
    .object({
      calc_type: yup.string().max(2).required(),
      pressure_type: yup.string().max(2).required(),
    })
    .required();

const Config = () => {
  const dispatch = useAppDispatch();
  const materials = useAppSelector((state) => state.shp.materials);
  const fixtures = useAppSelector((state) => state.shp.fixtures);
  const config = useAppSelector((state) => state.shp.configs[0]);

  const {
    control,
    reset,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfigSerializer>({
    resolver: yupResolver(validationSchema()),
    defaultValues: config,
  });

  useEffect(() => {
    reset(config);
  }, [config, reset]);

  const onSubmit = (data: ConfigSerializer) => {
    dispatch(ConfigCRUDAction.partialUpdate(data))
      .then()
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ padding: 2 }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">Valores padrões do cálculo</Typography>
        </Grid>
        <Grid item xs={2}>
          {CalcTypes?.length > 0 && (
            <Controller
              control={control}
              name="calc_type"
              render={({ field: { value, onChange } }) => (
                <TextField
                  label="Tipo de cálculo padrão"
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
                </TextField>
              )}
            />
          )}
        </Grid>
        <Grid item xs={2}>
          {PressureTypes?.length > 0 && (
            <Controller
              control={control}
              name="pressure_type"
              render={({ field: { value, onChange } }) => (
                <TextField
                  label="Tipo de cálculo padrão"
                  select
                  value={value || ""}
                  onChange={(event) => {
                    onChange(event.target.value);
                  }}
                >
                  {PressureTypes.map((_pressureType) => (
                    <MenuItem
                      key={_pressureType.value}
                      value={_pressureType.value}
                    >
                      {_pressureType.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}
        </Grid>

        <Grid item xs={4}>
          {materials?.length > 0 && (
            <Controller
              control={control}
              name="material"
              render={({ field: { value, onChange } }) => (
                <TextField
                  label="Material padrão"
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
                </TextField>
              )}
            />
          )}
        </Grid>
        <Grid item xs={4}>
          {fixtures?.length > 0 && (
            <Controller
              control={control}
              name="fixture"
              render={({ field: { value, onChange } }) => (
                <TextField
                  label="Hidrante padrão"
                  select
                  value={value || ""}
                  onChange={(event) => {
                    onChange(event.target.value);
                  }}
                  error={errors.fixture ? true : false}
                  helperText={errors.fixture?.message}
                >
                  <MenuItem value="">Sem Hidrante padrão</MenuItem>
                  {fixtures.map((_fixture) => (
                    <MenuItem key={_fixture.id} value={_fixture.id}>
                      {_fixture.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <Button type="submit">Salvar</Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Config;
