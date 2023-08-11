import {
  FileInfoSerializer,
  IGCCalcPathSerializer,
  IGCCalcSerializer,
} from "api/types/igcTypes";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { formatInTimeZone } from "date-fns-tz";

export const checkLetter = (letter: string): boolean => {
  const check = letter === "CG";
  if (check) {
    alert('"CG" está designado para a Central de Gás');
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
  state: IGCCalcSerializer
): { start: string; end: string } => {
  let lastLetter = null;
  const total = state?.paths?.length;
  for (let i = 0; i < total; i++) {
    const path = state.paths[total - i - 1];
    if (path?.end) {
      lastLetter = path.end;
      break;
    }
  }
  const start = lastLetter ? lastLetter : "CG";
  const end = lastLetter ? nextString(lastLetter) : "A";
  return {
    start: start.toUpperCase(),
    end: end.toUpperCase(),
  };
};

export const getNewPath = (state: IGCCalcSerializer): IGCCalcPathSerializer => {
  const { start, end } = getNewStrings(state);
  return {
    start: start,
    end: end,
    material_id: state.material_id,
    diameter_id: state.diameter_id,
    power_rating_added: 0,
    length: 0,
    length_up: 0,
    length_down: 0,
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
    type: "igc_secondary_calc",
    version: "1.0.0",
    created: todayString,
    updated: todayString,
  };
};

export const getIGCCalc = () => {
  return {};
};
export const initialState = {
  fileinfo: getNewFileInfo(),
  name: "",
  calc_type: "SC",
  material_id: null,
  diameter_id: null,
  gas_id: null,
  paths: [],
} as IGCCalcSerializer;

const igcCalcSlice = createSlice({
  name: "igcSecondarycalc",
  initialState,
  reducers: {
    setCalc(state, action: PayloadAction<IGCCalcSerializer>) {
      return action.payload;
    },
    resetCalc(state) {
      return initialState;
    },
  },
});

export const { setCalc, resetCalc } = igcCalcSlice.actions;
export default igcCalcSlice.reducer;
