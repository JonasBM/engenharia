import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridColumns,
  GridRowId,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { Grid, Stack, Typography } from "@mui/material";
import {
  destroyReduction,
  showReductionDialog,
} from "Components/DialogForm/ReductionDialogForm";

import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import { MaterialSerializer } from "api/types/shpTypes";
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
          <Typography variant="h6">Tabela de Reduções</Typography>
        </Grid>
        <Grid item xs={4}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              showReductionDialog();
            }}
            sx={{ margin: 1 }}
          >
            Redução
          </Button>
        </Grid>
      </Grid>
    </GridToolbarContainer>
  );
}

const CustomNoRowsOverlay = () => {
  return (
    <Stack height="100%" alignItems="center" justifyContent="center">
      <Typography>Sem redução cadastrado.</Typography>
    </Stack>
  );
};

const Reduction = ({ material }: { material: MaterialSerializer }) => {
  const reductions = useAppSelector((state) =>
    [...state.shp.reductions]
      .filter((r) => r.material === material.id)
      .sort((a, b) => a.name.localeCompare(b.name))
  );

  const handleEditClick = (id: GridRowId) => {
    if (id) {
      const reduction = reductions.find((row) => row.id === id);
      showReductionDialog(reduction);
    }
  };

  const handleDeleteClick = (id: GridRowId) => {
    if (id) {
      const reduction = reductions.find((row) => row.id === id);
      destroyReduction(reduction);
    }
  };

  const CommonFieldAttributes: GridColDef = {
    field: "",
    flex: 1,
    editable: false,
    sortable: false,
    align: "center",
    headerAlign: "center",
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
      field: "equivalent_length",
      headerName: "Comprimento Equivalente (m)",
    },
    {
      ...CommonFieldAttributes,
      field: "material",
      headerName: "Material",
    },
    {
      ...CommonFieldAttributes,
      field: "inlet_diameter",
      headerName: "Diâmetro de Entrada",
    },
    {
      ...CommonFieldAttributes,
      field: "outlet_diameter",
      headerName: "Diâmetro de Saída",
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
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => {
              handleDeleteClick(id);
            }}
            color="error"
          />,
        ];
      },
    },
  ];

  return (
    <Box width="100%">
      <DataGrid
        autoHeight
        rows={reductions}
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
export default Reduction;
