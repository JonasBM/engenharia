import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
} from "@mui/material";
import {
  CalcType,
  CalcTypes,
  PressureType,
  PressureTypes,
  SHPCalcSerializer,
} from "api/types/shpTypes";
import { Calculate, Save } from "@mui/icons-material";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import React, { useEffect } from "react";
import { flow_to_l_p_min, saveSHPCalc } from "./utils";

import { StyledTextField } from ".";
import { decimalFormatter } from "utils";
import { useAppSelector } from "redux/utils";

const CalcToolbar = () => {
  const fixtures = useAppSelector((state) => state.shp.fixtures);
  const config = useAppSelector((state) => state.shp.configs[0]);

  const {
    register,
    control,
    setValue,
    getValues,
    formState: { isDirty },
  } = useFormContext<SHPCalcSerializer>();

  const pressure_type = useWatch({ control, name: "pressure_type" });
  const calc_type = useWatch({ control, name: "calc_type" });
  const flow = useWatch({ control, name: "pump.flow" });
  const NPSHd = useWatch({ control, name: "pump.NPSHd" });

  return (
    <Toolbar
      sx={{
        minWidth: 800,
        display: pressure_type === PressureType.BOMBA.value ? "" : "none",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={3} width="100%">
        <TextField
          label="Nome do ponto da Bomba"
          sx={{ width: 200 }}
          InputLabelProps={{ shrink: true }}
          fullWidth={false}
          {...register("pump.node")}
        />
        <TextField
          label="Altura Manométrica"
          type="number"
          sx={{ width: 150 }}
          InputLabelProps={{ shrink: true }}
          fullWidth={false}
          inputProps={
            calc_type === CalcType.VAZAO_MINIMA.value
              ? {
                  step: "0.01",
                  style: {
                    color: "green",
                    fontWeight: "bold",
                  },
                  disabled: true,
                }
              : { step: "0.01" }
          }
          {...register("pump.head_height")}
        />
        <TextField
          disabled
          sx={{ width: 100 }}
          label="Vazão (L/min)"
          InputLabelProps={{ shrink: true }}
          fullWidth={false}
          value={decimalFormatter(flow_to_l_p_min(flow), 2) || "0,00"}
        />
        <TextField
          disabled
          sx={{ width: 100 }}
          label="Vazão (m³/s)"
          InputLabelProps={{ shrink: true }}
          fullWidth={false}
          value={decimalFormatter(flow, 6) || "0,00"}
        />
        <TextField
          disabled
          sx={{ width: 250 }}
          label="NPSH disponível p/ 1 atm e 20°C (m.c.a.)"
          InputLabelProps={{ shrink: true }}
          fullWidth={false}
          value={decimalFormatter(NPSHd, 2) || "0,00"}
        />
      </Stack>
    </Toolbar>
  );
};

export default CalcToolbar;
