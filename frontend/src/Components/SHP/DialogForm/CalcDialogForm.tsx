import * as yup from "yup";

import { Controller, useForm, useWatch } from "react-hook-form";
import { MenuItem, TextField, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { closeDialog, openDialog } from "redux/modal";
import { getNewPath, initialState, setCalc } from "redux/shp";
import { useAppDispatch, useAppSelector } from "redux/utils";

import BaseDialogForm from "./BaseDialogForm";
import { MaterialCRUDAction } from "api/shp";
import { MaterialSerializer } from "api/types/shpTypes";
import { addServerErrors } from "utils";
import store from "redux/store";
import { yupResolver } from "@hookform/resolvers/yup";

const _dialogName = "DIALOG_SHP_CALC";

export interface SHPCalcCreator {
  material: number | null;
  diameter: number | null;
  fixtures: number | null;
  level_diference: number;
}

export const showSHPCalcDialog = () => {
  store.dispatch(
    openDialog({
      dialogName: _dialogName,
      dialogObject: {},
    })
  );
};

export const closeSHPCalcDialog = () => {
  store.dispatch(closeDialog(_dialogName));
};

const validationSchema = () =>
  yup
    .object({
      material: yup.number().integer().min(1).required(),
      diameter: yup.number().integer().min(1).required(),
      fixtures: yup.number().integer().min(1).required(),
      level_diference: yup.number().min(0).required(),
    })
    .required();

const CalcDialogForm = () => {
  const dispatch = useAppDispatch();
  const materials = useAppSelector((state) => state.shp.materials);
  const config = useAppSelector((state) => state.shp.configs[0]);
  const diameters = useAppSelector((state) => state.shp.diameters);
  const openModals = useAppSelector((state) => state.modal.openModals);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SHPCalcCreator>({
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

  const onSubmit = (data: SHPCalcCreator) => {
    const newCalc = { ...initialState };
    newCalc.material_id = data.material;
    newCalc.diameter_id = data.diameter;
    // const newPath = getNewPath(newCalc);
    newCalc.paths = [];
    const RESPath = getNewPath(newCalc);
    newCalc.paths.push(RESPath);
    const RROPath = getNewPath(newCalc);
    newCalc.paths.push(RROPath);
    const fixPath = getNewPath(newCalc);
    newCalc.paths.push(fixPath);
    RESPath.end = "R0";
    RROPath.start = "R0";
    RROPath.end = "A";
    if (fixPath && fixPath.fixture && data.fixtures) {
      fixPath.start = "A";
      fixPath.has_fixture = true;
      fixPath.fixture.active = true;
      fixPath.fixture.end = "H1";
      for (let i = 1; i < data.fixtures; i++) {
        const path = getNewPath(newCalc);
        if (data.level_diference) {
          path.length = data.level_diference;
          path.level_difference = -data.level_diference;
        }
        newCalc.paths.push(path);
        const fixPath = getNewPath(newCalc);
        if (fixPath && fixPath.fixture) {
          fixPath.has_fixture = true;
          fixPath.fixture.active = true;
          fixPath.fixture.end = `H${i + 1}`;
          newCalc.paths.push(fixPath);
        }
      }
    }
    dispatch(setCalc(newCalc));
    handleClose();
  };

  const handleReset = () => {
    reset();
  };

  const handleClose = () => {
    closeSHPCalcDialog();
  };

  return (
    <BaseDialogForm
      open={openModals.includes(_dialogName)}
      title="Criar novo cálculo de SHP"
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
        label="Numero de hidrantes"
        inputProps={{ step: "1" }}
        error={errors.fixtures ? true : false}
        helperText={errors.fixtures?.message}
        {...register("fixtures")}
      />
      <TextField
        type="number"
        label="Pé direito"
        defaultValue={0}
        inputProps={{ step: "0.01" }}
        error={errors.level_diference ? true : false}
        helperText={errors.level_diference?.message}
        {...register("level_diference")}
      />
    </BaseDialogForm>
  );
};

export default CalcDialogForm;
