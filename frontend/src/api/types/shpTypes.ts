export interface MaterialSerializer {
  id?: number;
  name: string;
  hazen_williams_coefficient: number;
  one_outlet_connection?: any;
  two_outlet_connection?: any;
  three_outlet_connection?: any;
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
  material: any;
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
  equivalent_length: number | string;
  material: any;
  inlet_diameter: any;
  outlet_diameter: any;
}

export interface MaterialConnectionSerializer {
  id?: number;
  name: string;
  equivalent_length: number | string;
  inlet_material: any;
  outlet_material: any;
}

export interface FixtureSerializer {
  id?: number;
  name: string;
  type: "TC" | "RE" | "MA" | "";
  extra_equivalent_length: number | string;
  hose_hazen_williams_coefficient: number;
  k_factor: number | string;
  outlet_diameter: number | string;
  minimum_flow_rate: number | string;
  material?: any;
  inlet_diameter?: any;
  fittings: any[];
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
