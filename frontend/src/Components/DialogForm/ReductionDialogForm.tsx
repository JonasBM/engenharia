import * as yup from "yup";

import { Controller, useForm, useWatch } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { closeDialog, openDialog } from "redux/modal";
import { useAppDispatch, useAppSelector } from "redux/utils";

import BaseDialogForm from "./BaseDialogForm";
import { ReductionCRUDAction } from "api/shp";
import { ReductionSerializer } from "api/types/shpTypes";
import { addServerErrors } from "utils";
import store from "redux/store";
import { yupResolver } from "@hookform/resolvers/yup";

const _newReduction: ReductionSerializer = {
  id: 0,
  name: "",
  equivalent_length: null,
  material: null,
  inlet_diameter: null,
  outlet_diameter: null,
};

const _dialogName = "MODAL_REDUCTION";

export const showReductionDialog = (
  _dialogObject?: Partial<ReductionSerializer>
) => {
  store.dispatch(
    openDialog({
      dialogName: _dialogName,
      dialogObject: { ..._newReduction, ..._dialogObject },
    })
  );
};

export const closeReductionDialog = () => {
  store.dispatch(closeDialog(_dialogName));
};

export const destroyReduction = (_reduction: ReductionSerializer) => {
  if (_reduction && _reduction.id) {
    let newLine = "\r\n";
    let confirm_alert =
      "Tem certeza que deseja remover esta redução/ampliação?";
    confirm_alert += newLine;
    confirm_alert += _reduction.name;
    if (window.confirm(confirm_alert)) {
      store.dispatch(ReductionCRUDAction.destroy(_reduction.id));
      return true;
    }
  }
  return false;
};

const validationSchema = () =>
  yup
    .object({
      name: yup.string().max(255).required(),
      equivalent_length: yup.number().min(0).required(),
      material: yup.number().min(0).required(),
      inlet_diameter: yup.number().min(0).required(),
      outlet_diameter: yup
        .number()
        .min(0)
        .required()
        .notOneOf(
          [yup.ref("inlet_diameter")],
          "Diâmetros devem ser diferentes"
        ),
    })
    .required();

const ReductionDialogForm = () => {
  const dispatch = useAppDispatch();
  const materials = useAppSelector((state) => state.shp.materials);
  const diameters = useAppSelector((state) =>
    [...state.shp.diameters].sort(
      (a, b) => a.internal_diameter - b.internal_diameter
    )
  );
  const openModals = useAppSelector((state) => state.modal.openModals);
  const dialogObject = useAppSelector(
    (state) => state.modal.dialogObjects[_dialogName] as ReductionSerializer
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ReductionSerializer>({
    resolver: yupResolver(validationSchema()),
    defaultValues: dialogObject,
  });
  const material_id = useWatch({ control, name: "material" });
  const inlet_diameter_id = useWatch({ control, name: "inlet_diameter" });
  const outlet_diameter_id = useWatch({ control, name: "outlet_diameter" });

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

  useEffect(() => {
    const _diameter = diameters.find((d) => d.id === outlet_diameter_id);
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
        setValue("outlet_diameter", material.default_diameter);
      } else {
        setValue(
          "outlet_diameter",
          diameters.find((d) => d.material === material_id)?.id
        );
      }
    }
  }, [diameters, material_id, outlet_diameter_id, materials, setValue]);

  useEffect(() => {
    reset(dialogObject);
  }, [dialogObject, reset]);

  const handleCreate = (_reduction: ReductionSerializer) => {
    dispatch(ReductionCRUDAction.create(_reduction))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleUpdate = (_reduction: ReductionSerializer) => {
    dispatch(ReductionCRUDAction.partialUpdate(_reduction))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleDestroy = () => {
    if (destroyReduction(dialogObject)) {
      handleClose();
    }
  };

  const onSubmit = (data: ReductionSerializer) => {
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
    closeReductionDialog();
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
        label="Comprimento equivalente"
        error={errors.equivalent_length ? true : false}
        helperText={errors.equivalent_length?.message}
        {...register("equivalent_length")}
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
      {diameters.length > 0 && (
        <Controller
          control={control}
          name="outlet_diameter"
          render={({ field: { value, onChange } }) => (
            <TextField
              select
              label="Diâmetro de saída"
              value={value || ""}
              onChange={(event) => {
                onChange(event.target.value);
              }}
              error={errors.outlet_diameter ? true : false}
              helperText={errors.outlet_diameter?.message}
            >
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

export default ReductionDialogForm;
