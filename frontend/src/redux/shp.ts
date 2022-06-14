import {
  FileInfoSerializer,
  SHPCalcFixtureSerializer,
  SHPCalcPathSerializer,
  SHPCalcSerializer,
} from "api/types/shpTypes";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { formatInTimeZone } from "date-fns-tz";

// export interface SHPCalcFixture {
//   active: boolean;
//   end: string;
//   hose_length: number;
//   level_difference: number;
// }

// export interface SHPCalcPath {
//   start: string;
//   end: string;
//   fixture?: Partial<SHPCalcFixture>;
//   has_fixture: boolean;
//   material_id: number;
//   diameter_id: number;
//   length: number;
//   equivalent_length: number;
//   extra_equivalent_length: number;
//   total_length: number;
//   level_difference: number;
//   fittings_ids: number[];
// }

export type SHPCalcType = "vazao_minima" | "vazao_residual";
export const shpCalcTypes = [
  { title: "Vazão mínima", value: "vazao_minima" },
  { title: "Vazão Residual", value: "vazao_residual" },
];

export type SHPPressureType = "gravitacional" | "bomba";
export const shpPressureTypes = [
  { title: "Gravitacional", value: "gravitacional" },
  { title: "Bomba", value: "bomba" },
];

// export interface SHPCalcState {
//   fileinfo: FileInfoSerializer;
//   name: string;
//   pressure_type: SHPPressureType;
//   calc_type: SHPCalcType;
//   pump_node: string;
//   material_id: number;
//   diameter_id: number;
//   fixture_id: number;
//   paths: Partial<SHPCalcPath>[];
// }

export const checkLetter = (letter: string): boolean => {
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

const getNewStrings = (
  state: SHPCalcSerializer
): { start: string; end: string } => {
  let lastLetter = null;
  const total = state.paths.length;
  for (let i = 0; i < total; i++) {
    const path = state.paths[total - i - 1];
    if (path.end && !path.has_fixture) {
      lastLetter = path.end;
      break;
    }
  }
  const start = lastLetter ? lastLetter : "RES";
  const end = lastLetter ? nextString(lastLetter) : "A";
  return {
    start: start.toUpperCase(),
    end: end.toUpperCase(),
  };
};

const getNewFixtureString = (state: SHPCalcSerializer): string => {
  let lastNumber = 1;
  for (const path of state.paths) {
    if (path.fixture.end) {
      const current = parseInt(path.fixture.end.match(/\d+/).shift());
      lastNumber = current > lastNumber ? current : lastNumber;
    }
  }
  return `H${lastNumber + 1}`;
};

export const getNewFixture = (
  state: SHPCalcSerializer
): SHPCalcFixtureSerializer => {
  return {
    active: false,
    end: getNewFixtureString(state),
    hose_length: 0,
    level_difference: 0,
  };
};

export const getNewPath = (state: SHPCalcSerializer): SHPCalcPathSerializer => {
  const { start, end } = getNewStrings(state);
  return {
    start: start,
    end: end,
    has_fixture: false,
    fixture: getNewFixture(state),
    material_id: state.material_id,
    diameter_id: state.diameter_id,
    length: 0,
    level_difference: 0,
    fittings_ids: [],
  };
};

export const getNewFileInfo = (): FileInfoSerializer => {
  const todayString = formatInTimeZone(
    new Date(),
    "America/Sao_Paulo",
    "yyyy-MM-dd HH:mm:ssXXX"
  );
  return {
    type: "shp_calc",
    version: "1.0.0",
    created: todayString,
    updated: todayString,
  };
};

export const initialState = {
  fileinfo: getNewFileInfo(),
  name: "",
  pressure_type: "gravitacional",
  calc_type: "vazao_minima",
  pump_node: "",
  material_id: null,
  diameter_id: null,
  fixture_id: null,
  paths: [],
} as SHPCalcSerializer;

const shpCalcSlice = createSlice({
  name: "shpcalc",
  initialState,
  reducers: {
    setCalc(state, action: PayloadAction<SHPCalcSerializer>) {
      return action.payload;
    },
    resetCalc(state) {
      return initialState;
    },
  },
});

export const { setCalc, resetCalc } = shpCalcSlice.actions;
export default shpCalcSlice.reducer;
