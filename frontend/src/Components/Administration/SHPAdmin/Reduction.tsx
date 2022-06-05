import {
  Container,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
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
import {
  DiameterSerializer,
  MaterialSerializer,
  ReductionSerializer,
} from "api/types/shpTypes";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/utils";

import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import { ReductionCRUDAction } from "api/shp";
import SaveIcon from "@mui/icons-material/Save";
import { createMessage } from "redux-simplified";

interface EditToolbarProps {
  rows: GridRowsProp;
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
}

type ReductionRow = ReductionSerializer & {
  isNew: boolean;
  errors: any;
};

const _newReduction: Partial<ReductionRow> = {
  id: 0,
  name: null,
  equivalent_length: "",
  inlet_diameter: "",
  outlet_diameter: "",
  isNew: true,
  errors: null,
};

function EditToolbar(props: EditToolbarProps) {
  const dispatch = useAppDispatch();
  const { rows, setRows, setRowModesModel } = props;
  const row = rows.find((r) => r.id === _newReduction.id);

  const handleClick = () => {
    if (!row) {
      setRows((oldRows) => [...oldRows, { ..._newReduction }]);
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [_newReduction.id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
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
          <Typography variant="h6">Tabela de Reduções</Typography>
        </Grid>
        <Grid item xs={2}>
          <Button
            startIcon={<AddIcon />}
            onClick={handleClick}
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
      <Typography>Sem Reduções cadastradas.</Typography>
    </Stack>
  );
};

const Reduction = ({ material }: { material: MaterialSerializer }) => {
  const dispatch = useAppDispatch();
  const reductions = useAppSelector((state) => state.shp.reductions);
  const diameters = useAppSelector((state) => state.shp.diameters);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const [currentReductions, setCurrentReductions] = useState<ReductionRow[]>(
    []
  );

  const [currentDiameters, setCurrentDiameters] = useState<
    DiameterSerializer[]
  >([]);

  useEffect(() => {
    setCurrentReductions(
      reductions
        .filter((r) => r.material === material.id)
        .sort((a, b) => a.name.localeCompare(b.name)) as ReductionRow[]
    );
  }, [reductions, material]);

  useEffect(() => {
    setCurrentDiameters(
      diameters
        .filter((d) => d.material === material.id)
        .sort((a, b) => a.internal_diameter - b.internal_diameter)
    );
  }, [diameters, material]);

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
      const toDeleteRow = currentReductions.find((row) => row.id === id);
      let newLine = "\r\n";
      let confirm_alert = "Tem certeza que deseja remover este Diâmetro?";
      confirm_alert += newLine;
      confirm_alert += toDeleteRow.name;
      if (window.confirm(confirm_alert)) {
        dispatch(ReductionCRUDAction.destroy(id as number)).then(() => {
          setCurrentReductions(
            currentReductions.filter((row) => row.id !== id)
          );
        });
      }
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = currentReductions.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setCurrentReductions(currentReductions.filter((row) => row.id !== id));
    }
  };

  const promiseCreate = (_reduction: ReductionRow) => {
    return dispatch(ReductionCRUDAction.create(_reduction));
  };

  const promiseUpdate = (_reduction: ReductionRow) => {
    return dispatch(ReductionCRUDAction.partialUpdate(_reduction));
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    const promise = newRow.id ? promiseUpdate(newRow) : promiseCreate(newRow);

    const response = await promise
      .then((res) => {
        const newReduction = { ...newRow, ...res };
        setCurrentReductions(
          currentReductions.map((row) =>
            row.id === newRow.id ? newReduction : row
          )
        );
        return { ...newReduction, isNew: false };
      })
      .catch((errors) => {
        setRowModesModel({
          ...rowModesModel,
          [newRow.id]: { mode: GridRowModes.Edit },
        });
        // return { ...newRow, errors: errors.response.data };
        return newRow;
      });

    return response;
  };

  const getDiameterByID = (id: number, diameters: DiameterSerializer[]) => {
    return diameters.find((d) => d.id === id);
  };

  const CustomEditDiameterCell = (props: GridRenderEditCellParams) => {
    const { id, value, field, row } = props;
    const apiRef = useGridApiContext();

    const handleValueChange = (value: number | string) => {
      // if (row.errors?.[field]) {
      //   const newErrors = { ...row.errors, [field]: null };
      //   setCurrentReductions(
      //     currentReductions.map((row) =>
      //       row.id === id ? { ...row, errors: newErrors } : row
      //     )
      //   );
      // }
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
        {currentDiameters.map((_diameter) => (
          <MenuItem key={_diameter.id} value={_diameter.id}>
            {_diameter.name} ({_diameter.internal_diameter} mm)
          </MenuItem>
        ))}
      </TextField>
    );
  };

  const CustomDiameterCell = (props: GridRenderCellParams) => {
    const [diameter, setDiameter] = useState<DiameterSerializer>();

    useEffect(() => {
      const _diameter = getDiameterByID(props.value, currentDiameters);
      if (_diameter) {
        setDiameter(_diameter);
      }
    }, [props.value]);

    return (
      <Typography>
        {diameter
          ? `${diameter.name} (${diameter.internal_diameter} mm)`
          : props.value}
      </Typography>
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
      field: "inlet_diameter",
      headerName: "Diâmetro de Entrada",
      renderEditCell: (params: GridRenderEditCellParams) => {
        return <CustomEditDiameterCell {...params} />;
      },
      renderCell: (params: GridRenderCellParams) => {
        return <CustomDiameterCell {...params} />;
      },
    },
    {
      ...CommonFieldAttributes,
      field: "outlet_diameter",
      headerName: "Diâmetro de Saída",
      renderEditCell: (params: GridRenderEditCellParams) => {
        return <CustomEditDiameterCell {...params} />;
      },
      renderCell: (params: GridRenderCellParams) => {
        return <CustomDiameterCell {...params} />;
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
        rows={currentReductions}
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
            rows: currentReductions,
            setRows: setCurrentReductions,
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
export default Reduction;
