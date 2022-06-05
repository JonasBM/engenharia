import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridColumns,
  GridEventListener,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowParams,
  GridRowsProp,
  GridToolbarContainer,
  MuiEvent,
  useGridApiContext,
} from "@mui/x-data-grid";
import { Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import {
  MaterialConnectionSerializer,
  MaterialSerializer,
} from "api/types/shpTypes";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/utils";

import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import { MaterialConnectionCRUDAction } from "api/shp";
import SaveIcon from "@mui/icons-material/Save";
import { createMessage } from "redux-simplified";

interface EditToolbarProps {
  rows: GridRowsProp;
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
}

type MaterialConnectionRow = MaterialConnectionSerializer & {
  isNew: boolean;
  errors: any;
};

const _newMaterialConnection: Partial<MaterialConnectionRow> = {
  id: 0,
  name: null,
  equivalent_length: "",
  inlet_material: "",
  outlet_material: "",
  isNew: true,
};

function EditToolbar(props: EditToolbarProps) {
  const dispatch = useAppDispatch();
  const { rows, setRows, setRowModesModel } = props;
  const row = rows.find((r) => r.id === _newMaterialConnection.id);

  const handleClick = () => {
    if (!row) {
      setRows((oldRows) => [...oldRows, { ..._newMaterialConnection }]);
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [_newMaterialConnection.id]: {
          mode: GridRowModes.Edit,
          fieldToFocus: "name",
        },
      }));
    } else {
      dispatch(createMessage("Apenas 1 nova redução permitida por vez"));
    }
  };

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
          <Typography variant="h6">Tabela de Conexões de Materiais</Typography>
        </Grid>
        <Grid item xs={4}>
          <Button
            startIcon={<AddIcon />}
            onClick={handleClick}
            sx={{ margin: 1 }}
          >
            Conexão de Material
          </Button>
        </Grid>
      </Grid>
    </GridToolbarContainer>
  );
}

const CustomNoRowsOverlay = () => {
  return (
    <Stack height="100%" alignItems="center" justifyContent="center">
      <Typography>Sem conexão de material cadastradas.</Typography>
    </Stack>
  );
};

const MaterialConnection = () => {
  const dispatch = useAppDispatch();
  const materialConnections = useAppSelector(
    (state) => state.shp.materialConnections
  );
  const materials = useAppSelector((state) => state.shp.materials);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const [currentMaterialConnections, setCurrentMaterialConnections] = useState<
    MaterialConnectionRow[]
  >([]);

  useEffect(() => {
    setCurrentMaterialConnections(
      materialConnections as MaterialConnectionRow[]
    );
  }, [materialConnections]);

  const handleRowEditStart = (
    params: GridRowParams,
    event: MuiEvent<React.SyntheticEvent>
  ) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    event.defaultMuiPrevented = true;
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    if (id) {
      const toDeleteRow = currentMaterialConnections.find(
        (row) => row.id === id
      );
      let newLine = "\r\n";
      let confirm_alert =
        "Tem certeza que deseja remover esta Conexão de material?";
      confirm_alert += newLine;
      confirm_alert += toDeleteRow.name;
      if (window.confirm(confirm_alert)) {
        dispatch(MaterialConnectionCRUDAction.destroy(id as number)).then(
          () => {
            setCurrentMaterialConnections(
              currentMaterialConnections.filter((row) => row.id !== id)
            );
          }
        );
      }
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = currentMaterialConnections.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setCurrentMaterialConnections(
        currentMaterialConnections.filter((row) => row.id !== id)
      );
    }
  };

  const promiseCreate = (_materialConnection: MaterialConnectionRow) => {
    return dispatch(MaterialConnectionCRUDAction.create(_materialConnection));
  };

  const promiseUpdate = (_materialConnection: MaterialConnectionRow) => {
    return dispatch(
      MaterialConnectionCRUDAction.partialUpdate(_materialConnection)
    );
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    const promise = newRow.id ? promiseUpdate(newRow) : promiseCreate(newRow);

    const response = await promise
      .then((res) => {
        const newMaterialConection = { ...newRow, ...res };
        setCurrentMaterialConnections(
          currentMaterialConnections.map((row) =>
            row.id === newRow.id ? newMaterialConection : row
          )
        );
        return { ...newMaterialConection, isNew: false };
      })
      .catch((errors) => {
        setRowModesModel({
          ...rowModesModel,
          [newRow.id]: { mode: GridRowModes.Edit },
        });

        return { ...newRow, errors: errors.response.data };
      });

    return response;
  };

  const getMaterialByID = (id: number, _materials: MaterialSerializer[]) => {
    return _materials.find((m) => m.id === id);
  };

  const CustomEditDiameterCell = (props: GridRenderEditCellParams) => {
    const { id, value, field, row } = props;
    const apiRef = useGridApiContext();

    const handleValueChange = (value: number | string) => {
      if (row.errors?.[field]) {
        const newErrors = { ...row.errors, [field]: null };
        setCurrentMaterialConnections(
          currentMaterialConnections.map((row) =>
            row.id === id ? { ...row, errors: newErrors } : row
          )
        );
      }
      const newValue = value;
      apiRef.current.setEditCellValue({ id, field, value: newValue });
    };

    return (
      <TextField
        sx={{ textAlign: "center" }}
        variant="standard"
        select
        value={value || ""}
        onChange={(event) => {
          handleValueChange(event.target.value);
        }}
      >
        {materials.map((_material) => (
          <MenuItem key={_material.id} value={_material.id}>
            {_material.name}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  const CustomMaterialCell = (props: GridRenderCellParams) => {
    const [material, setMaterial] = useState<MaterialSerializer>();

    useEffect(() => {
      const _material = getMaterialByID(props.value, materials);
      if (_material) {
        setMaterial(_material);
      }
    }, [props.value]);

    return (
      <Typography>{material ? `${material.name}` : props.value}</Typography>
    );
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
      ...CommonFieldAttributes,
      field: "inlet_material",
      headerName: "Diâmetro de Entrada",
      renderEditCell: (params: GridRenderEditCellParams) => {
        return <CustomEditDiameterCell {...params} />;
      },
      renderCell: (params: GridRenderCellParams) => {
        return <CustomMaterialCell {...params} />;
      },
    },
    {
      ...CommonFieldAttributes,
      field: "outlet_material",
      headerName: "Diâmetro de Saída",
      renderEditCell: (params: GridRenderEditCellParams) => {
        return <CustomEditDiameterCell {...params} />;
      },
      renderCell: (params: GridRenderCellParams) => {
        return <CustomMaterialCell {...params} />;
      },
    },
    {
      ...CommonFieldAttributes,
      field: "equivalent_length",
      headerName: "Comprimento Equivalente (m)",
      type: "number",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
              color="primary"
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="error"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="warning"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
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
        rows={currentMaterialConnections}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowEditStart={handleRowEditStart}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        components={{
          Toolbar: EditToolbar,
          NoRowsOverlay: CustomNoRowsOverlay,
        }}
        componentsProps={{
          toolbar: {
            rows: currentMaterialConnections,
            setRows: setCurrentMaterialConnections,
            setRowModesModel,
          },
        }}
        experimentalFeatures={{ newEditingApi: true }}
        rowHeight={50}
        hideFooter
        disableColumnMenu
        disableColumnFilter
        disableColumnSelector
        onProcessRowUpdateError={(error: any) => {
          console.log(error);
        }}
      />
    </Box>
  );
};
export default MaterialConnection;
