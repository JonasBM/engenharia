import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { FileInfoSerializer } from "api/types/shpTypes";
import store from "./store";

export interface SHPCalcFixture {
  active: boolean;
  end: string;
  hose_length: number;
  hose_internal_diameter: number;
  level_difference: number;
}

export interface SHPCalcPath {
  start: string;
  end: string;
  fixture?: Partial<SHPCalcFixture>;
  has_fixture: boolean;
  material_id: number;
  diameter_id: number;
  length: number;
  equivalent_length: number;
  extra_equivalent_length: number;
  total_length: number;
  level_difference: number;
  fittings_ids: number[];
}

export type SHPCalcType = "indeterminado" | "residual";
export const shpCalcTypes = [
  { title: "Indeterminado", value: "indeterminado" },
  { title: "Residual", value: "residual" },
];

export type SHPPressureType = "gravitacional" | "bomba";
export const shpPressureTypes = [
  { title: "Gravitacional", value: "gravitacional" },
  { title: "Bomba", value: "bomba" },
];

export interface SHPCalcState {
  fileinfo: FileInfoSerializer;
  name: string;
  pressure_type: SHPPressureType;
  calc_type: SHPCalcType;
  pump_node: string;
  material_id: number;
  diameter_id: number;
  fixture_id: number;
  paths: Partial<SHPCalcPath>[];
}

export const checkLetter = (letter: string) => {
  const check = letter === "RES";
  if (check) {
    alert('"RES" está designado para o reservatório');
  }
  return !check;
};

const nextString = (str: string): string => {
  if (!str) return "A";
  let tail = "";
  let i = str.length - 1;
  let char = str[i];
  while (char === "Z" && i > 0) {
    i--;
    char = str[i];
    tail = "A" + tail;
  }
  if (char === "Z") return "AA" + tail;
  return str.slice(0, i) + String.fromCharCode(char.charCodeAt(0) + 1) + tail;
};

const getBiggerString = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return a.length > b.length;
  }
  return a > b;
};

const getNewStrings = (state: SHPCalcState): { start: string; end: string } => {
  let lastLetter = "";
  for (const path of state.paths) {
    lastLetter = getBiggerString(path.end, lastLetter) ? path.end : lastLetter;
  }
  const start = lastLetter ? lastLetter : "RES";
  const end = lastLetter ? nextString(lastLetter) : "A";
  return {
    start: start.toUpperCase(),
    end: end.toUpperCase(),
  };
};

const getNewFixture = (state: SHPCalcState): Partial<SHPCalcFixture> => {
  return {
    active: false,
    end: `H${state.paths.length}`,
    hose_length: undefined,
    level_difference: undefined,
  };
};

export const getNewPath = (state: SHPCalcState): Partial<SHPCalcPath> => {
  const { start, end } = getNewStrings(state);
  return {
    start: start,
    end: end,
    has_fixture: false,
    fixture: getNewFixture(state),
    material_id: state.material_id,
    diameter_id: state.diameter_id,
    length: undefined,
    level_difference: undefined,
    fittings_ids: [],
  };
};

export const initialState = {
  name: "",
  pressure_type: "gravitacional",
  calc_type: "indeterminado",
  pump_node: "",
  paths: [],
} as SHPCalcState;

const shpCalcSlice = createSlice({
  name: "shpcalc",
  initialState,
  reducers: {
    setCalc(state, action: PayloadAction<SHPCalcState>) {
      return action.payload;
    },
    resetCalc(state) {
      return initialState;
    },
  },
});

export const { setCalc, resetCalc } = shpCalcSlice.actions;
export default shpCalcSlice.reducer;
