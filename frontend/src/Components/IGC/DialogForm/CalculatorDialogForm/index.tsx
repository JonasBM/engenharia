import * as yup from "yup";

import { Controller, useForm, useWatch } from "react-hook-form";
import React, { ReactNode, useEffect, useState } from "react";
import { closeDialog, openDialog } from "redux/modal";
import { useAppDispatch, useAppSelector } from "redux/utils";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { MaterialCRUDAction } from "api/igc";
import { addServerErrors, decimalFormatter } from "utils";
import store from "redux/store";
import { yupResolver } from "@hookform/resolvers/yup";
import { Close } from "@mui/icons-material";
import { CilinderSerializer, GASSerializer, MeterSerializer } from "api/types/igcTypes";
import { CalculatorTypes, UnitTypes, calculateCilinder, calculateConcurrencyFactor, convert, findMeter } from "./utils";

/*
CONVERT: gas, consumo, unidade entrada, unidade saida => valor
METER: gas, consumo, unidade entrada => medidor
CILINDERS: gas, consumo, unidade entrada, Simultaneidade (calc button), Cilindro, Fator de redução => numero de cilindros

*/

export interface ICalculator {
  type: CalculatorTypes;
  gas: GASSerializer;
  input: number;
  inputUnit: UnitTypes;
  outputUnit: UnitTypes;
  cilinder?: CilinderSerializer;
  concurrencyFactor?: number;
  reductionFactor?: number;
}

export type ResultType = [number | null, string | MeterSerializer | CilinderSerializer | null];

const _newObject: Partial<ICalculator> = {
  type: CalculatorTypes.CONVERT,
  gas: undefined,
  input: undefined,
  inputUnit: UnitTypes.Kcalh,
  outputUnit: UnitTypes.Kcalh,
  cilinder: undefined,
  concurrencyFactor: undefined,
  reductionFactor: 0,
};

const _dialogName = "MODAL_IGC_CALCULATOR";

export const showCalculatorDialog = () => {
  store.dispatch(
    openDialog({
      dialogName: _dialogName,
      dialogObject: { ..._newObject },
    })
  );
};

export const closeCalculatorDialog = () => {
  store.dispatch(closeDialog(_dialogName));
};

