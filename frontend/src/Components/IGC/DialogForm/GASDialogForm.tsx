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
import { GASSerializer } from "api/types/igcTypes";
import React, { useEffect, useState } from "react";
import { addServerErrors, decimalFormatter } from "utils";
import { closeDialog, openDialog } from "redux/modal";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { Add } from "@mui/icons-material";
import BaseDialogForm from "./BaseDialogForm";
import { GASCRUDAction } from "api/igc";
import store from "redux/store";
import { yupResolver } from "@hookform/resolvers/yup";

const _newGAS: GASSerializer = {
  id: 0,
  name: "",
  description: "",
  pci: null,
  pck: null,
  relative_density: null,
};

const _dialogName = "DIALOG_IGC_GAS";

export const showGASDialog = (_dialogObject?: Partial<GASSerializer>) => {
  store.dispatch(
    openDialog({
      dialogName: _dialogName,
      dialogObject: { ..._newGAS, ..._dialogObject },
    })
  );
};

export const closeGASDialog = () => {
  store.dispatch(closeDialog(_dialogName));
};

export const destroyGAS = (_gas?: GASSerializer | null) => {
  if (_gas && _gas.id) {
    let newLine = "\r\n";
    let confirm_alert = "Tem certeza que deseja remover este gás?";
    confirm_alert += newLine;
    confirm_alert += _gas.name;
    if (window.confirm(confirm_alert)) {
      store.dispatch(GASCRUDAction.destroy(_gas.id));
      return true;
    }
  }
  return false;
};

const validationSchema = () =>
  yup
    .object({
      name: yup.string().max(25).required(),
      description: yup.string().max(255).notRequired().nullable(),
      pci: yup.number().min(0).required(),
      pck: yup.number().min(0).required(),
      relative_density: yup.number().min(0).required(),
    })
    .required();

const GASDialogForm = () => {
  const dispatch = useAppDispatch();
  const openModals = useAppSelector((state) => state.modal.openModals);
  const dialogObject = useAppSelector((state) => state.modal.dialogObjects[_dialogName] as GASSerializer);

  const formMethods = useForm<GASSerializer>({
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

  useEffect(() => {
    reset(dialogObject);
  }, [dialogObject, reset]);

  const handleCreate = (_gas: GASSerializer) => {
    dispatch(GASCRUDAction.create(_gas))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleUpdate = (_gas: GASSerializer) => {
    dispatch(GASCRUDAction.partialUpdate(_gas))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleDestroy = () => {
    if (destroyGAS(dialogObject)) {
      handleClose();
    }
  };

  const onSubmit = (data: GASSerializer) => {
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
    closeGASDialog();
  };

  return (
    <BaseDialogForm
      key={dialogObject?.id}
      open={openModals.includes(_dialogName)}
      title={dialogObject?.id ? "Editar Gás" : "Criar Gás"}
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
        label="Descrição"
        error={errors.description ? true : false}
        helperText={errors.description?.message}
        {...register("description")}
      />

      <TextField
        type="number"
        inputProps={{ step: "0.01" }}
        label={
          <Typography>
            Poder calorifico inferior (kcal/m<sup>3</sup>)
          </Typography>
        }
        error={errors.pci ? true : false}
        helperText={errors.pci?.message}
        {...register("pci")}
      />

      <TextField
        type="number"
        inputProps={{ step: "0.01" }}
        label="Poder calorifico (kcal/Kg)"
        error={errors.pck ? true : false}
        helperText={errors.pck?.message}
        {...register("pck")}
      />

      <TextField
        type="number"
        inputProps={{ step: "0.01" }}
        label="Densidade relativa"
        error={errors.relative_density ? true : false}
        helperText={errors.relative_density?.message}
        {...register("relative_density")}
      />

    </BaseDialogForm>
  );
};

export default GASDialogForm;
