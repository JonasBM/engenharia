import * as yup from "yup";

import { Controller, useForm, useWatch } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { closeDialog, openDialog } from "redux/modal";
import { useAppDispatch, useAppSelector } from "redux/utils";

import BaseDialogForm from "./BaseDialogForm";
import { MaterialCRUDAction } from "api/shp";
import { MaterialSerializer } from "api/types/shpTypes";
import { addServerErrors } from "utils";
import store from "redux/store";
import { yupResolver } from "@hookform/resolvers/yup";

const _newMaterial: MaterialSerializer = {
  id: 0,
  name: "",
  hazen_williams_coefficient: null,
  one_outlet_connection: null,
  two_outlet_connection: null,
  three_outlet_connection: null,
  default_diameter: null,
};

const _dialogName = "MODAL_MATERIAL";

export const showMaterialDialog = (
  _dialogObject?: Partial<MaterialSerializer>
) => {
  store.dispatch(
    openDialog({
      dialogName: _dialogName,
      dialogObject: { ..._newMaterial, ..._dialogObject },
    })
  );
};

export const closeMaterialDialog = () => {
  store.dispatch(closeDialog(_dialogName));
};

export const destroyMaterial = (_material: MaterialSerializer) => {
  if (_material && _material.id) {
    let newLine = "\r\n";
    let confirm_alert = "Tem certeza que deseja remover este Material?";
    confirm_alert += newLine;
    confirm_alert += _material.name;
    if (window.confirm(confirm_alert)) {
      store.dispatch(MaterialCRUDAction.destroy(_material.id));
      return true;
    }
  }
  return false;
};

const validationSchema = () =>
  yup
    .object({
      name: yup.string().max(255).required(),
      hazen_williams_coefficient: yup.number().integer().min(1).required(),
    })
    .required();

const MaterialDialogForm = () => {
  const dispatch = useAppDispatch();
  const fittings = useAppSelector((state) => state.shp.fittings);
  const diameters = useAppSelector((state) => state.shp.diameters);
  const openModals = useAppSelector((state) => state.modal.openModals);
  const dialogObject = useAppSelector(
    (state) => state.modal.dialogObjects[_dialogName] as MaterialSerializer
  );
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<MaterialSerializer>({
    resolver: yupResolver(validationSchema()),
    defaultValues: dialogObject,
  });
  const material_id = useWatch({ control, name: "id" });

  useEffect(() => {
    reset(dialogObject);
  }, [dialogObject, reset]);

  const handleCreate = (_material: MaterialSerializer) => {
    dispatch(MaterialCRUDAction.create(_material))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleUpdate = (_material: MaterialSerializer) => {
    dispatch(MaterialCRUDAction.partialUpdate(_material))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleDestroy = () => {
    if (destroyMaterial(dialogObject)) {
      handleClose();
    }
  };

  const onSubmit = (data: MaterialSerializer) => {
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
    closeMaterialDialog();
  };

  return (
    <BaseDialogForm
      key={dialogObject?.id}
      open={openModals.includes(_dialogName)}
      title={dialogObject?.id ? "Editar Material" : "Criar Material"}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      onReset={handleReset}
      onDelete={dialogObject?.id ? handleDestroy : null}
    >
      <TextField
        label="Nome"
        error={errors.name ? true : false}
        helperText={errors.name?.message}
        {...register("name")}
      />
      <TextField
        type="number"
        label="Coeficiente de hazen-williams"
        inputProps={{ step: "1" }}
        error={errors.hazen_williams_coefficient ? true : false}
        helperText={errors.hazen_williams_coefficient?.message}
        {...register("hazen_williams_coefficient")}
      />
      {fittings.length > 0 && (
        <Controller
          control={control}
          name="one_outlet_connection"
          render={({ field: { value, onChange } }) => (
            <TextField
              select
              label="Conexão para uma saída"
              value={value || ""}
              onChange={(event) => {
                onChange(event.target.value);
              }}
              error={errors.one_outlet_connection ? true : false}
              helperText={errors.one_outlet_connection?.message}
            >
              <MenuItem value={null}>Sem conexão</MenuItem>
              {fittings.map((_fitting) => (
                <MenuItem key={_fitting.id} value={_fitting.id}>
                  {_fitting.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      )}
      {fittings.length > 0 && (
        <Controller
          control={control}
          name="two_outlet_connection"
          render={({ field: { value, onChange } }) => (
            <TextField
              select
              label="Conexão para duas saídas"
              value={value || ""}
              onChange={(event) => {
                onChange(event.target.value);
              }}
              error={errors.two_outlet_connection ? true : false}
              helperText={errors.two_outlet_connection?.message}
            >
              <MenuItem value={null}>Sem conexão</MenuItem>
              {fittings.map((_fitting) => (
                <MenuItem key={_fitting.id} value={_fitting.id}>
                  {_fitting.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      )}
      {fittings.length > 0 && (
        <Controller
          control={control}
          name="three_outlet_connection"
          render={({ field: { value, onChange } }) => (
            <TextField
              select
              label="Conexão para três saídas"
              value={value || ""}
              onChange={(event) => {
                onChange(event.target.value);
              }}
              error={errors.three_outlet_connection ? true : false}
              helperText={errors.three_outlet_connection?.message}
            >
              <MenuItem value={null}>Sem conexão</MenuItem>
              {fittings.map((_fitting) => (
                <MenuItem key={_fitting.id} value={_fitting.id}>
                  {_fitting.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      )}

      {diameters.length > 0 && (
        <Controller
          control={control}
          name="default_diameter"
          render={({ field: { value, onChange } }) => (
            <TextField
              select
              label="Diâmetro padrão"
              value={value || ""}
              onChange={(event) => {
                onChange(event.target.value);
              }}
              error={errors.one_outlet_connection ? true : false}
              helperText={errors.one_outlet_connection?.message}
            >
              <MenuItem value={null}>Sem Diâmetro</MenuItem>
              {diameters.map((_diameter) => (
                <MenuItem
                  key={_diameter.id}
                  value={_diameter.id}
                  sx={{
                    display: _diameter.material === material_id ? "" : "none",
                  }}
                >
                  {_diameter.name} ({_diameter.internal_diameter} mm)
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      )}
    </BaseDialogForm>
  );
};

export default MaterialDialogForm;
