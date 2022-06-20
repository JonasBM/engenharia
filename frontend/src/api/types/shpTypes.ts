export const CalcType = {
  VAZAO_MINIMA: { value: "VM", name: "Vazão mínima" },
  VAZAO_RESIDUAL: { value: "VR", name: "Vazão Residual" },
};

export const CalcTypes = [CalcType.VAZAO_MINIMA, CalcType.VAZAO_RESIDUAL];

export const PressureType = {
  GRAVITACIONAL: { value: "GR", name: "Gravitacional" },
  BOMBA: { value: "BO", name: "Bomba" },
};

export const PressureTypes = [PressureType.GRAVITACIONAL, PressureType.BOMBA];
export interface ConfigSerializer {
  id: 1;
  calc_type: "VM" | "VR";
  pressure_type: "GR" | "BO";
  material: any;
  fixture: any;
}
export interface MaterialSerializer {
  id?: number;
  name: string;
  hazen_williams_coefficient: number;
  one_outlet_connection?: any;
  two_outlet_connection?: any;
  three_outlet_connection?: any;
  default_diameter?: any;
}

export interface DiameterSerializer {
  id?: number;
  name: string;
  internal_diameter: any;
  material: any;
}

export interface FittingSerializer {
  id?: number;
  name: string;
}

export interface FittingDiameterSerializer {
  id?: number;
  equivalent_length: number | string;
  material: any;
  fitting: any;
  diameter: any;
}

export interface FittingDiameterResponseSerializer {
  material: number;
  fitting_diameter_array: FittingDiameterSerializer[];
}

export interface ReductionSerializer {
  id?: number;
  name: string;
  equivalent_length: number;
  material: any;
  inlet_diameter: any;
  outlet_diameter: any;
}

export interface MaterialConnectionSerializer {
  id?: number;
  inlet_material?: number;
  outlet_material?: number;
  name: string;
  equivalent_length: number;
  inlet_diameter: any;
  outlet_diameter: any;
}

export interface FixtureSerializer {
  id?: number;
  name: string;
  nozzle_type: "TC" | "RE" | "MA" | "";
  extra_equivalent_length: number;
  hose_hazen_williams_coefficient: number;
  hose_internal_diameter: number;
  k_factor: number;
  k_factor_includes_hose?: boolean;
  k_nozzle?: number;
  outlet_diameter: number;
  minimum_flow_rate: number;
  material?: any;
  inlet_diameter?: any;
  reductions_ids?: number[];
  fittings_ids?: number[];
  fittings_equivalent_length?: number;
  reductions_equivalent_length?: number;
}

export const fixtureType = {
  TRONCO_CONICO: { value: "TC", name: "Tronco-cônico" },
  REGULAVEL: { value: "RE", name: "Regulável" },
  MANGOTINHO: { value: "MA", name: "Mangotinho" },
};

export const fixtureTypes = [
  fixtureType.TRONCO_CONICO,
  fixtureType.REGULAVEL,
  fixtureType.MANGOTINHO,
];

export interface FileInfoSerializer {
  type: string;
  version: string;
  created: string;
  updated: string;
}

export interface MaterialFileSerializer {
  fileinfo: FileInfoSerializer;
  material: MaterialSerializer;
  reductions: ReductionSerializer;
  diameters: DiameterSerializer[];
  fittings: FittingSerializer[];
  fittingdiameters: FittingDiameterResponseSerializer;
}

export interface SHPCalcFixtureSerializer {
  active?: boolean;
  end: string;
  hose_length?: number;
  level_difference?: number;
  flow?: number;
  total_length?: number;
  start_pressure?: number;
  middle_pressure?: number;
  end_pressure?: number;
  hose_pressure_drop?: number;
  unit_hose_pressure_drop?: number;
  pressure_drop?: number;
  unit_pressure_drop?: number;
  connection_names?: string[];
}

export interface SHPCalcPathSerializer {
  start: string;
  end: string;
  fixture?: SHPCalcFixtureSerializer;
  material_id: number;
  diameter_id: number;
  length?: number;
  level_difference?: number;
  fittings_ids?: number[];
  extra_equivalent_length?: number;
  equivalent_length?: number;
  total_length?: number;
  has_fixture?: boolean;
  connection_names?: string[];
  flow?: number;
  speed?: number;
  start_pressure?: number;
  end_pressure?: number;
  pressure_drop?: number;
  unit_pressure_drop?: number;
}

export interface SHPCalcPumpSerializer {
  node?: string | null;
  head_height?: number | null;
  flow?: number | null;
  NPSHd?: number | null;
}

export interface SHPCalcSerializer {
  fileinfo: FileInfoSerializer;
  name: string;
  calc_type: string;
  pressure_type: string;
  pump: SHPCalcPumpSerializer;
  material_id: number;
  diameter_id: number;
  fixture_id: number;
  paths: SHPCalcPathSerializer[];
  error?: string | null;
  less_favorable_path_fixture_index?: number | null;
  calculated_at?: string | null;
}
