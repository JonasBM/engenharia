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
import { CilinderSerializer } from "api/types/igcTypes";
import { Grid, Stack, Typography } from "@mui/material";
import {
  destroyCilinder,
  showCilinderDialog,
} from "Components/IGC/DialogForm/CilinderDialogForm";

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
          <Typography variant="h6">Tabela de Cilindros</Typography>
        </Grid>
        <Grid item xs={4}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              showCilinderDialog();
            }}
            sx={{ margin: 1 }}
            title="Adicionar cilindro"
          >
            Cilindro
          </Button>
        </Grid>
      </Grid>
    </GridToolbarContainer>
  );
}

const CustomNoRowsOverlay = () => {
  return (
    <Stack height="100%" alignItems="center" justifyContent="center">
      <Typography>Sem cilindro cadastrado.</Typography>
    </Stack>
  );
};

const Cilinder = () => {
  const cilinders = useAppSelector((state) => state.igc.cilinders);

  const handleEditClick = (id: GridRowId) => {
    if (id) {
      const cilinder = cilinders.find((row) => row.id === id);
      showCilinderDialog(cilinder);
    }
  };

  const handleDeleteClick = (id: GridRowId) => {
    if (id) {
      const cilinder = cilinders.find((row) => row.id === id);
      if (cilinder) destroyCilinder(cilinder);
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
      field: "vaporization_rate",
      headerName: "Taxa de Vaporização",
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
            title="Editar cilindro"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => {
              handleDeleteClick(id);
            }}
            color="error"
            title="Remover cilindro"
          />,
        ];
      },
    },
  ];

  return (
    <Box width="100%">
      <DataGrid
        autoHeight
        rows={cilinders}
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
export default Cilinder;
