import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Add, Close, ExpandMore, Save } from "@mui/icons-material";
import {
  DiameterCRUDAction,
  FittingCRUDAction,
  FittingDiameterCRUDAction,
  MaterialCRUDAction,
  ReductionCRUDAction,
  loadMaterialBackup,
} from "api/shp";
import React, { useState } from "react";
import {
  destroyMaterial,
  showMaterialDialog,
} from "Components/DialogForm/MaterialDialogForm";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { Container } from "@mui/system";
import FittingDiameter from "./FittingDiameter";
import { MaterialFileSerializer } from "api/types/shpTypes";
import Reduction from "./Reduction";
import { saveSHPMaterial } from "utils";
import { showDiameterDialog } from "Components/DialogForm/DiameterDialogForm";
import { showFittingDialog } from "Components/DialogForm/FittingDialogForm";

const Material = () => {
  const dispatch = useAppDispatch();
  const materials = useAppSelector((state) => state.shp.materials);

  const [materialFile, setMaterialFile] = useState<MaterialFileSerializer>();
  // const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  // const handleChange = (panel: string) => {
  //   setExpanded((value) => {
  //     return { ...value, [panel]: !value[panel] };
  //   });
  // };

  const handleLoadMaterialFile = (file: Blob) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const materialFile = JSON.parse(
        e.target.result.toString()
      ) as MaterialFileSerializer;
      if (
        materialFile.fileinfo.type === "shp_material" &&
        materialFile.fileinfo.version.startsWith("1.0.")
      ) {
        setMaterialFile(materialFile);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="start"
        alignItems="center"
        spacing={3}
        width="100%"
      >
        <Button
          onClick={() => {
            showMaterialDialog();
          }}
        >
          Adicionar Material
        </Button>
        {materialFile ? (
          <Paper
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              label="Material carregado"
              value={materialFile.material.name}
              onChange={(e) => {
                setMaterialFile({
                  ...materialFile,
                  material: { ...materialFile.material, name: e.target.value },
                });
              }}
              fullWidth={false}
            />
            <Button
              sx={{ marginX: 1 }}
              onClick={() => {
                dispatch(loadMaterialBackup(materialFile)).then((res) => {
                  console.log(res);
                  if (res) {
                    dispatch(MaterialCRUDAction.list());
                    dispatch(DiameterCRUDAction.list());
                    dispatch(FittingCRUDAction.list());
                    dispatch(FittingDiameterCRUDAction.list());
                    dispatch(ReductionCRUDAction.list());
                    setMaterialFile(undefined);
                  }
                });
              }}
            >
              Salvar
            </Button>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <IconButton
              onClick={() => {
                setMaterialFile(undefined);
              }}
            >
              <Close />
            </IconButton>
          </Paper>
        ) : (
          <Button variant="contained" component="label">
            Carregar Material
            <input
              type="file"
              accept=".shpmat"
              hidden
              onChange={(e) => {
                handleLoadMaterialFile(e.target.files[0]);
              }}
            />
          </Button>
        )}
      </Stack>
      <Container sx={{ padding: 2 }}>
        {materials.map((_material) => (
          <Box key={_material.id} sx={{ border: 1 }}>
            <Accordion
            // expanded={expanded[`panel-${_material.id}`] ? true : false}
            // onChange={() => {
            //   handleChange(`panel-${_material.id}`);
            // }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ backgroundColor: "warning.main" }}
              >
                <Typography sx={{ width: "50%", flexShrink: 0 }}>
                  {_material.name}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  C={_material.hazen_williams_coefficient}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack
                  direction="column"
                  justifyContent="center"
                  alignItems="center"
                  spacing={1}
                >
                  <AppBar position="static" color="secondary">
                    <Toolbar variant="dense">
                      <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={1}
                        width="100%"
                      >
                        <Button
                          onClick={() => {
                            showMaterialDialog(_material);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          color="error"
                          onClick={() => {
                            destroyMaterial(_material);
                          }}
                        >
                          Excluir
                        </Button>
                        <Button
                          startIcon={<Add />}
                          onClick={() => {
                            showDiameterDialog({ material: _material.id });
                          }}
                        >
                          Diâmetro
                        </Button>
                        <Button
                          startIcon={<Add />}
                          onClick={() => {
                            showFittingDialog({ material: _material.id });
                          }}
                        >
                          Conexão
                        </Button>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button
                          startIcon={<Save />}
                          onClick={() => {
                            saveSHPMaterial(_material.id);
                          }}
                        >
                          Baixar
                        </Button>
                      </Stack>
                    </Toolbar>
                  </AppBar>
                  <FittingDiameter material={_material} />
                  <Reduction material={_material} />
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Box>
        ))}
      </Container>
    </Box>
  );
};

export default Material;
