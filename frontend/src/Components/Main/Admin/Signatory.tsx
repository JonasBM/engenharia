import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridColumns,
  GridRowId,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { Grid, Stack, Typography } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import React from "react";
import { useAppSelector } from "redux/utils";
import { destroySignatory, showSignatoryDialog } from "./DialogForm/SignatoryDialogForm";

function EditToolbar() {
  return (
    <GridToolbarContainer>
      <Grid container direction="row" justifyContent="center" alignItems="center">
        <Grid item xs={1} />
        <Grid item xs>
          <Typography variant="h6">Tabela de Signatários</Typography>
        </Grid>
        <Grid item xs={4}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              showSignatoryDialog();
            }}
            sx={{ margin: 1 }}
            title="Adicionar signatário"
          >
            Signatário
          </Button>
        </Grid>
      </Grid>
    </GridToolbarContainer>
  );
}

const CustomNoRowsOverlay = () => {
  return (
    <Stack height="100%" alignItems="center" justifyContent="center">
      <Typography>Sem signatário cadastrado.</Typography>
    </Stack>
  );
};

const Signatory = () => {
  const signatories = useAppSelector((state) => state.core.signatories);

  const handleEditClick = (id: GridRowId) => {
    if (id) {
      const signatory = signatories.find((row) => row.id === id);
      showSignatoryDialog(signatory);
    }
  };

  const handleDeleteClick = (id: GridRowId) => {
    if (id) {
      const signatory = signatories.find((row) => row.id === id);
      if (signatory) destroySignatory(signatory);
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
      field: "title",
      headerName: "Título",
    },

    {
      ...CommonFieldAttributes,
      field: "document",
      headerName: "Documento",
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
            title="Editar signatário"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => {
              handleDeleteClick(id);
            }}
            color="error"
            title="Remover signatário"
          />,
        ];
      },
    },
  ];

  return (
    <Box width="100%">
      <DataGrid
        autoHeight
        rows={signatories}
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
export default Signatory;
