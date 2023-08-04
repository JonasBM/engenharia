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
} from "api/igc";
import React, { useState } from "react";
import {
  destroyMaterial,
  showMaterialDialog,
} from "Components/IGC/DialogForm/MaterialDialogForm";
import { useAppDispatch, useAppSelector } from "redux/utils";

import { Container } from "@mui/system";
import FittingDiameter from "./FittingDiameter";
import { MaterialFileSerializer } from "api/types/igcTypes";
import Reduction from "./Reduction";
import { saveIGCMaterial } from "../System/Calculation/utils";
import { showDiameterDialog } from "Components/IGC/DialogForm/DiameterDialogForm";
import { showFittingDialog } from "Components/IGC/DialogForm/FittingDialogForm";

const Material = () => {
  const dispatch = useAppDispatch();
  const materials = useAppSelector((state) => state.igc.materials);

  const [materialFile, setMaterialFile] = useState<MaterialFileSerializer>();

  const handleLoadMaterialFile = (file: Blob) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const materialFile = JSON.parse(
        e.target?.result?.toString() || ""
      ) as MaterialFileSerializer;
      if (
        materialFile.fileinfo.type === "igc_material" &&
        materialFile.fileinfo.version.startsWith("1.0.")
      ) {
        setMaterialFile(materialFile);
      } else {
        let newLine = "\r\n";
        let message = "Problemas ao carregar o arquivo";
        message += newLine;
        message += `filetype: ${materialFile.fileinfo.type}, expected: igc_material`;
        message += newLine;
        message += `fileversion: ${materialFile.fileinfo.version}, expected: 1.0.x`;
        alert(message);
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
          title="Adicionar Material"
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
                dispatch(loadMaterialBackup(materialFile))
                  .then((res) => {
                    if (res) {
                      dispatch(MaterialCRUDAction.list());
                      dispatch(DiameterCRUDAction.list());
                      dispatch(FittingCRUDAction.list());
                      dispatch(FittingDiameterCRUDAction.list());
                      dispatch(ReductionCRUDAction.list());
                      setMaterialFile(undefined);
                    }
                  })
                  .catch();
              }}
              title="Salvar material carregado"
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
          <Button
            variant="contained"
            component="label"
            title="Carregar arquivo de material"
          >
            Carregar Material
            <input
              type="file"
              accept=".igcmat"
              hidden
              onChange={(e) => {
                if (e.target.files) {
                  handleLoadMaterialFile(e.target.files[0]);
                }
              }}
            />
          </Button>
        )}
      </Stack>
      <Container sx={{ padding: 2 }}>
        {materials.map((_material) => (
          <Box key={_material.id} sx={{ border: 1 }}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ backgroundColor: "warning.main" }}
                title="Clique para expandir"
              >
                <Typography sx={{ width: "50%", flexShrink: 0 }}>
                  {_material.name}
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
                        spacing={3}
                        width="100%"
                      >
                        <Button
                          onClick={() => {
                            showMaterialDialog(_material);
                          }}
                          title="Editar material"
                        >
                          Editar
                        </Button>
                        <Button
                          color="error"
                          onClick={() => {
                            destroyMaterial(_material);
                          }}
                          title="Remover material"
                        >
                          Excluir
                        </Button>
                        <Button
                          startIcon={<Add />}
                          onClick={() => {
                            showDiameterDialog({ material: _material.id });
                          }}
                          title="Adicionar diâmetro"
                        >
                          Diâmetro
                        </Button>
                        <Button
                          startIcon={<Add />}
                          onClick={() => {
                            showFittingDialog();
                          }}
                          title="Adicionar conexão"
                        >
                          Conexão
                        </Button>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button
                          startIcon={<Save />}
                          onClick={() => {
                            if (_material.id) saveIGCMaterial(_material.id);
                          }}
                          title="Baixar arquivo de backup do material"
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
