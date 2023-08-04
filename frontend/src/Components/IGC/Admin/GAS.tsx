import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridColumnHeaderParams,
  GridColumns,
  GridRowId,
  GridToolbarContainer,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { GASSerializer } from "api/types/igcTypes";
import { Grid, Stack, Typography } from "@mui/material";
import {
  destroyGAS,
  showGASDialog,
} from "Components/IGC/DialogForm/GASDialogForm";

import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
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
          <Typography variant="h6">Tabela de Gases</Typography>
        </Grid>
        <Grid item xs={4}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              showGASDialog();
            }}
            sx={{ margin: 1 }}
            title="Adicionar gás"
          >
            GÁS
          </Button>
        </Grid>
      </Grid>
    </GridToolbarContainer>
  );
}

const CustomNoRowsOverlay = () => {
  return (
    <Stack height="100%" alignItems="center" justifyContent="center">
      <Typography>Sem gás cadastrado.</Typography>
    </Stack>
  );
};

const GAS = () => {
  const gases = useAppSelector((state) => state.igc.gases);

  const handleEditClick = (id: GridRowId) => {
    if (id) {
      const gas = gases.find((row) => row.id === id);
      showGASDialog(gas);
    }
  };

  const handleDeleteClick = (id: GridRowId) => {
    if (id) {
      const gas = gases.find((row) => row.id === id);
      if (gas) destroyGAS(gas);
    }
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
      field: "pci",
      headerName: "PCI (kcal/m³)",
    },

    {
      ...CommonFieldAttributes,
      field: "relative_density",
      headerName: "Densidade relativa",
    },

    {
      ...CommonFieldAttributes,
      field: "start_pressure",
      headerName: "Pressão inicial (kPa)",
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
            title="Editar gás"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => {
              handleDeleteClick(id);
            }}
            color="error"
            title="Remover gás"
          />,
        ];
      },
    },
  ];

  return (
    <Box width="100%">
      <DataGrid
        autoHeight
        rows={gases}
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
export default GAS;
