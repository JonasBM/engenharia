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
import { GASSerializer, MeterSerializer } from "api/types/igcTypes";
import { Grid, Stack, Typography } from "@mui/material";
import {
  destroyMeter,
  showMeterDialog,
} from "Components/IGC/DialogForm/MeterDialogForm";

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
          <Typography variant="h6">Tabela de medidores</Typography>
        </Grid>
        <Grid item xs={4}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              showMeterDialog();
            }}
            sx={{ margin: 1 }}
            title="Adicionar medidor"
          >
            medidor
          </Button>
        </Grid>
      </Grid>
    </GridToolbarContainer>
  );
}

const CustomNoRowsOverlay = () => {
  return (
    <Stack height="100%" alignItems="center" justifyContent="center">
      <Typography>Sem medidor cadastrado.</Typography>
    </Stack>
  );
};

const Meter = () => {
  const meters = useAppSelector((state) => state.igc.meters);
  const gases = useAppSelector((state) => state.igc.gases);

  const handleEditClick = (id: GridRowId) => {
    if (id) {
      const meter = meters.find((row) => row.id === id);
      showMeterDialog(meter);
    }
  };

  const handleDeleteClick = (id: GridRowId) => {
    if (id) {
      const meter = meters.find((row) => row.id === id);
      if (meter) destroyMeter(meter);
    }
  };

  const getGASName = (
    params: GridValueGetterParams<number, GASSerializer>
  ): string => {
    const gas = gases.find((g) => g.id === params.value);
    if (gas) {
      return gas.name;
    }
    return params.value?.toString() || "";
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
      field: "max_flow",
      headerName: "Vazão máxima (m³/h)",
    },

    {
      ...CommonFieldAttributes,
      field: "gas",
      headerName: "Gás",
      valueGetter: getGASName,
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
            title="Editar medidor"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => {
              handleDeleteClick(id);
            }}
            color="error"
            title="Remover medidor"
          />,
        ];
      },
    },
  ];

  return (
    <Box width="100%">
      <DataGrid
        autoHeight
        rows={meters}
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
export default Meter;
