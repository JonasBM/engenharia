import {
  CalcType,
  FileInfoSerializer,
  PressureType,
  SHPCalcFixtureSerializer,
  SHPCalcPathSerializer,
  SHPCalcSerializer,
} from "api/types/shpTypes";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { formatInTimeZone } from "date-fns-tz";

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
  const total = state?.paths?.length;
  for (let i = 0; i < total; i++) {
    const path = state.paths[total - i - 1];
    if (path?.end && !path.has_fixture) {
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
  let lastNumber = 0;
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

export const getSHPCalc = () => {
  return {};
};
export const initialState = {
  fileinfo: getNewFileInfo(),
  name: "",
  pressure_type: null,
  calc_type: null,
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
