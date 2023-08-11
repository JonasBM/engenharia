import { AppBar, Box, Button, MenuItem, Stack, Toolbar } from "@mui/material";
import {
  Controller,
  UseFieldArrayAppend,
  useFormContext,
  useWatch,
} from "react-hook-form";
import React, { useEffect } from "react";
import { getNewPath, initialState, setCalc } from "redux/igcPrimary";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { Add } from "@mui/icons-material";
import { IGCCalcSerializer } from "api/types/igcTypes";
import { StyledTextField } from ".";
import { showIGCCalcDialog } from "Components/IGC/DialogForm/PrimaryCalcDialogForm";

const PathToolbar = ({
  append,
}: {
  append: UseFieldArrayAppend<IGCCalcSerializer, "paths">;
}) => {
  const dispatch = useAppDispatch();
  const { control, getValues, setValue } = useFormContext<IGCCalcSerializer>();
  const materials = useAppSelector((state) => state.igc.materials);
  const config = useAppSelector((state) => state.igc.configs[0]);
  const diameters = useAppSelector((state) =>
    [...state.igc.diameters].sort(
      (a, b) => a.internal_diameter - b.internal_diameter
    )
  );
  const material_id = useWatch({ control, name: "material_id" });
  const diameter_id = useWatch({ control, name: "diameter_id" });

  useEffect(() => {
    if (!material_id && materials.length > 0 && config) {
      if (config.material) {
        setValue("material_id", config.material || null);
      } else {
        setValue("material_id", materials[0].id || null);
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
          diameters.find((d) => d.material === material_id)?.id || null
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
              showIGCCalcDialog();
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
