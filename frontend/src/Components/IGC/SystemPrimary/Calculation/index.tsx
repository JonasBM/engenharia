import * as yup from "yup";

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
  alpha,
  styled,
  tableBodyClasses,
  tableCellClasses,
} from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import React, { useEffect } from "react";
import { cleanCalc, saveIGCCalc } from "./utils";
import { getNewPath, initialState } from "redux/igcPrimary";
import { useAppDispatch, useAppSelector } from "redux/utils";

import CalcToolbar from "./CalcToolbar";
import DialogFittings from "./DialogFittings";
import FileToolbar from "./FileToolbar";
import Path from "./Path";
import PathToolbar from "./PathToolbar";
import { IGCCalcSerializer } from "api/types/igcTypes";
import { calculateIGC } from "api/igc";
import { documentTitles } from "myConstants";
import { yupResolver } from "@hookform/resolvers/yup";

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

export const StyledTableCellBorderLeft = styled(TableCell)(({ theme }) => ({
  borderLeft: "1px solid",
  borderLeftColor: theme.palette.divider,
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.3),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.5),
  },
  margin: theme.spacing(1),
}));

const validationSchema = () =>
  yup
    .object({
      name: yup.string().max(255).notRequired(),
      material_id: yup.number().integer().min(1).required(),
      diameter_id: yup.number().integer().min(1).required(),
      gas_id: yup.number().integer().min(1).required(),
      paths: yup.array().of(
        yup.object().shape({
          start: yup.string().max(255).required(),
          end: yup.string().max(255).nullable(true),
          material_id: yup.number().integer().min(1).required(),
          diameter_id: yup.number().integer().min(1).required(),
        })
      ),
    })
    .required();

const IGC = () => {
  const dispatch = useAppDispatch();
  const igcCalc = useAppSelector((state) => state.igcPrimaryCalc);

  const formMethods = useForm<IGCCalcSerializer>({
    resolver: yupResolver(validationSchema()),
    defaultValues: initialState,
  });

  const {
    control,
    reset,
    getValues,
    setValue,
    formState: { errors, isDirty },
  } = formMethods;
  const {
    fields: paths,
    remove,
    append,
    move,
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
    document.title = "Cálculo de IGC";
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
    reset(igcCalc);
  }, [reset, igcCalc]);

  useEffect(() => {
    if (isDirty) {
      cleanCalc(getValues(), setValue);
    }
  }, [getValues, isDirty, setValue]);

  useEffect(() => {
    if (Object.entries(errors).length) {
      console.log(errors);
    }
  }, [errors]);

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;
    if (result.source.index !== result.destination.index) {
      move(result.source.index, result.destination.index);
      reset(getValues());
    }
  };

  const onSubmit = (data: IGCCalcSerializer) => {
    dispatch(calculateIGC(saveIGCCalc(data)))
      .then((data) => {
        reset(data);
      })
      .catch((errors) => {
        console.log(errors);
      });
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <DialogFittings />
        <Container maxWidth={false}>
          <FileToolbar />
          <CalcToolbar />
          <PathToolbar append={append} />
          <TableContainer component={Paper} sx={{ minWidth: 800 }}>
            <StyledTable size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell align="center" rowSpan={2} />
                  <TableCell align="center" rowSpan={2} />
                  <StyledTableCellBorderLeft align="center" width={"50px"} colSpan={2} rowSpan={2}>
                    TRECHO
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center" width={"50px"} rowSpan={2}>
                    Material
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center" rowSpan={2}>
                    &empty;
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center" colSpan={4}>
                    Potência (kcal/min)
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center" colSpan={5}>
                    Comprimento (m)
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center" rowSpan={2}>
                    Vazão
                    <br />
                    (m³/h)
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center" rowSpan={2}>
                    Velocidade
                    <br />
                    (m/s)
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center" rowSpan={2}>
                    Pressão
                    <br />
                    Inicial (kPa)
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center" rowSpan={2}>
                    &Delta;P
                    <br />
                    (kPa)
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center" rowSpan={2}>
                    Pressão
                    <br />
                    Final (kPa)
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center" rowSpan={2}>
                    Perda de
                    <br />
                    Carga (%)
                  </StyledTableCellBorderLeft>
                </TableRow>
                <TableRow>
                  {/* Potência */}
                  <StyledTableCellBorderLeft align="center">No ponto</StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">Computada</StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">F.S. (%)</StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">Adotada</StyledTableCellBorderLeft>
                  {/* Comprimento */}
                  <StyledTableCellBorderLeft align="center">Horizontal</StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">Sobe</StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">Desce</StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">Equivalente</StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">Total</StyledTableCellBorderLeft>
                </TableRow>
              </TableHead>
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="paths">
                  {(provided) => (
                    <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                      {paths.length > 0 &&
                        paths.map((_, _index) => (
                          <Draggable key={_index} draggableId={`paths-${_index}`} index={_index}>
                            {(provided, snapshot) => (
                              <Path index={_index} remove={remove} provided={provided} snapshot={snapshot} />
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
          {/* <CalcResult /> */}
        </Container>
      </form>
    </FormProvider>
  );
};

export default IGC;
