import * as yup from "yup";

import { Controller, useForm, useWatch } from "react-hook-form";
import { MenuItem, TextField, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { closeDialog, openDialog } from "redux/modal";
import { getNewPath, initialState, setCalc } from "redux/igcSecondary";
import { useAppDispatch, useAppSelector } from "redux/utils";

import BaseDialogForm from "./BaseDialogForm";
import store from "redux/store";
import { yupResolver } from "@hookform/resolvers/yup";

const _dialogName = "DIALOG_IGC_CALC";

export interface IGCCalcCreator {
  material: number | null;
  diameter: number | null;
  paths: number | null;
}

export const showIGCCalcDialog = () => {
  store.dispatch(
    openDialog({
      dialogName: _dialogName,
      dialogObject: {},
    })
  );
};

export const closeIGCCalcDialog = () => {
  store.dispatch(closeDialog(_dialogName));
};

const validationSchema = () =>
  yup
    .object({
      material: yup.number().integer().min(1).required(),
      diameter: yup.number().integer().min(1).required(),
      paths: yup.number().integer().min(1).required(),
    })
    .required();

const CalcDialogForm = () => {
  const dispatch = useAppDispatch();
  const materials = useAppSelector((state) => state.igc.materials);
  const config = useAppSelector((state) => state.igc.configs[0]);
  const diameters = useAppSelector((state) => state.igc.diameters);
  const openModals = useAppSelector((state) => state.modal.openModals);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<IGCCalcCreator>({
    resolver: yupResolver(validationSchema()),
    defaultValues: {},
  });
  const material_id = useWatch({ control, name: "material" });
  const diameter_id = useWatch({ control, name: "diameter" });

  useEffect(() => {
    if (!material_id && materials.length > 0 && materials[0].id && config) {
      if (config.material) {
        setValue("material", config.material);
      } else {
        setValue("material", materials[0].id);
      }
    }
  }, [materials, material_id, setValue, config]);

  useEffect(() => {
    const _diameter = diameters.find((d) => d.id === diameter_id);
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
        setValue("diameter", material.default_diameter, {
          shouldValidate: true,
        });
      } else {
        setValue(
          "diameter",
          diameters.find((d) => d.material === material_id)?.id || null,
          { shouldValidate: true }
        );
      }
    }
  }, [diameters, material_id, diameter_id, materials, setValue]);

  const onSubmit = (data: IGCCalcCreator) => {
    const newCalc = { ...initialState };
    newCalc.material_id = data.material;
    newCalc.diameter_id = data.diameter;
    // const newPath = getNewPath(newCalc);
    newCalc.paths = [];
    const CGPath = getNewPath(newCalc);
    newCalc.paths.push(CGPath);
    if (data.paths && data.paths > 1){
      for (let i = 1; i < data.paths; i++) {
        const path = getNewPath(newCalc);
        newCalc.paths.push(path);
      }
    }
    dispatch(setCalc(newCalc));
    handleClose();
  };

  const handleReset = () => {
    reset();
  };

  const handleClose = () => {
    closeIGCCalcDialog();
  };

  return (
    <BaseDialogForm
      open={openModals.includes(_dialogName)}
      title="Criar novo cálculo de IGC"
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      onReset={handleReset}
      onDelete={undefined}
    >
      <Typography variant="body2">
        O novo cálculo irá substituir o cálculo atual
      </Typography>
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
          name="diameter"
          render={({ field: { value, onChange } }) => (
            <TextField
              select
              label="Diâmetro de entrada"
              value={value || ""}
              onChange={(event) => {
                onChange(event.target.value);
              }}
              error={errors.diameter ? true : false}
              helperText={errors.diameter?.message}
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
      <TextField
        type="number"
        label="Numero de Trechos"
        inputProps={{ step: "1" }}
        error={errors.paths ? true : false}
        helperText={errors.paths?.message}
        {...register("paths")}
      />
    </BaseDialogForm>
  );
};

export default CalcDialogForm;
