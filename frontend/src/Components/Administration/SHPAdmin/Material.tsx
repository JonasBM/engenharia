import * as React from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Button,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Add, ExpandMore } from "@mui/icons-material";
import {
  destroyMaterial,
  showMaterialDialog,
} from "Components/DialogForm/MaterialDialogForm";

import { Container } from "@mui/system";
import FittingDiameter from "./FittingDiameter";
import Reduction from "./Reduction";
import { showDiameterDialog } from "Components/DialogForm/DiameterDialogForm";
import { showFittingDialog } from "Components/DialogForm/FittingDialogForm";
import { useAppSelector } from "redux/utils";

const Material = () => {
  const materials = useAppSelector((state) => state.shp.materials);

  return (
    <Box>
      <Button
        onClick={() => {
          showMaterialDialog();
        }}
      >
        Adicionar Material
      </Button>
      <Container sx={{ padding: 2 }}>
        {materials.map((_material) => (
          <Box key={_material.id} sx={{ border: 1 }}>
            <Accordion>
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
