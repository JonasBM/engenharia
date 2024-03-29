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
  hazen_williams_coefficient: number | null;
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
  equivalent_length: number | null;
  material: any;
  inlet_diameter: any;
  outlet_diameter: any;
}

export interface MaterialConnectionSerializer {
  id?: number;
  inlet_material?: number | null;
  outlet_material?: number | null;
  name: string;
  equivalent_length: number | null;
  inlet_diameter: any;
  outlet_diameter: any;
}

export interface FixtureSerializer {
  id?: number;
  name: string;
  nozzle_type: "TC" | "RE" | "MA" | "";
  extra_equivalent_length: number | null;
  hose_hazen_williams_coefficient: number | null;
  hose_internal_diameter: number | null;
  k_factor: number;
  k_factor_includes_hose?: boolean;
  k_nozzle?: number;
  outlet_diameter: number;
  minimum_flow_rate: number | null;
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

export const fixtureTypes = [fixtureType.TRONCO_CONICO, fixtureType.REGULAVEL, fixtureType.MANGOTINHO];

export interface FileInfoSerializer {
  type: string;
  version: string;
  created: string;
  updated: string;
}

export interface MaterialFileSerializer {
  fileinfo: FileInfoSerializer;
  material: MaterialSerializer;
  reductions?: ReductionSerializer;
  diameters: DiameterSerializer[];
  fittings: FittingSerializer[];
  fittingdiameters?: FittingDiameterResponseSerializer;
}

export interface SHPCalcFixtureSerializer {
  active?: boolean | null;
  end: string;
  hose_length?: number | null;
  level_difference?: number | null;
  flow?: number | null;
  total_length?: number | null;
  start_pressure?: number | null;
  middle_pressure?: number | null;
  end_pressure?: number | null;
  hose_pressure_drop?: number | null;
  nozzle_pressure_drop?: number | null;
  unit_hose_pressure_drop?: number | null;
  pressure_drop?: number | null;
  unit_pressure_drop?: number | null;
  connection_names?: string[] | null;
}

export interface SHPCalcPathSerializer {
  start: string;
  end: string;
  fixture?: SHPCalcFixtureSerializer | null;
  material_id: number | null;
  diameter_id: number | null;
  length?: number | null;
  level_difference?: number | null;
  fittings_ids?: number[] | null;
  extra_equivalent_length?: number | null;
  equivalent_length?: number | null;
  total_length?: number | null;
  has_fixture?: boolean | null;
  connection_names?: string[] | null;
  flow?: number | null;
  speed?: number | null;
  start_pressure?: number | null;
  end_pressure?: number | null;
  pressure_drop?: number | null;
  unit_pressure_drop?: number | null;
}

export interface SHPCalcPumpSerializer {
  node?: string | null;
  head_lift?: number | null;
  flow?: number | null;
  NPSHd?: number | null;
}

export interface SHPCalcSerializer {
  fileinfo: FileInfoSerializer;
  name: string | null;
  observation: string | null;
  calc_type: string | null;
  pressure_type: string | null;
  pump: SHPCalcPumpSerializer;
  material_id: number | null;
  diameter_id: number | null;
  fixture_id: number | null;
  signatory_id: number | null;
  paths: SHPCalcPathSerializer[];
  error?: string | null;
  less_favorable_path_fixture_index?: number | null;
  calculated_at?: string | null;
}
