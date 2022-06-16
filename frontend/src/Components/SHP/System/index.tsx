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
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import React, { useEffect } from "react";
import { getNewPath, initialState } from "redux/shp";
import { useAppDispatch, useAppSelector } from "redux/utils";

import CalcResult from "./CalcResult";
import CalcToolbar from "./CalcToolbar";
import DialogFittings from "./DialogFittings";
import FileToolbar from "./FileToolbar";
import Path from "./Path";
import PathToolbar from "./PathToolbar";
import { SHPCalcSerializer } from "api/types/shpTypes";
import { calculateSHP } from "api/shp";
import { documentTitles } from "myConstants";
import { saveSHPCalc } from "utils";
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
      pressure_type: yup.string().max(255).required(),
      calc_type: yup.string().max(255).required(),
      material_id: yup.number().integer().min(1).required(),
      diameter_id: yup.number().integer().min(1).required(),
      fixture_id: yup.number().integer().min(1).required(),
      paths: yup.array().of(
        yup.object().shape({
          start: yup.string().max(255).required(),
          end: yup.string().max(255).nullable(true),
          material_id: yup.number().integer().min(1).required(),
          diameter_id: yup.number().integer().min(1).required(),
          fittings_ids: yup.array().of(yup.number().notRequired()),
          has_fixture: yup.boolean().required(),
        })
      ),
    })
    .required();

const SHP = () => {
  const dispatch = useAppDispatch();
  const shpCalc = useAppSelector((state) => state.shpCalc);

  const formMethods = useForm<SHPCalcSerializer>({
    resolver: yupResolver(validationSchema()),
    defaultValues: initialState,
  });

  const {
    control,
    reset,
    getValues,
    formState: { errors },
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

  const onSubmit = (data: SHPCalcSerializer) => {
    dispatch(calculateSHP(saveSHPCalc(data)))
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
        <Container maxWidth="xl">
          <FileToolbar />
          <CalcToolbar />
          <PathToolbar append={append} />
          <TableContainer component={Paper} sx={{ minWidth: 800 }}>
            <StyledTable size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell align="center" />
                  <TableCell align="center" />
                  <StyledTableCellBorderLeft
                    align="center"
                    width={"50px"}
                    colSpan={2}
                  >
                    TRECHO
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center" width={"30px"}>
                    Hid
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center" width={"100px"}>
                    Material
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">
                    &empty;
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">
                    Comprimento
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">
                    Desnível
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">
                    Equivalente
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">
                    Vazão
                    <br />
                    (L/min)
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">
                    Velocidade
                    <br />
                    (m/s)
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">
                    Comprimento
                    <br />
                    Total (m)
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">
                    Jt
                    <br />
                    (m.c.a./m)
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">
                    &Delta;t
                    <br />
                    (m.c.a.)
                  </StyledTableCellBorderLeft>
                  <StyledTableCellBorderLeft align="center">
                    Pressão
                    <br />
                    (m.c.a.)
                  </StyledTableCellBorderLeft>
                </TableRow>
              </TableHead>
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="paths">
                  {(provided) => (
                    <TableBody
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {paths.length > 0 &&
                        paths.map((_, _index) => (
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
          {/* <CalcResult /> */}
        </Container>
      </form>
    </FormProvider>
  );
};

export default SHP;
