import * as yup from "yup";

import { FormHelperText, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import React, { useEffect } from "react";
import { addServerErrors } from "utils";
import { closeDialog, openDialog } from "redux/modal";
import { useAppDispatch, useAppSelector } from "redux/utils";

import BaseDialogForm from "./BaseDialogForm";
import store from "redux/store";
import { yupResolver } from "@hookform/resolvers/yup";
import { SignatorySerializer } from "api/types/coreTypes";
import { SignatoryCRUDAction } from "api/core";

const _newSignatory: SignatorySerializer = {
  id: 0,
  name: "",
  title: "",
  document: "",
};

const _dialogName = "DIALOG_CORE_SIGNATORY";

export const showSignatoryDialog = (_dialogObject?: Partial<SignatorySerializer>) => {
  store.dispatch(
    openDialog({
      dialogName: _dialogName,
      dialogObject: { ..._newSignatory, ..._dialogObject },
    })
  );
};

export const closeSignatoryDialog = () => {
  store.dispatch(closeDialog(_dialogName));
};

export const destroySignatory = (_signatory?: SignatorySerializer | null) => {
  if (_signatory && _signatory.id) {
    let newLine = "\r\n";
    let confirm_alert = "Tem certeza que deseja remover este gás?";
    confirm_alert += newLine;
    confirm_alert += _signatory.name;
    if (window.confirm(confirm_alert)) {
      store.dispatch(SignatoryCRUDAction.destroy(_signatory.id));
      return true;
    }
  }
  return false;
};

const validationSchema = () =>
  yup
    .object({
      name: yup.string().max(25).required(),
      title: yup.string().max(255).required(),
      document: yup.string().max(255).notRequired().nullable(),
    })
    .required();

const SignatoryDialogForm = () => {
  const dispatch = useAppDispatch();
  const openModals = useAppSelector((state) => state.modal.openModals);
  const dialogObject = useAppSelector((state) => state.modal.dialogObjects[_dialogName] as SignatorySerializer);

  const formMethods = useForm<SignatorySerializer>({
    resolver: yupResolver(validationSchema()),
    defaultValues: dialogObject,
  });
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = formMethods;

  useEffect(() => {
    reset(dialogObject);
  }, [dialogObject, reset]);

  const handleCreate = (_signatory: SignatorySerializer) => {
    dispatch(SignatoryCRUDAction.create(_signatory))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleUpdate = (_signatory: SignatorySerializer) => {
    dispatch(SignatoryCRUDAction.partialUpdate(_signatory))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleDestroy = () => {
    if (destroySignatory(dialogObject)) {
      handleClose();
    }
  };

  const onSubmit = (data: SignatorySerializer) => {
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
    closeSignatoryDialog();
  };

  return (
    <BaseDialogForm
      key={dialogObject?.id}
      open={openModals.includes(_dialogName)}
      title={dialogObject?.id ? "Editar Signatário" : "Criar Signatário"}
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
        label="Título"
        error={errors.title ? true : false}
        helperText={errors.title?.message}
        {...register("title")}
      />
      <TextField
        label="Documento"
        error={errors.document ? true : false}
        helperText={errors.document?.message}
        {...register("document")}
      />
      <FormHelperText>
        O Nome será utilizado apenas para identificação.
        <br />
        No campo de assinatura irá aparecer o título seguido do documento.
      </FormHelperText>
    </BaseDialogForm>
  );
};

export default SignatoryDialogForm;
