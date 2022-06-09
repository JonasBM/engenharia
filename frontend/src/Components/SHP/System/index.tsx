import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  alpha,
  styled,
  tableBodyClasses,
  tableCellClasses,
} from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import React, { useEffect } from "react";
import { SHPCalcState, getNewPath, initialState, setCalc } from "redux/shp";
import { useAppDispatch, useAppSelector } from "redux/utils";

import CalcToolbar from "./CalcToolbar";
import DialogFittings from "./DialogFittings";
import Path from "./Path";
import PathToolbar from "./PathToolbar";
import { documentTitles } from "myConstants";

const StyledTable = styled(Table)(({ theme }) => ({
  [`.${tableCellClasses.head}`]: { fontWeight: "bold" },
  [`.${tableCellClasses.root}`]: {
    paddingLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.25),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  [`.${tableBodyClasses.root} .${tableCellClasses.root}`]: {
    paddingTop: theme.spacing(0.25),
    paddingBottom: theme.spacing(0.25),
  },
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.3),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.5),
  },
  margin: theme.spacing(1),
}));

const SHP = () => {
  const dispatch = useAppDispatch();
  const shpCalc = useAppSelector((state) => state.shpCalc);

  const formMethods = useForm<SHPCalcState>({
    defaultValues: initialState,
  });
  const { control, reset, getValues, register } = formMethods;
  const {
    fields: paths,
    remove,
    append,
    move,
    insert,
  } = useFieldArray({
    control,
    name: "paths",
  });
  const material_id = useWatch({
    control,
    name: "material_id",
  });
  const diameter_id = useWatch({
    control,
    name: "diameter_id",
  });

  useEffect(() => {
    document.title = "Cálculo de SHP";
    return () => {
      document.title = documentTitles.PORTAL;
    };
  }, []);

  useEffect(() => {
    if (material_id && diameter_id && paths.length === 0) {
      append(getNewPath(getValues()));
    }
  }, [material_id, diameter_id, append, paths.length, getValues]);

  useEffect(() => {
    reset(shpCalc);
  }, [reset, shpCalc]);

  const handleOnDragEnd = (result: any) => {
    console.log(result);
    if (!result.destination) return;
    if (result.source.index !== result.destination.index) {
      move(result.source.index, result.destination.index);
      reset(getValues());
    }
  };

  const onSubmit = (data: SHPCalcState) => {
    console.log(data);
    dispatch(setCalc(data));
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <DialogFittings />
        <Container maxWidth="xl">
          <Toolbar>
            <TextField
              label="Nome"
              sx={{ width: 400 }}
              InputLabelProps={{ shrink: true }}
              {...register("name")}
            />
          </Toolbar>
          <CalcToolbar />
          <PathToolbar append={append} />
          <TableContainer component={Paper}>
            <StyledTable
              sx={{ minWidth: 650 }}
              size="small"
              aria-label="a dense table"
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center" />
                  <TableCell align="center" />
                  <TableCell align="center" width={"50px"} colSpan={2}>
                    TRECHO
                  </TableCell>
                  <TableCell align="center" width={"30px"}>
                    H
                  </TableCell>
                  <TableCell align="center" width={"100px"}>
                    Material
                  </TableCell>
                  <TableCell align="center">&empty;</TableCell>
                  <TableCell align="center">Comprimento</TableCell>
                  <TableCell align="center">Desnível</TableCell>
                  <TableCell align="center">Equivalente</TableCell>
                  <TableCell align="center">Vazão L/min</TableCell>
                  <TableCell align="center">Velocidade m/s</TableCell>
                  <TableCell align="center">Comprimento Total</TableCell>
                  <TableCell align="center">Jt</TableCell>
                  <TableCell align="center">&Delta;t</TableCell>
                  <TableCell align="center">M.C.A.</TableCell>
                </TableRow>
              </TableHead>
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="paths">
                  {(provided) => (
                    <TableBody
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {paths.map((_, _index) => (
                        <Draggable
                          key={_index}
                          draggableId={`paths-${_index}`}
                          index={_index}
                        >
                          {(provided, snapshot) => (
                            <Path
                              index={_index}
                              remove={remove}
                              provided={provided}
                              snapshot={snapshot}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </TableBody>
                  )}
                </Droppable>
              </DragDropContext>
            </StyledTable>
          </TableContainer>
        </Container>
      </form>
    </FormProvider>
  );
};

export default SHP;
