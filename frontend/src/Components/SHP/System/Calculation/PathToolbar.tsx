import { AppBar, Box, Button, MenuItem, Stack, Toolbar } from "@mui/material";
import {
  Controller,
  UseFieldArrayAppend,
  useFormContext,
  useWatch,
} from "react-hook-form";
import React, { useEffect } from "react";
import { getNewPath, initialState, setCalc } from "redux/shp";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { Add } from "@mui/icons-material";
import { SHPCalcSerializer } from "api/types/shpTypes";
import { StyledTextField } from ".";
import { showSHPCalcDialog } from "Components/SHP/DialogForm/CalcDialogForm";

const PathToolbar = ({
  append,
}: {
  append: UseFieldArrayAppend<SHPCalcSerializer, "paths">;
}) => {
  const dispatch = useAppDispatch();
  const { control, getValues, setValue } = useFormContext<SHPCalcSerializer>();
  const materials = useAppSelector((state) => state.shp.materials);
  const config = useAppSelector((state) => state.shp.configs[0]);
  const diameters = useAppSelector((state) =>
    [...state.shp.diameters].sort(
      (a, b) => a.internal_diameter - b.internal_diameter
    )
  );
  const material_id = useWatch({ control, name: "material_id" });
  const diameter_id = useWatch({ control, name: "diameter_id" });

  useEffect(() => {
    if (!material_id && materials.length > 0 && config) {
      if (config.material) {
        setValue("material_id", config.material);
      } else {
        setValue("material_id", materials[0].id);
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
        setValue("diameter_id", material.default_diameter);
      } else {
        setValue(
          "diameter_id",
          diameters.find((d) => d.material === material_id)?.id
        );
      }
    }
  }, [diameters, material_id, diameter_id, materials, setValue]);

  const handleCleanup = () => {
    let newLine = "\r\n";
    let confirm_alert = "Tem certeza que deseja limpar o cálculo?";
    confirm_alert += newLine;
    confirm_alert +=
      "Isto irá remover todos os dados e iniciar um cálculo limpo";
    if (window.confirm(confirm_alert)) {
      dispatch(setCalc({ ...initialState }));
    }
    return;
  };

  return (
    <AppBar position="static" color="secondary" sx={{ minWidth: 800 }}>
      <Toolbar variant="dense">
        <Stack direction="row" alignItems="center" spacing={3} width="100%">
          {materials.length > 0 && (
            <Controller
              control={control}
              name="material_id"
              render={({ field: { value, onChange } }) => (
                <StyledTextField
                  sx={{ width: "200px" }}
                  select
                  value={value || ""}
                  onChange={(event) => {
                    onChange(event.target.value);
                  }}
                >
                  {materials.map((_material) => (
                    <MenuItem key={_material.id} value={_material.id}>
                      {_material.name}
                    </MenuItem>
                  ))}
                </StyledTextField>
              )}
            />
          )}
          {diameters.length > 0 && (
            <Controller
              control={control}
              name="diameter_id"
              render={({ field: { value, onChange } }) => (
                <StyledTextField
                  sx={{ width: "200px" }}
                  select
                  value={value || ""}
                  onChange={(event) => {
                    onChange(event.target.value);
                  }}
                >
                  {diameters.map((_diameter) => (
                    <MenuItem
                      key={_diameter.id}
                      value={_diameter.id}
                      sx={{
                        display:
                          _diameter.material === material_id ? "" : "none",
                      }}
                    >
                      {_diameter.name} ({_diameter.internal_diameter} mm)
                    </MenuItem>
                  ))}
                </StyledTextField>
              )}
            />
          )}
          <Button
            startIcon={<Add />}
            onClick={() => {
              append(getNewPath(getValues()));
            }}
            title={"Adicionar trecho"}
          >
            Trecho
          </Button>
          <Button
            color="error"
            onClick={handleCleanup}
            title={"Iniciar um cálculo limpo"}
          >
            Limpar
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            color="success"
            onClick={() => {
              showSHPCalcDialog();
            }}
          >
            Criar novo cálculo
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default PathToolbar;
