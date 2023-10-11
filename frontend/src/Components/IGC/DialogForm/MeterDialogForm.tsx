import * as yup from "yup";

import {MenuItem, TextField} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { MeterSerializer } from "api/types/igcTypes";
import React, { useEffect } from "react";
import { addServerErrors } from "utils";
import { closeDialog, openDialog } from "redux/modal";
import { useAppDispatch, useAppSelector } from "redux/utils";

import BaseDialogForm from "./BaseDialogForm";
import { MeterCRUDAction } from "api/igc";
import store from "redux/store";
import { yupResolver } from "@hookform/resolvers/yup";

const _newMeter: MeterSerializer = {
  id: 0,
  name: "",
  max_flow: null,
  gas: null,
};

const _dialogName = "DIALOG_IGC_Meter";

export const showMeterDialog = (_dialogObject?: Partial<MeterSerializer>) => {
  store.dispatch(
    openDialog({
      dialogName: _dialogName,
      dialogObject: { ..._newMeter, ..._dialogObject },
    })
  );
};

export const closeMeterDialog = () => {
  store.dispatch(closeDialog(_dialogName));
};

export const destroyMeter = (_meter?: MeterSerializer | null) => {
  if (_meter && _meter.id) {
    let newLine = "\r\n";
    let confirm_alert = "Tem certeza que deseja remover este gás?";
    confirm_alert += newLine;
    confirm_alert += _meter.name;
    if (window.confirm(confirm_alert)) {
      store.dispatch(MeterCRUDAction.destroy(_meter.id));
      return true;
    }
  }
  return false;
};

const validationSchema = () =>
  yup
    .object({
      name: yup.string().max(25).required(),
      max_flow: yup.number().min(0).required(),
      gas: yup.number().integer().min(1).required(),
    })
    .required();

const MeterDialogForm = () => {
  const dispatch = useAppDispatch();
  const gases = useAppSelector((state) => state.igc.gases);
  const openModals = useAppSelector((state) => state.modal.openModals);
  const dialogObject = useAppSelector((state) => state.modal.dialogObjects[_dialogName] as MeterSerializer);

  const formMethods = useForm<MeterSerializer>({
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

  const handleCreate = (_meter: MeterSerializer) => {
    dispatch(MeterCRUDAction.create(_meter))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleUpdate = (_meter: MeterSerializer) => {
    dispatch(MeterCRUDAction.partialUpdate(_meter))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleDestroy = () => {
    if (destroyMeter(dialogObject)) {
      handleClose();
    }
  };

  const onSubmit = (data: MeterSerializer) => {
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
    closeMeterDialog();
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
        label="Vazão máxima (m³/h)"
        error={errors.max_flow ? true : false}
        helperText={errors.max_flow?.message}
        {...register("max_flow")}
      />

    {gases.length > 0 && (
        <Controller
          control={control}
          name="gas"
          render={({ field: { value, onChange } }) => (
            <TextField
              select
              label="Gás"
              value={value || ""}
              onChange={(event) => {
                onChange(event.target.value);
              }}
              error={errors.gas ? true : false}
              helperText={errors.gas?.message}
            >
              {gases.map((_gas) => (
                <MenuItem key={_gas.id} value={_gas.id}>
                  {_gas.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      )}

    </BaseDialogForm>
  );
};

export default MeterDialogForm;
