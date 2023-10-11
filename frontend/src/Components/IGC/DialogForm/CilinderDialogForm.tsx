import * as yup from "yup";

import {TextField} from "@mui/material";
import { useForm } from "react-hook-form";
import { CilinderSerializer } from "api/types/igcTypes";
import React, { useEffect } from "react";
import { addServerErrors } from "utils";
import { closeDialog, openDialog } from "redux/modal";
import { useAppDispatch, useAppSelector } from "redux/utils";

import BaseDialogForm from "./BaseDialogForm";
import { CilinderCRUDAction } from "api/igc";
import store from "redux/store";
import { yupResolver } from "@hookform/resolvers/yup";

const _newCilinder: CilinderSerializer = {
  id: 0,
  name: "",
  vaporization_rate: null,
};

const _dialogName = "DIALOG_IGC_Cilinder";

export const showCilinderDialog = (_dialogObject?: Partial<CilinderSerializer>) => {
  store.dispatch(
    openDialog({
      dialogName: _dialogName,
      dialogObject: { ..._newCilinder, ..._dialogObject },
    })
  );
};

export const closeCilinderDialog = () => {
  store.dispatch(closeDialog(_dialogName));
};

export const destroyCilinder = (_cilinder?: CilinderSerializer | null) => {
  if (_cilinder && _cilinder.id) {
    let newLine = "\r\n";
    let confirm_alert = "Tem certeza que deseja remover este gás?";
    confirm_alert += newLine;
    confirm_alert += _cilinder.name;
    if (window.confirm(confirm_alert)) {
      store.dispatch(CilinderCRUDAction.destroy(_cilinder.id));
      return true;
    }
  }
  return false;
};

const validationSchema = () =>
  yup
    .object({
      name: yup.string().max(25).required(),
      vaporization_rate: yup.number().min(0).required(),
    })
    .required();

const CilinderDialogForm = () => {
  const dispatch = useAppDispatch();
  const openModals = useAppSelector((state) => state.modal.openModals);
  const dialogObject = useAppSelector((state) => state.modal.dialogObjects[_dialogName] as CilinderSerializer);

  const formMethods = useForm<CilinderSerializer>({
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

  const handleCreate = (_cilinder: CilinderSerializer) => {
    dispatch(CilinderCRUDAction.create(_cilinder))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleUpdate = (_cilinder: CilinderSerializer) => {
    dispatch(CilinderCRUDAction.partialUpdate(_cilinder))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleDestroy = () => {
    if (destroyCilinder(dialogObject)) {
      handleClose();
    }
  };

  const onSubmit = (data: CilinderSerializer) => {
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
    closeCilinderDialog();
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
        type="number"
        inputProps={{ step: "0.01" }}
        label="Taxa de Vaporização"
        error={errors.vaporization_rate ? true : false}
        helperText={errors.vaporization_rate?.message}
        {...register("vaporization_rate")}
      />

    </BaseDialogForm>
  );
};

export default CilinderDialogForm;
