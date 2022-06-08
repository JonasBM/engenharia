import * as yup from "yup";

import { Controller, useForm, useWatch } from "react-hook-form";
import {
  DiameterSerializer,
  FittingSerializer,
  FixtureSerializer,
  fixtureType,
  fixtureTypes,
} from "api/types/shpTypes";
import { MenuItem, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { hideDialog, showDialog } from "redux/modal";
import { useAppDispatch, useAppSelector } from "redux/utils";

import BaseDialogForm from "./BaseDialogForm";
import { FixtureCRUDAction } from "api/shp";
import { addServerErrors } from "utils";
import store from "redux/store";
import { yupResolver } from "@hookform/resolvers/yup";

const _newFixture: Partial<FixtureSerializer> = {
  id: 0,
  name: "",
  type: "",
  extra_equivalent_length: "",
  hose_hazen_williams_coefficient: null,
  k_factor: "",
  outlet_diameter: "",
  minimum_flow_rate: "",
  material: "",
  inlet_diameter: "",
  fittings: [],
};

const _dialogName = "MODAL_FIXTURE";

export const showFixtureDialog = (_dialogObject = _newFixture) => {
  store.dispatch(
    showDialog({
      dialogName: _dialogName,
      dialogObject: { ..._newFixture, ..._dialogObject },
    })
  );
};

export const closeFixtureDialog = () => {
  store.dispatch(hideDialog());
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
      type: yup.string().required(),
      minimum_flow_rate: yup.number().integer().min(0).required(),
      outlet_diameter: yup.number().min(0).required(),
      // k_factor: yup.string().when("type", {
      //   is: fixtureType.TRONCO_CONICO.value,
      //   then: yup
      //     .string()
      //     .nullable()
      //     .matches(/^[0-9]+$/, {
      //       message: "Deve ser um número",
      //       excludeEmptyString: true,
      //     }),
      //   otherwise: yup.string().matches(/^[0-9]+$/, {
      //     message: "Deve ser um número",
      //   }),
      // }),
      hose_hazen_williams_coefficient: yup.number().integer().min(0).required(),
    })
    .required();

const FixtureDialogForm = () => {
  const dispatch = useAppDispatch();
  const materials = useAppSelector((state) => state.shp.materials);
  const diameters = useAppSelector((state) => state.shp.diameters);
  const fittings = useAppSelector((state) => state.shp.fittings);
  const { dialogName, dialogObject } = useAppSelector(
    (state) => state.modal
  ) as {
    dialogName: string | null;
    dialogObject: FixtureSerializer;
  };
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FixtureSerializer>({
    resolver: yupResolver(validationSchema()),
    defaultValues: dialogObject,
  });
  const material_id = useWatch({ control, name: "material" });
  const type = useWatch({ control, name: "type" });

  // const [currentFitttings, setCurrentFitttings] = useState<FittingSerializer[]>(
  //   []
  // );

  const [currentDiameters, setCurrentDiameters] = useState<
    DiameterSerializer[]
  >([]);

  // useEffect(() => {
  //   setCurrentFitttings(
  //     fittings
  //       .filter((f) => f.material === material_id)
  //       .sort((a, b) => a.name.localeCompare(b.name))
  //   );
  // }, [fittings, material_id]);

  useEffect(() => {
    setCurrentDiameters(
      diameters
        .filter((d) => d.material === material_id)
        .sort((a, b) => a.internal_diameter - b.internal_diameter)
    );
  }, [diameters, material_id]);

  useEffect(() => {
    reset(dialogObject);
  }, [dialogObject, reset]);

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
      key={dialogObject.id}
      open={dialogName === _dialogName ? true : false}
      title={dialogObject.id ? "Editar Fixture" : "Criar Fixture"}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      onReset={handleReset}
      onDelete={dialogObject.id ? handleDestroy : null}
    >
      <TextField
        label="Nome"
        error={errors.name ? true : false}
        helperText={errors.name?.message}
        {...register("name")}
      />
      {fixtureTypes.length > 0 && (
        <Controller
          control={control}
          name="type"
          render={({ field: { value, onChange } }) => (
            <TextField
              select
              label="Conexão para uma saída"
              value={value || ""}
              onChange={(event) => {
                onChange(event.target.value || "");
              }}
              error={errors.type ? true : false}
              helperText={errors.type?.message}
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

      {type !== fixtureType.TRONCO_CONICO.value && (
        <TextField
          type="number"
          inputProps={{ step: "0.01" }}
          label="Fator K"
          error={errors.k_factor ? true : false}
          helperText={errors.k_factor?.message}
          {...register("k_factor")}
        />
      )}

      <TextField
        type="number"
        inputProps={{ step: "0.01" }}
        label="Diâmetro da saída do esguicho (mm)"
        error={errors.outlet_diameter ? true : false}
        helperText={errors.outlet_diameter?.message}
        {...register("outlet_diameter")}
      />
      <TextField
        type="number"
        label="Vazão mínima (l/min)"
        error={errors.minimum_flow_rate ? true : false}
        helperText={errors.minimum_flow_rate?.message}
        {...register("minimum_flow_rate")}
      />
      <TextField
        type="number"
        label="Coeficiente de hazen-williams da mangueira"
        error={errors.hose_hazen_williams_coefficient ? true : false}
        helperText={errors.hose_hazen_williams_coefficient?.message}
        {...register("hose_hazen_williams_coefficient")}
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
                onChange(event.target.value || "");
              }}
              error={errors.material ? true : false}
              helperText={errors.material?.message}
            >
              <MenuItem value={""}>Sem Material</MenuItem>
              {materials.map((_material) => (
                <MenuItem key={_material.id} value={_material.id}>
                  {_material.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      )}

      {currentDiameters.length > 0 && (
        <Controller
          control={control}
          name="inlet_diameter"
          render={({ field: { value, onChange } }) => (
            <TextField
              select
              label="Diâmetro de entrada"
              value={value || ""}
              onChange={(event) => {
                onChange(event.target.value || "");
              }}
              error={errors.inlet_diameter ? true : false}
              helperText={errors.inlet_diameter?.message}
            >
              <MenuItem value={""}>Sem Diâmetro de entrada</MenuItem>
              {currentDiameters.map((_diameter) => (
                <MenuItem key={_diameter.id} value={_diameter.id}>
                  {_diameter.name} ({_diameter.internal_diameter} mm)
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      )}

      {fittings.length > 0 && (
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
      )}

      <TextField
        type="number"
        inputProps={{ step: "0.01" }}
        label="Comprimento equivalente extra"
        error={errors.extra_equivalent_length ? true : false}
        helperText={errors.extra_equivalent_length?.message}
        {...register("extra_equivalent_length")}
      />
    </BaseDialogForm>
  );
};

export default FixtureDialogForm;
