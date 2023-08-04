import * as yup from "yup";

import { Controller, useForm } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { closeDialog, openDialog } from "redux/modal";
import { useAppDispatch, useAppSelector } from "redux/utils";

import BaseDialogForm from "./BaseDialogForm";
import { DiameterCRUDAction } from "api/igc";
import { DiameterSerializer } from "api/types/igcTypes";
import { addServerErrors } from "utils";
import store from "redux/store";
import { yupResolver } from "@hookform/resolvers/yup";

const _newDiameter: DiameterSerializer = {
  id: 0,
  name: "",
  internal_diameter: null,
  material: null,
};

const _dialogName = "MODAL_IGC_DIAMETER";

export const showDiameterDialog = (_dialogObject?: Partial<DiameterSerializer>) => {
  store.dispatch(
    openDialog({
      dialogName: _dialogName,
      dialogObject: { ..._newDiameter, ..._dialogObject },
    })
  );
};

export const closeDiameterDialog = () => {
  store.dispatch(closeDialog(_dialogName));
};

export const destroyDiameter = (_diameter?: DiameterSerializer | null) => {
  if (_diameter && _diameter.id) {
    let newLine = "\r\n";
    let confirm_alert = "Tem certeza que deseja remover este Diâmetro?";
    confirm_alert += newLine;
    confirm_alert += _diameter.name;
    if (window.confirm(confirm_alert)) {
      store.dispatch(DiameterCRUDAction.destroy(_diameter.id));
      return true;
    }
  }
  return false;
};

const validationSchema = () =>
  yup
    .object({
      name: yup.string().max(15).required(),
      internal_diameter: yup.number().min(1).required(),
      material: yup.number().integer().min(1).required(),
    })
    .required();

const DiameterDialogForm = () => {
  const dispatch = useAppDispatch();
  const materials = useAppSelector((state) => state.igc.materials);
  const openModals = useAppSelector((state) => state.modal.openModals);
  const dialogObject = useAppSelector((state) => state.modal.dialogObjects[_dialogName] as DiameterSerializer);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm<DiameterSerializer>({
    resolver: yupResolver(validationSchema()),
    defaultValues: dialogObject,
  });

  useEffect(() => {
    reset(dialogObject);
  }, [dialogObject, reset]);

  const handleCreate = (_diameter: DiameterSerializer) => {
    dispatch(DiameterCRUDAction.create(_diameter))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleUpdate = (_diameter: DiameterSerializer) => {
    dispatch(DiameterCRUDAction.partialUpdate(_diameter))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleDestroy = () => {
    if (destroyDiameter(dialogObject)) {
      handleClose();
    }
  };

  const onSubmit = (data: DiameterSerializer) => {
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
    closeDiameterDialog();
  };

  return (
    <BaseDialogForm
      key={dialogObject?.id}
      open={openModals.includes(_dialogName)}
      title={dialogObject?.id ? "Editar Diâmetro" : "Criar Diâmetro"}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      onReset={handleReset}
      onDelete={dialogObject?.id ? handleDestroy : undefined}
    >
      <TextField
        label="Nome"
        error={errors.name ? true : false}
        helperText={errors.name?.message}
        {...register("name")}
      />
      <TextField
        type="number"
        inputProps={{ step: "0.01" }}
        label="Diâmetro interno (mm)"
        error={errors.internal_diameter ? true : false}
        helperText={errors.internal_diameter?.message}
        {...register("internal_diameter")}
      />

      {materials && (
        <Controller
          control={control}
          name="material"
          render={({ field: { value, onChange } }) => (
            <TextField
              select
              label="Material"
              value={value}
              onChange={(event) => {
                onChange(event.target.value || "");
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
    </BaseDialogForm>
  );
};

export default DiameterDialogForm;