const validationSchema = () =>
  yup
    .object({
      type: yup.mixed().oneOf(Object.values(CalculatorTypes)).required(),
      gas: yup.object().required(),
      input: yup.number().min(0.01).required(),
      inputUnit: yup.mixed().oneOf(Object.values(UnitTypes)).required(),
      outputUnit: yup.mixed().oneOf(Object.values(UnitTypes)).required(),
      cilinder: yup.object().when("type", {
        is: CalculatorTypes.CILINDERS,
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),
      concurrencyFactor: yup
        .number()
        .min(0)
        .nullable()
        .notRequired()
        .transform((value) => (Number.isNaN(value) ? null : value)),
      reductionFactor: yup
        .number()
        .min(0)
        .nullable()
        .notRequired()
        .transform((value) => (Number.isNaN(value) ? null : value)),
    })
    .required();

const CalculatorDialogForm = () => {
  const dispatch = useAppDispatch();
  const gases = useAppSelector((state) => state.igc.gases);
  const cilinders = useAppSelector((state) => state.igc.cilinders);
  const meters = useAppSelector((state) => state.igc.meters);
  const openModals = useAppSelector((state) => state.modal.openModals);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { isDirty, errors },
  } = useForm<ICalculator>({
    resolver: yupResolver(validationSchema()),
    defaultValues: _newObject,
  });

  const calculatorType = useWatch({ control, name: "type" });

  const [result, setResult] = useState<ResultType>([null, null]);

  useEffect(() => {
    if (calculatorType == CalculatorTypes.CONVERT) {
    } else if (calculatorType == CalculatorTypes.CILINDERS) {
      setValue("outputUnit", UnitTypes.Kgh);
    } else if (calculatorType == CalculatorTypes.METER) {
      setValue("outputUnit", UnitTypes.m3h);
    }
  }, [calculatorType]);

  const onSubmit = (data: ICalculator) => {
    const _result = convert(data.input, data.gas, data.inputUnit, data.outputUnit);
    if (data.type == CalculatorTypes.CONVERT) {
      setResult([_result, data.outputUnit]);
    } else if (data.type == CalculatorTypes.CILINDERS) {
      if (!data.cilinder) return;
      if (!data.concurrencyFactor) {
        data.concurrencyFactor = calculateConcurrencyFactor(data.input, data.gas, data.inputUnit) * 100;
      }
      if (!data.reductionFactor) {
        data.reductionFactor = 0;
      }
      const _cilinderNumber = calculateCilinder(
        _result,
        data.cilinder,
        data.concurrencyFactor / 100,
        data.reductionFactor / 100
      );
      setResult([_cilinderNumber, data.cilinder]);
    } else if (data.type == CalculatorTypes.METER) {
      const meter = findMeter(_result, meters);
      setResult([_result, meter]);
    }
    reset(data);
  };

  const handleReset = () => {
    reset();
  };

  const handleClose = () => {
    closeCalculatorDialog();
  };

  const onCloseWithoutBackDrop = (event: ICalculator, reason: "backdropClick" | "escapeKeyDown") => {
    if (reason !== "backdropClick") {
      handleClose();
    }
  };

  const getResultLabel = ([_result, _unit]: ResultType): ReactNode | string => {
    if (!_unit) return "Sem Resultado";

    if (typeof _unit === "string") {
      return (
        <>
          <strong>{decimalFormatter(_result || 0, 2) || "-"}</strong> {_unit || ""}
        </>
      );
    }

    if ("max_flow" in _unit) {
      return (
        <>
          <strong>{_unit.name}</strong>
          {` (Q: ${decimalFormatter(_result || 0, 2)} ${UnitTypes.m3h})`}
        </>
      );
    }

    if ("vaporization_rate" in _unit) {
      return (
        <>
          <strong>{decimalFormatter(_result || 0, 2) || "-"}</strong> Cilindros {_unit.name}
        </>
      );
    }

    return "Sem Resultado";
  };

  return (
    <Dialog
      open={openModals.includes(_dialogName)}
      maxWidth={"sm"}
      onClose={onCloseWithoutBackDrop}
      fullScreen={fullScreen}
      fullWidth
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          Calculadora
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Controller
                control={control}
                name="type"
                render={({ field: { value, onChange } }) => (
                  <TextField
                    label="Tipo"
                    select
                    value={value || ""}
                    onChange={onChange}
                    error={errors.type ? true : false}
                    helperText={errors.type?.message}
                  >
                    {Object.values(CalculatorTypes).map((_type) => (
                      <MenuItem key={_type} value={_type}>
                        {_type}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              {gases.length > 0 && (
                <Controller
                  control={control}
                  name="gas"
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      label="Gás"
                      select
                      value={value?.id || ""}
                      onChange={(event) => {
                        onChange(gases.find((el) => el.id?.toString() === event.target.value.toString()));
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
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="number"
                inputProps={{ step: "0.01" }}
                label="Consumo"
                error={errors.input ? true : false}
                helperText={errors.input?.message}
                {...register("input")}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                control={control}
                name="inputUnit"
                render={({ field: { value, onChange } }) => (
                  <TextField
                    label="Unidade de consumo"
                    select
                    value={value || ""}
                    onChange={onChange}
                    error={errors.inputUnit ? true : false}
                    helperText={errors.inputUnit?.message}
                  >
                    {Object.values(UnitTypes).map((_type) => (
                      <MenuItem key={_type} value={_type}>
                        {_type}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={6} sx={{ display: calculatorType === CalculatorTypes.CILINDERS ? undefined : "none" }}>
              <Controller
                control={control}
                name="concurrencyFactor"
                render={({ field: { value, onChange } }) => (
                  <TextField
                    type="number"
                    inputProps={{ step: "0.01" }}
                    label="Fator de simultaneidade (%)"
                    error={errors.concurrencyFactor ? true : false}
                    helperText={errors.concurrencyFactor?.message}
                    value={value === null || value === undefined ? "" : value}
                    onChange={onChange}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sx={{ display: calculatorType === CalculatorTypes.CILINDERS ? undefined : "none" }}>
              <Controller
                control={control}
                name="reductionFactor"
                render={({ field: { value, onChange } }) => (
                  <TextField
                    type="number"
                    inputProps={{ step: "0.01" }}
                    label="Fator de redução (%)"
                    error={errors.reductionFactor ? true : false}
                    helperText={errors.reductionFactor?.message}
                    value={value === null || value === undefined ? "" : value}
                    onChange={onChange}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Typography variant="h6">{isDirty ? "..." : getResultLabel(result)}</Typography>
            </Grid>
            <Grid item xs={6} sx={{ display: calculatorType === CalculatorTypes.CILINDERS ? undefined : "none" }}>
              {cilinders.length > 0 && (
                <Controller
                  control={control}
                  name="cilinder"
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      label="Cilindro"
                      select
                      value={value?.id || ""}
                      onChange={(event) => {
                        onChange(cilinders.find((el) => el.id?.toString() === event.target.value.toString()));
                      }}
                      error={errors.cilinder ? true : false}
                      helperText={errors.cilinder?.message}
                    >
                      {cilinders.map((_cilinder) => (
                        <MenuItem key={_cilinder.id} value={_cilinder.id}>
                          {_cilinder.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              )}
            </Grid>
            <Grid item xs={6} sx={{ display: calculatorType === CalculatorTypes.CONVERT ? undefined : "none" }}>
              <Controller
                control={control}
                name="outputUnit"
                render={({ field: { value, onChange } }) => (
                  <TextField
                    label="Unidade de saída"
                    select
                    value={value || ""}
                    onChange={onChange}
                    error={errors.outputUnit ? true : false}
                    helperText={errors.outputUnit?.message}
                  >
                    {Object.values(UnitTypes).map((_type) => (
                      <MenuItem key={_type} value={_type}>
                        {_type}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Grid container direction="row" justifyContent="center" alignItems="center">
            <Grid item xs />
            <Grid item xs={2}>
              <Button type="submit">Calcular</Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
