export interface ConfigSerializer {
    id?: number;
    calc_type?: "VM" | "VR";
    pressure_type?: "GR" | "BO";
    material?: 1 | null;
    fixture?: 1 | 2 | null;
}

export interface MaterialSerializer {
    id?: number;
    name: string;
    hazen_williams_coefficient: number;
    one_outlet_connection?: 11 | 10 | 4 | 3 | 12 | 16 | 13 | 9 | 8 | 6 | 7 | 14 | 15 | null;
    two_outlet_connection?: 11 | 10 | 4 | 3 | 12 | 16 | 13 | 9 | 8 | 6 | 7 | 14 | 15 | null;
    three_outlet_connection?: 11 | 10 | 4 | 3 | 12 | 16 | 13 | 9 | 8 | 6 | 7 | 14 | 15 | null;
    default_diameter?: 6 | 5 | 1 | 3 | 4 | null;
}

export interface DiameterSerializer {
    id?: number;
    name: string;
    internal_diameter: number;
    material: 1;
}

export interface FittingSerializer {
    id?: number;
    name: string;
}

export interface FittingDiameterSerializer {
    id?: number;
    material?: number;
    equivalent_length: number;
    fitting: 11 | 10 | 4 | 3 | 12 | 16 | 13 | 9 | 8 | 6 | 7 | 14 | 15;
    diameter: 6 | 5 | 1 | 3 | 4;
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
    inlet_diameter: 6 | 5 | 1 | 3 | 4;
    outlet_diameter: 6 | 5 | 1 | 3 | 4;
}

export interface MaterialConnectionSerializer {
    id?: number;
    name: string;
    equivalent_length: number;
    inlet_material: 1;
    outlet_material: 1;
    inlet_diameter: 6 | 5 | 1 | 3 | 4;
    outlet_diameter: 6 | 5 | 1 | 3 | 4;
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
    material?: 1 | null;
    inlet_diameter?: 6 | 5 | 1 | 3 | 4 | null;
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
    end: string | null;
    fixture?: SHPCalcFixtureSerializer | null;
    material_id: number;
    diameter_id: number;
    length?: number | null;
    level_difference?: number | null;
    head_lift?: number | null;
    fittings_ids?: number[] | null;
    has_fixture?: boolean | null;
    extra_equivalent_length?: number | null;
    equivalent_length?: number | null;
    total_length?: number | null;
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
    name?: string | null;
    observation?: string | null;
    pressure_type: GR | BO;
    calc_type: VM | VR;
    pump: SHPCalcPumpSerializer;
    material_id: number;
    diameter_id: number;
    fixture_id: number;
    signatory_id?: number | null;
    paths: SHPCalcPathSerializer[];
    error?: string | null;
    less_favorable_path_fixture_index?: number | null;
    calculated_at?: string | null;
}

