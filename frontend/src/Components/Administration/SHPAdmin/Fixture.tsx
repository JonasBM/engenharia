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
import { FixtureSerializer, fixtureTypes } from "api/types/shpTypes";
import { Grid, Stack, Typography } from "@mui/material";
import {
  destroyFixture,
  showFixtureDialog,
} from "Components/DialogForm/FixtureDialogForm";

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
          <Typography variant="h6">Tabela de Hidrantes</Typography>
        </Grid>
        <Grid item xs={4}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              showFixtureDialog();
            }}
            sx={{ margin: 1 }}
            title="Adicionar hidrante"
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

  const getFixtureType = (
    params: GridValueGetterParams<string, FixtureSerializer>
  ): string => {
    return fixtureTypes.find((ft) => ft.value === params.value)?.name;
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
      field: "nozzle_type",
      headerName: "Tipo de hidrante",
      valueGetter: getFixtureType,
    },
    // {
    //   ...CommonFieldAttributes,
    //   field: "k_factor",
    //   headerName: "Fator de Vazão",
    // },
    // {
    //   ...CommonFieldAttributes,
    //   field: "k_nozzle",
    //   headerName: "Coeficiente tipico do esguicho",
    // },
    // {
    //   ...CommonFieldAttributes,
    //   field: "outlet_diameter",
    //   headerName: "Diâmetro de saída do esguicho (mm)",
    // },
    {
      ...CommonFieldAttributes,
      field: "minimum_flow_rate",
      headerName: "Vazão mínima (l/min)",
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
            title="Editar hidrante"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => {
              handleDeleteClick(id);
            }}
            color="error"
            title="Remover hidrante"
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
