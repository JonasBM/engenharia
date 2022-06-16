export interface ConfigSerializer {
    id?: number;
    calc_type?: "VM" | "VR";
    pressure_type?: "GR" | "BO";
    material?: 3 | 5 | null;
    fixture?: 5 | 4 | 3 | null;
}

export interface MaterialSerializer {
    id?: number;
    name: string;
    hazen_williams_coefficient: number;
    one_outlet_connection?: 3 | 83 | 1 | 84 | null;
    two_outlet_connection?: 3 | 83 | 1 | 84 | null;
    three_outlet_connection?: 3 | 83 | 1 | 84 | null;
    default_diameter?: 105 | 1 | 2 | 106 | 7 | 103 | null;
}

export interface DiameterSerializer {
    id?: number;
    name: string;
    internal_diameter: number;
    material: 3 | 5;
}

export interface FittingSerializer {
    id?: number;
    name: string;
}

export interface FittingDiameterSerializer {
    id?: number;
    material?: number;
    equivalent_length: number;
    fitting: 3 | 83 | 1 | 84;
    diameter: 105 | 1 | 2 | 106 | 7 | 103;
}

export interface FittingDiameterResponseSerializer {
    material: number;
    fitting_diameter_array: FittingDiameterSerializer[];
}

export interface ReductionSerializer {
    id?: number;
    material?: number;
    name: string;
    equivalent_length: number;
    inlet_diameter: 105 | 1 | 2 | 106 | 7 | 103;
    outlet_diameter: 105 | 1 | 2 | 106 | 7 | 103;
}

export interface MaterialConnectionSerializer {
    id?: number;
    name: string;
    equivalent_length: number;
    inlet_material: 3 | 5;
    outlet_material: 3 | 5;
    inlet_diameter: 105 | 1 | 2 | 106 | 7 | 103;
    outlet_diameter: 105 | 1 | 2 | 106 | 7 | 103;
}

export interface FixtureSerializer {
    id?: number;
    name: string;
    nozzle_type: "TC" | "RE" | "MA";
    reductions_ids?: any;
    fittings_ids?: any;
    extra_equivalent_length?: number | null;
    hose_hazen_williams_coefficient: number;
    hose_internal_diameter: number;
    k_factor?: number;
    k_factor_includes_hose?: boolean;
    k_nozzle?: number;
    outlet_diameter: number;
    minimum_flow_rate: number;
    material?: 3 | 5 | null;
    inlet_diameter?: 105 | 1 | 2 | 106 | 7 | 103 | null;
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
    reductions: ReductionSerializer[];
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
    end: string | null;
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

export interface SHPCalcSerializer {
    fileinfo: FileInfoSerializer;
    name?: string | null;
    pressure_type: GR | BO;
    calc_type: VM | VR;
    pump_node?: string;
    material_id: number;
    diameter_id: number;
    fixture_id: number;
    paths: SHPCalcPathSerializer[];
    error?: string | null;
    less_favorable_path_fixture_index?: number | null;
}

