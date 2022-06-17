import * as yup from "yup";

import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import FixtureDialogFittings, {
  showDialogFixtureFittings,
} from "./FixtureDialogFittings";
import {
  FixtureSerializer,
  fixtureType,
  fixtureTypes,
} from "api/types/shpTypes";
import React, { useEffect, useState } from "react";
import { closeDialog, openDialog } from "redux/modal";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { Add } from "@mui/icons-material";
import BaseDialogForm from "./BaseDialogForm";
import { FixtureCRUDAction } from "api/shp";
import { addServerErrors } from "utils";
import store from "redux/store";
import { yupResolver } from "@hookform/resolvers/yup";

const _newFixture: FixtureSerializer = {
  id: 0,
  name: "",
  nozzle_type: "",
  extra_equivalent_length: null,
  hose_hazen_williams_coefficient: null,
  hose_internal_diameter: null,
  k_factor: 0,
  k_factor_includes_hose: false,
  k_nozzle: 0,
  outlet_diameter: 0,
  minimum_flow_rate: null,
  material: null,
  inlet_diameter: null,
  reductions_ids: [],
  fittings_ids: [],
};

const _dialogName = "DIALOG_FIXTURE";

export const showFixtureDialog = (
  _dialogObject?: Partial<FixtureSerializer>
) => {
  store.dispatch(
    openDialog({
      dialogName: _dialogName,
      dialogObject: { ..._newFixture, ..._dialogObject },
    })
  );
};

export const closeFixtureDialog = () => {
  store.dispatch(closeDialog(_dialogName));
};

export const destroyFixture = (_fixture: FixtureSerializer) => {
  if (_fixture && _fixture.id) {
    let newLine = "\r\n";
    let confirm_alert = "Tem certeza que deseja remover este Hidrante?";
    confirm_alert += newLine;
    confirm_alert += _fixture.name;
    if (window.confirm(confirm_alert)) {
      store.dispatch(FixtureCRUDAction.destroy(_fixture.id));
      return true;
    }
  }
  return false;
};

const validationSchema = () =>
  yup
    .object({
      name: yup.string().max(255).required(),
      nozzle_type: yup.string().required(),
      hose_hazen_williams_coefficient: yup.number().integer().min(0).required(),
      hose_internal_diameter: yup.number().integer().min(0).required(),
      k_factor: yup.number().min(0).required(),
      k_factor_includes_hose: yup.boolean().required(),
      k_nozzle: yup.number().min(0).required(),
      outlet_diameter: yup.number().min(0).required(),
      minimum_flow_rate: yup.number().min(0).required(),
      inlet_diameter: yup.number().integer().min(1).required(),
      material: yup.number().integer().min(1).required(),
    })
    .required();

