export interface ConfigSerializer {
    id?: number;
    material?: 4 | 3 | 6 | 5 | null;
    gas?: 1 | 2 | null;
}

export interface MaterialSerializer {
    id?: number;
    name: string;
    one_outlet_connection?: 3 | 4 | null;
    two_outlet_connection?: 3 | 4 | null;
    three_outlet_connection?: 3 | 4 | null;
    default_diameter?: 13 | 14 | 15 | 16 | 17 | 7 | 8 | 9 | 10 | 11 | 12 | 22 | 23 | 24 | 25 | 18 | 19 | 20 | 21 | null;
}

export interface DiameterSerializer {
    id?: number;
    name: string;
    internal_diameter: number;
    material: 4 | 3 | 6 | 5;
}

export interface FittingSerializer {
    id?: number;
    name: string;
}

export interface FittingDiameterSerializer {
    id?: number;
    material?: number;
    equivalent_length: number;
    fitting: 3 | 4;
    diameter: 13 | 14 | 15 | 16 | 17 | 7 | 8 | 9 | 10 | 11 | 12 | 22 | 23 | 24 | 25 | 18 | 19 | 20 | 21;
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
    inlet_diameter: 13 | 14 | 15 | 16 | 17 | 7 | 8 | 9 | 10 | 11 | 12 | 22 | 23 | 24 | 25 | 18 | 19 | 20 | 21;
    outlet_diameter: 13 | 14 | 15 | 16 | 17 | 7 | 8 | 9 | 10 | 11 | 12 | 22 | 23 | 24 | 25 | 18 | 19 | 20 | 21;
}

export interface MaterialConnectionSerializer {
    id?: number;
    name: string;
    equivalent_length: number;
    inlet_material: 4 | 3 | 6 | 5;
    outlet_material: 4 | 3 | 6 | 5;
    inlet_diameter: 13 | 14 | 15 | 16 | 17 | 7 | 8 | 9 | 10 | 11 | 12 | 22 | 23 | 24 | 25 | 18 | 19 | 20 | 21;
    outlet_diameter: 13 | 14 | 15 | 16 | 17 | 7 | 8 | 9 | 10 | 11 | 12 | 22 | 23 | 24 | 25 | 18 | 19 | 20 | 21;
}

export interface GASSerializer {
    id?: number;
    name: string;
    description?: string | null;
    pci: number;
    relative_density: number;
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

export interface IGCCalcPathSerializer {
    start: string;
    end: string | null;
    material_id: number;
    diameter_id: number;
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
    name?: string | null;
    observation?: string | null;
    calc_type: PR | SC;
    material_id: number;
    diameter_id: number;
    gas_id: number;
    signatory_id?: number | null;
    start_pressure: number;
    paths: IGCCalcPathSerializer[];
    error?: string | null;
    calculated_at?: string | null;
    max_fail_level?: number | null;
}

