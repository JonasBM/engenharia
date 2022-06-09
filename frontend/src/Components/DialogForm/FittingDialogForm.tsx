import * as yup from "yup";

import React, { useEffect } from "react";
import { TextField, Typography } from "@mui/material";
import { hideDialog, showDialog } from "redux/modal";
import { useAppDispatch, useAppSelector } from "redux/utils";

import BaseDialogForm from "./BaseDialogForm";
import { FittingCRUDAction } from "api/shp";
import { FittingSerializer } from "api/types/shpTypes";
import { addServerErrors } from "utils";
import store from "redux/store";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const _newFitting: Partial<FittingSerializer> = {
  id: 0,
  name: "",
};

const _dialogName = "MODAL_FITTING";

export const showFittingDialog = (_dialogObject = _newFitting) => {
  store.dispatch(
    showDialog({
      dialogName: _dialogName,
      dialogObject: { ..._newFitting, ..._dialogObject },
    })
  );
};

export const closeFittingDialog = () => {
  store.dispatch(hideDialog());
};

export const destroyFitting = (_fitting: FittingSerializer) => {
  if (_fitting && _fitting.id) {
    let newLine = "\r\n";
    let confirm_alert = "Tem certeza que deseja remover esta Conexão?";
    confirm_alert += newLine;
    confirm_alert += _fitting.name;
    if (window.confirm(confirm_alert)) {
      store.dispatch(FittingCRUDAction.destroy(_fitting.id));
      return true;
    }
  }
  return false;
};

const validationSchema = () =>
  yup
    .object({
      name: yup.string().max(40).required(),
    })
    .required();

const FittingDialogForm = () => {
  const dispatch = useAppDispatch();
  const { dialogName, dialogObject } = useAppSelector(
    (state) => state.modal
  ) as {
    dialogName: string | null;
    dialogObject: FittingSerializer;
  };
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FittingSerializer>({
    resolver: yupResolver(validationSchema()),
    defaultValues: dialogObject,
  });

  useEffect(() => {
    reset(dialogObject);
  }, [dialogObject, reset]);

  const handleCreate = (_fitting: FittingSerializer) => {
    dispatch(FittingCRUDAction.create(_fitting))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleUpdate = (_fitting: FittingSerializer) => {
    dispatch(FittingCRUDAction.partialUpdate(_fitting))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleDestroy = () => {
    if (destroyFitting(dialogObject)) {
      handleClose();
    }
  };

  const onSubmit = (data: FittingSerializer) => {
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
    closeFittingDialog();
  };

  return (
    <BaseDialogForm
      key={dialogObject.id}
      open={dialogName === _dialogName ? true : false}
      title={dialogObject.id ? "Editar Conexão" : "Criar Conexão"}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      onReset={handleReset}
      onDelete={dialogObject.id ? handleDestroy : null}
    >
      <Typography>A conexão criada vale para todos os materiais</Typography>
      <TextField
        label="Nome"
        error={errors.name ? true : false}
        helperText={errors.name?.message}
        {...register("name")}
      />
    </BaseDialogForm>
  );
};

export default FittingDialogForm;