const FixtureDialogForm = () => {
  const dispatch = useAppDispatch();
  const materials = useAppSelector((state) => state.shp.materials);
  const diameters = useAppSelector((state) =>
    [...state.shp.diameters].sort(
      (a, b) => a.internal_diameter - b.internal_diameter
    )
  );
  const reductions = useAppSelector((state) =>
    [...state.shp.reductions].sort((a, b) => a.name.localeCompare(b.name))
  );
  const fittings = useAppSelector((state) => state.shp.fittings);
  const openModals = useAppSelector((state) => state.modal.openModals);
  const dialogObject = useAppSelector(
    (state) => state.modal.dialogObjects[_dialogName] as FixtureSerializer
  );

  const formMethods = useForm<FixtureSerializer>({
    resolver: yupResolver(validationSchema()),
    defaultValues: dialogObject,
  });
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = formMethods;
  const material_id = useWatch({ control, name: "material" });
  const k_factor = useWatch({ control, name: "k_factor" });

  useEffect(() => {
    reset(dialogObject);
  }, [dialogObject, reset]);

  useEffect(() => {
    setValue("reductions_ids", [], { shouldValidate: true });
  }, [material_id, setValue]);

  const inlet_diameter_id = useWatch({ control, name: "inlet_diameter" });

  useEffect(() => {
    const _diameter = diameters.find((d) => d.id === inlet_diameter_id);
    if (
      materials &&
      materials.length > 0 &&
      diameters &&
      diameters.length > 0 &&
      material_id &&
      _diameter?.material !== material_id
    ) {
      const material = materials.find((m) => m.id === material_id);
      if (material?.default_diameter) {
        setValue("inlet_diameter", material.default_diameter, {
          shouldValidate: true,
        });
      } else {
        setValue(
          "inlet_diameter",
          diameters.find((d) => d.material === material_id)?.id,
          { shouldValidate: true }
        );
      }
    }
  }, [diameters, material_id, inlet_diameter_id, materials, setValue]);

  const handleCreate = (_fixture: FixtureSerializer) => {
    dispatch(FixtureCRUDAction.create(_fixture))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleUpdate = (_fixture: FixtureSerializer) => {
    dispatch(FixtureCRUDAction.partialUpdate(_fixture))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleDestroy = () => {
    if (destroyFixture(dialogObject)) {
      handleClose();
    }
  };

  const onSubmit = (data: FixtureSerializer) => {
    if (data.id) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  const handleReset = () => {
    reset();
  };

  const handleClose = () => {
    closeFixtureDialog();
  };

  return (
    <BaseDialogForm
      key={dialogObject?.id}
      open={openModals.includes(_dialogName)}
      title={dialogObject?.id ? "Editar Hidrante" : "Criar Hidrante"}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      onReset={handleReset}
      onDelete={dialogObject?.id ? handleDestroy : null}
      maxWidth="lg"
    >
      <FormProvider {...formMethods}>
        <FixtureDialogFittings />
      </FormProvider>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <TextField
            label="Nome"
            error={errors.name ? true : false}
            helperText={errors.name?.message}
            {...register("name")}
          />
          {fixtureTypes.length > 0 && (
            <Controller
              control={control}
              name="nozzle_type"
              render={({ field: { value, onChange } }) => (
                <TextField
                  select
                  label="Tipo de hidrante"
                  value={value || ""}
                  onChange={(event) => {
                    onChange(event.target.value);
                  }}
                  error={errors.nozzle_type ? true : false}
                  helperText={errors.nozzle_type?.message}
                >
                  {fixtureTypes.map((_type) => (
                    <MenuItem key={_type.value} value={_type.value}>
                      {_type.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}
          <Paper sx={{ padding: 2 }}>
            <TextField
              type="number"
              inputProps={{ step: "0.01" }}
              label={
                <Typography>
                  Fator de Vazão K (l/min/m.c.a.<sup>1/2</sup>)
                </Typography>
              }
              error={errors.k_factor ? true : false}
              helperText={errors.k_factor?.message}
              {...register("k_factor")}
            />
            <Controller
              name="k_factor_includes_hose"
              control={control}
              render={({ field: { value, onChange } }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={value || false}
                      onChange={(event) => {
                        onChange(event.target.checked);
                      }}
                    />
                  }
                  label="O Fator de vazão inclue a perda de carga na mangueira"
                />
              )}
            />
            <TextField
              type="number"
              inputProps={{ step: "0.01" }}
              label="Coeficiente tipico do esguicho (adimensional)"
              error={errors.k_nozzle ? true : false}
              helperText={errors.k_nozzle?.message}
              {...register("k_nozzle")}
            />
            <TextField
              type="number"
              inputProps={{ step: "0.01" }}
              label="Diâmetro da saída do esguicho (mm)"
              error={errors.outlet_diameter ? true : false}
              helperText={errors.outlet_diameter?.message}
              {...register("outlet_diameter")}
            />
            <FormHelperText>
              A relação entre pressão e vazão na ponta do esguicho é calculada
              pelo Fator de vazão.
              <br />
              Caso nenhum seja fornecido, será usada a expressão geral de vazão
              através de um orifício. Considerando o coeficiente de descarga (C
              <sub>d</sub>=0,97) e usando o "Diâmetro da saída do esguicho".
              <br />O Fator de vazão pode ou não incluir as perdas de carga na
              mangueira e no próprio esguicho, caso seja esse o caso, deve-se
              deixar o "Coeficiente tipico do esguicho" igual a zero e marcar a
              opção de "O Fator de vazão inclue a perda de carga na mangueira".
              <br />
              Caso nenhum valor seja fornecido para o "Coeficiente tipico do
              esguicho" a perda de carga no esguicho desconsiderada.
            </FormHelperText>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <TextField
            type="number"
            inputProps={{ step: "0.01" }}
            label="Vazão mínima (l/min)"
            error={errors.minimum_flow_rate ? true : false}
            helperText={errors.minimum_flow_rate?.message}
            {...register("minimum_flow_rate")}
          />
          <TextField
            type="number"
            inputProps={{ step: "1" }}
            label="Coeficiente de hazen-williams da mangueira"
            error={errors.hose_hazen_williams_coefficient ? true : false}
            helperText={errors.hose_hazen_williams_coefficient?.message}
            {...register("hose_hazen_williams_coefficient")}
          />

          <TextField
            type="number"
            inputProps={{ step: "1" }}
            label="Diâmetro interno da mangueira (mm)"
            error={errors.hose_internal_diameter ? true : false}
            helperText={errors.hose_internal_diameter?.message}
            {...register("hose_internal_diameter")}
          />

          {materials.length > 0 && (
            <Controller
              control={control}
              name="material"
              render={({ field: { value, onChange } }) => (
                <TextField
                  select
                  label="Material"
                  value={value || ""}
                  onChange={(event) => {
                    onChange(event.target.value);
                  }}
                  error={errors.material ? true : false}
                  helperText={errors.material?.message}
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

          {diameters.length > 0 && (
            <Controller
              control={control}
              name="inlet_diameter"
              render={({ field: { value, onChange } }) => (
                <TextField
                  select
                  label="Diâmetro de entrada"
                  value={value || ""}
                  onChange={(event) => {
                    onChange(event.target.value);
                  }}
                  error={errors.inlet_diameter ? true : false}
                  helperText={errors.inlet_diameter?.message}
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
                </TextField>
              )}
            />
          )}

          {/* {reductions.length > 0 && (
            <Controller
              control={control}
              name="reductions_ids"
              render={({ field: { value, onChange } }) => (
                <TextField
                  select
                  SelectProps={{
                    multiple: true,
                  }}
                  label="Reduções"
                  value={value || []}
                  onChange={(event) => {
                    onChange(event.target.value || []);
                  }}
                  error={errors.reductions_ids ? true : false}
                  helperText={errors.reductions_ids?.join(", ")}
                >
                  {reductions.map((_reduction) => (
                    <MenuItem
                      key={_reduction.id}
                      value={_reduction.id}
                      sx={{
                        display:
                          _reduction.material === material_id ? "" : "none",
                      }}
                    >
                      {_reduction.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )} */}

          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <TextField
              type="number"
              disabled
              sx={{ width: "100px" }}
              variant="standard"
              inputProps={{ style: { textAlign: "center" } }}
              value={0}
            />
            <IconButton
              onClick={() => {
                showDialogFixtureFittings();
              }}
              title="Alterar conexões no trecho"
            >
              <Add />
            </IconButton>
          </Box>

          {/* {fittings.length > 0 && (
            <Controller
              control={control}
              name="fittings"
              render={({ field: { value, onChange } }) => (
                <TextField
                  select
                  SelectProps={{
                    multiple: true,
                  }}
                  label="Conexões"
                  value={value || []}
                  onChange={(event) => {
                    onChange(event.target.value || []);
                  }}
                  error={errors.fittings ? true : false}
                  helperText={errors.fittings?.join(", ")}
                >
                  {fittings.map((_fitting) => (
                    <MenuItem key={_fitting.id} value={_fitting.id}>
                      {_fitting.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )} */}

          <TextField
            type="number"
            inputProps={{ step: "0.01" }}
            label="Comprimento equivalente extra (m)"
            error={errors.extra_equivalent_length ? true : false}
            helperText={errors.extra_equivalent_length?.message}
            {...register("extra_equivalent_length")}
          />
        </Grid>
      </Grid>
    </BaseDialogForm>
  );
};

export default FixtureDialogForm;
