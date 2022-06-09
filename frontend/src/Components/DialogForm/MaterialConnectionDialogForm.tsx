import * as yup from "yup";

import { Controller, useForm, useWatch } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { hideDialog, showDialog } from "redux/modal";
import { useAppDispatch, useAppSelector } from "redux/utils";

import BaseDialogForm from "./BaseDialogForm";
import { MaterialConnectionCRUDAction } from "api/shp";
import { MaterialConnectionSerializer } from "api/types/shpTypes";
import { addServerErrors } from "utils";
import store from "redux/store";
import { yupResolver } from "@hookform/resolvers/yup";

const _newMaterialConnection: Partial<MaterialConnectionSerializer> = {
  id: 0,
  name: "",
  equivalent_length: null,
  inlet_material: null,
  outlet_material: null,
  inlet_diameter: null,
  outlet_diameter: null,
};

const _dialogName = "MODAL_MATERIALCONNECTION";

export const showMaterialConnectionDialog = (
  _dialogObject = _newMaterialConnection
) => {
  store.dispatch(
    showDialog({
      dialogName: _dialogName,
      dialogObject: { ..._newMaterialConnection, ..._dialogObject },
    })
  );
};

export const closeMaterialConnectionDialog = () => {
  store.dispatch(hideDialog());
};

export const destroyMaterialConnection = (
  _materialConnection: MaterialConnectionSerializer
) => {
  if (_materialConnection && _materialConnection.id) {
    let newLine = "\r\n";
    let confirm_alert =
      "Tem certeza que deseja remover esta conexão de materiais?";
    confirm_alert += newLine;
    confirm_alert += _materialConnection.name;
    if (window.confirm(confirm_alert)) {
      store.dispatch(
        MaterialConnectionCRUDAction.destroy(_materialConnection.id)
      );
      return true;
    }
  }
  return false;
};

const validationSchema = () =>
  yup
    .object({
      name: yup.string().max(255).required(),
      inlet_material: yup.number().integer().min(1).required(),
      inlet_diameter: yup.number().integer().min(1).required(),
      outlet_material: yup
        .number()
        .integer()
        .min(1)
        .required()
        .notOneOf(
          [yup.ref("inlet_material")],
          "Materiais devem ser diferentes"
        ),
      outlet_diameter: yup.number().integer().min(1).required(),
      equivalent_length: yup.number().min(0).required(),
    })
    .required();

const MaterialConnectionDialogForm = () => {
  const dispatch = useAppDispatch();
  const materials = useAppSelector((state) => state.shp.materials);
  const diameters = useAppSelector((state) =>
    [...state.shp.diameters].sort(
      (a, b) => a.internal_diameter - b.internal_diameter
    )
  );

  const { dialogName, dialogObject } = useAppSelector(
    (state) => state.modal
  ) as {
    dialogName: string | null;
    dialogObject: MaterialConnectionSerializer;
  };
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<MaterialConnectionSerializer>({
    resolver: yupResolver(validationSchema()),
    defaultValues: dialogObject,
  });
  const inlet_material_id = useWatch({ control, name: "inlet_material" });
  const inlet_diameter_id = useWatch({ control, name: "inlet_diameter" });
  const outlet_material_id = useWatch({ control, name: "outlet_material" });
  const outlet_diameter_id = useWatch({ control, name: "outlet_diameter" });

  useEffect(() => {
    const _diameter = diameters.find((d) => d.id === inlet_diameter_id);
    if (
      materials &&
      diameters &&
      inlet_material_id &&
      _diameter?.material !== inlet_material_id
    ) {
      const material = materials.find((m) => m.id === inlet_material_id);
      if (material?.default_diameter) {
        setValue("inlet_diameter", material.default_diameter, {
          shouldValidate: true,
        });
      } else {
        setValue(
          "inlet_diameter",
          diameters.find((d) => d.material === inlet_material_id)?.id,
          { shouldValidate: true }
        );
      }
    }
  }, [diameters, inlet_material_id, inlet_diameter_id, materials, setValue]);

  useEffect(() => {
    const _diameter = diameters.find((d) => d.id === outlet_diameter_id);
    if (
      materials &&
      diameters &&
      outlet_material_id &&
      _diameter?.material !== outlet_material_id
    ) {
      const material = materials.find((m) => m.id === outlet_material_id);
      if (material?.default_diameter) {
        setValue("outlet_diameter", material.default_diameter, {
          shouldValidate: true,
        });
      } else {
        setValue(
          "outlet_diameter",
          diameters.find((d) => d.material === outlet_material_id)?.id,
          {
            shouldValidate: true,
          }
        );
      }
    }
  }, [diameters, outlet_material_id, outlet_diameter_id, materials, setValue]);

  useEffect(() => {
    reset(dialogObject);
  }, [dialogObject, reset]);

  const handleCreate = (_materialConnection: MaterialConnectionSerializer) => {
    dispatch(MaterialConnectionCRUDAction.create(_materialConnection))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleUpdate = (_materialConnection: MaterialConnectionSerializer) => {
    dispatch(MaterialConnectionCRUDAction.partialUpdate(_materialConnection))
      .then((res) => {
        handleClose();
      })
      .catch((errors) => {
        addServerErrors(errors.response.data, setError);
      });
  };

  const handleDestroy = () => {
    if (destroyMaterialConnection(dialogObject)) {
      handleClose();
    }
  };

  const onSubmit = (data: MaterialConnectionSerializer) => {
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
    closeMaterialConnectionDialog();
  };

  return (
    <BaseDialogForm
      key={dialogObject.id}
      open={dialogName === _dialogName ? true : false}
      title={
        dialogObject.id
          ? "Editar Conexão de materiais"
          : "Criar Conexão de materiais"
      }
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
      {materials.length > 0 && (
        <Controller
          control={control}
          name="inlet_material"
          render={({ field: { value, onChange } }) => (
            <TextField
              select
              label="Material de entrada"
              value={value || ""}
              onChange={(event) => {
                onChange(event.target.value);
              }}
              error={errors.inlet_material ? true : false}
              helperText={errors.inlet_material?.message}
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
                      _diameter.material === inlet_material_id ? "" : "none",
                  }}
                >
                  {_diameter.name} ({_diameter.internal_diameter} mm)
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      )}

      {materials.length > 0 && (
        <Controller
          control={control}
          name="outlet_material"
          render={({ field: { value, onChange } }) => (
            <TextField
              select
              label="Material de saída"
              value={value || ""}
              onChange={(event) => {
                onChange(event.target.value);
              }}
              error={errors.outlet_material ? true : false}
              helperText={errors.outlet_material?.message}
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
                    display:
                      _diameter.material === outlet_material_id ? "" : "none",
                  }}
                >
                  {_diameter.name} ({_diameter.internal_diameter} mm)
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      )}
      <TextField
        label="Comprimento Equivalente (m)"
        type="number"
        inputProps={{ step: "0.01" }}
        error={errors.equivalent_length ? true : false}
        helperText={errors.equivalent_length?.message}
        {...register("equivalent_length")}
      />
    </BaseDialogForm>
  );
};

export default MaterialConnectionDialogForm;
