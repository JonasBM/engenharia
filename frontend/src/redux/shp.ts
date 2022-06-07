import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { FileInfoSerializer } from "api/types/shpTypes";

export interface SHPCalcFixture {
  active: boolean;
  end: string;
  hose_length: number | string;
  hose_internal_diameter: number;
  level_difference: number | string;
}

export interface SHPCalcPath {
  start: string;
  end: string;
  fixture?: Partial<SHPCalcFixture>;
  has_fixture: boolean;
  material_id: number;
  diameter_id: number;
  length: number | string;
  equivalent_length: number | string;
  extra_equivalent_length: number | string;
  total_length: number | string;
  level_difference: number | string;
  fittings_ids: number[];
}

export type SHPCalcType = "gravitacional" | "bomba";

export const shpCalcTypes = ["gravitacional", "bomba"];

export interface SHPCalcState {
  fileinfo: FileInfoSerializer;
  name: string;
  type: SHPCalcType;
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
    hose_length: "",
    hose_internal_diameter: 0,
    level_difference: "",
  };
};

const getNewPath = (state: SHPCalcState): Partial<SHPCalcPath> => {
  const { start, end } = getNewStrings(state);
  return {
    start: start,
    end: end,
    has_fixture: false,
    fixture: getNewFixture(state),
    material_id: state.material_id,
    diameter_id: state.diameter_id,
    length: "",
    level_difference: "",
    fittings_ids: [],
  };
};

const initialState = {
  name: "",
  type: "gravitacional",
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
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setMaterial(state, action: PayloadAction<number>) {
      state.material_id = action.payload;
    },
    setDiameter(state, action: PayloadAction<number>) {
      state.diameter_id = action.payload;
    },
    setCalcFixture(state, action: PayloadAction<number>) {
      state.fixture_id = action.payload;
    },
    setType(state, action: PayloadAction<SHPCalcType>) {
      state.type = action.payload;
      state.pump_node = "";
    },
    setPumpNode(state, action: PayloadAction<string>) {
      state.pump_node = action.payload;
    },
    setPath(state, action: PayloadAction<[number, Partial<SHPCalcPath>]>) {
      const index =
        action.payload[0] > -1 ? action.payload[0] : state.paths.length;
      const path = action.payload[1] ? action.payload[1] : getNewPath(state);
      state.paths[index].length = action.payload[1].length;
      // state.paths[index] = { ...state.paths[index], ...path };
    },
    setFixture(
      state,
      action: PayloadAction<[number, Partial<SHPCalcFixture>]>
    ) {
      const index =
        action.payload[0] > -1 ? action.payload[0] : state.paths.length;
      const fixture = action.payload[1]
        ? action.payload[1]
        : getNewFixture(state);
      state.paths[index].fixture = {
        ...state.paths[index].fixture,
        ...fixture,
      };
    },
    removePath(state, action: PayloadAction<number>) {
      state.paths.splice(action.payload, 1);
    },
    reset(state) {
      return initialState;
    },
  },
});

export const { actions } = shpCalcSlice;
export default shpCalcSlice.reducer;
