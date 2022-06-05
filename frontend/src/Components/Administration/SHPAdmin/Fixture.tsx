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
  destroyFixture,
  showFixtureDialog,
} from "Components/DialogForm/FixtureDialogForm";
import { useAppDispatch, useAppSelector } from "redux/utils";

import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import React from "react";

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
          <Typography variant="h6">Tabela de Hidrantes</Typography>
        </Grid>
        <Grid item xs={4}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              showFixtureDialog();
            }}
            sx={{ margin: 1 }}
          >
            Hidrante
          </Button>
        </Grid>
      </Grid>
    </GridToolbarContainer>
  );
}

const CustomNoRowsOverlay = () => {
  return (
    <Stack height="100%" alignItems="center" justifyContent="center">
      <Typography>Sem hidrante cadastrado.</Typography>
    </Stack>
  );
};

const Fixture = () => {
  const dispatch = useAppDispatch();
  const fixtures = useAppSelector((state) => state.shp.fixtures);

  const handleEditClick = (id: GridRowId) => {
    if (id) {
      const fixture = fixtures.find((row) => row.id === id);
      showFixtureDialog(fixture);
    }
  };

  const handleDeleteClick = (id: GridRowId) => {
    if (id) {
      const fixture = fixtures.find((row) => row.id === id);
      destroyFixture(fixture);
    }
  };

  const CommonFieldAttributes: GridColDef = {
    field: "",
    flex: 1,
    editable: true,
    sortable: false,
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
      field: "actions",
      type: "actions",
      headerName: "Actions",
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
        rows={fixtures}
        columns={columns}
        components={{
          Toolbar: EditToolbar,
          NoRowsOverlay: CustomNoRowsOverlay,
        }}
        componentsProps={
          {
            // toolbar: {
            //   rows: currentMaterialConnections,
            //   setRows: setCurrentMaterialConnections,
            //   setRowModesModel,
            // },
          }
        }
        rowHeight={50}
        hideFooter
        disableColumnMenu
        disableColumnFilter
        disableColumnSelector
      />
    </Box>
  );
};
export default Fixture;
