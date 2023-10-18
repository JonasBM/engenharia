export const CalcType = {
  PRIMARY: { value: "PR", name: "Primária" },
  SECONDARY: { value: "SC", name: "Secundária" },
};

export const CalcTypes = [CalcType.PRIMARY, CalcType.SECONDARY];

export interface ConfigSerializer {
  id: 1;
  material: any;
  gas: any;
}

export interface MaterialSerializer {
  id?: number;
  name: string;
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

export interface GASSerializer {
  id?: number;
  name: string;
  description?: string | null;
  pci: number | null;
  pck: number | null;
  relative_density: number | null;
}

export interface CilinderSerializer {
  id?: number;
  name: string;
  vaporization_rate: number | null;
}

export interface MeterSerializer {
  id?: number;
  name: string;
  max_flow: number | null;
  gas: number | null;
}

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

export interface IGCCalcPathSerializer {
  start: string;
  end: string;
  material_id: number| null;
  diameter_id: number| null;
  power_rating_added?: number | null;
  power_rating_accumulated?: number | null;
  power_rating_adopted?: number | null;
  concurrency_factor?: number | null;
  length?: number | null;
  length_up?: number | null;
  length_down?: number | null;
  fittings_ids?: number[] | null;
  extra_equivalent_length?: number | null;
  equivalent_length?: number | null;
  total_length?: number | null;
  connection_names?: string[] | null;
  flow?: number | null;
  speed?: number | null;
  start_pressure?: number | null;
  end_pressure?: number | null;
  pressure_drop?: number | null;
  pressure_drop_color?: string | null;
  pressure_drop_accumulated?: number | null;
  pressure_drop_accumulated_color?: string | null;
  fail?: boolean | null;
  fail_level?: number | null;
}

export interface IGCCalcSerializer {
  fileinfo: FileInfoSerializer;
  name: string | null;
  observation: string | null;
  calc_type: string | null;
  material_id: number | null;
  diameter_id: number | null;
  gas_id: number | null;
  start_pressure: number | null;
  signatory_id: number | null;
  paths: IGCCalcPathSerializer[];
  error?: string | null;
  calculated_at?: string | null;
  max_fail_level?: number | null;
}
