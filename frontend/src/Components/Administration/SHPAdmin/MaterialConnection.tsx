import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridColumns,
  GridRowId,
  GridToolbarContainer,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { Grid, Stack, Typography } from "@mui/material";
import {
  destroyMaterialConnection,
  showMaterialConnectionDialog,
} from "Components/DialogForm/MaterialConnectionDialogForm";

import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import { MaterialConnectionSerializer } from "api/types/shpTypes";
import React from "react";
import { useAppSelector } from "redux/utils";

function EditToolbar() {
  return (
    <GridToolbarContainer>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item xs={1} />
        <Grid item xs>
          <Typography variant="h6">
            Tabela de Conexões entre Materiais
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              showMaterialConnectionDialog();
            }}
            sx={{ margin: 1 }}
            title="Adicionar Conexão entre materiais"
          >
            Conexão entre Material
          </Button>
        </Grid>
      </Grid>
    </GridToolbarContainer>
  );
}

const CustomNoRowsOverlay = () => {
  return (
    <Stack height="100%" alignItems="center" justifyContent="center">
      <Typography>Sem conexão entre materiais cadastrado.</Typography>
    </Stack>
  );
};

const MaterialConnection = () => {
  const materials = useAppSelector((state) => state.shp.materials);
  const diameters = useAppSelector((state) => state.shp.diameters);

  const materialConnections = useAppSelector(
    (state) => state.shp.materialConnections
  );

  const handleEditClick = (id: GridRowId) => {
    if (id) {
      const materialConnection = materialConnections.find(
        (row) => row.id === id
      );
      showMaterialConnectionDialog(materialConnection);
    }
  };

  const handleDeleteClick = (id: GridRowId) => {
    if (id) {
      const materialConnection = materialConnections.find(
        (row) => row.id === id
      );
      destroyMaterialConnection(materialConnection);
    }
  };

  const getMaterialName = (
    params: GridValueGetterParams<number, MaterialConnectionSerializer>
  ): string => {
    return materials.find((m) => m.id === params.value)?.name;
  };

  const getDiameterName = (
    params: GridValueGetterParams<number, MaterialConnectionSerializer>
  ): string => {
    const diameter = diameters.find((m) => m.id === params.value);
    if (diameter) {
      return `${diameter.name} (${diameter.internal_diameter} mm)`;
    }
    return params.value.toString();
  };

  const CommonFieldAttributes: GridColDef = {
    field: "",
    flex: 1,
    editable: false,
    sortable: false,
    headerAlign: "center",
    align: "center",
  };

  const columns: GridColumns = [
    {
      ...CommonFieldAttributes,
      field: "name",
      headerName: "Name",
      align: "left",
    },
    {
      ...CommonFieldAttributes,
      field: "inlet_material",
      headerName: "Material de Entrada",
      valueGetter: getMaterialName,
    },
    {
      ...CommonFieldAttributes,
      field: "inlet_diameter",
      headerName: "Diâmetro de Entrada",
      valueGetter: getDiameterName,
    },
    {
      ...CommonFieldAttributes,
      field: "outlet_material",
      headerName: "Material de Saída",
      valueGetter: getMaterialName,
    },
    {
      ...CommonFieldAttributes,
      field: "outlet_diameter",
      headerName: "Diâmetro de Saída",
      valueGetter: getDiameterName,
    },
    {
      ...CommonFieldAttributes,
      field: "equivalent_length",
      headerName: "Comprimento Equivalente (m)",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={() => {
              handleEditClick(id);
            }}
            color="warning"
            title="Editar Conexão entre materiais"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => {
              handleDeleteClick(id);
            }}
            color="error"
            title="Remover Conexão entre materiais"
          />,
        ];
      },
    },
  ];

  return (
    <Box width="100%">
      <DataGrid
        autoHeight
        rows={materialConnections}
        columns={columns}
        components={{
          Toolbar: EditToolbar,
          NoRowsOverlay: CustomNoRowsOverlay,
        }}
        rowHeight={50}
        hideFooter
        disableColumnMenu
        disableColumnFilter
        disableColumnSelector
      />
    </Box>
  );
};
export default MaterialConnection;
