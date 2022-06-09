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
  type: "TC" | "RE" | "MA" | "";
  extra_equivalent_length: number;
  hose_hazen_williams_coefficient: number;
  hose_internal_diameter: number;
  k_factor: number;
  outlet_diameter: number;
  minimum_flow_rate: number;
  material?: any;
  inlet_diameter?: any;
  reductions?: any[];
  fittings?: any[];
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
}

export interface MaterialFileSerializer {
  fileinfo: FileInfoSerializer;
  material: MaterialSerializer;
  reductions: ReductionSerializer[];
  diameters: DiameterSerializer[];
  fittings: FittingSerializer[];
  fittingdiameters: FittingDiameterResponseSerializer;
}
