export interface ConfigSerializer {
    id?: number;
    material?: any | null;
    gas?: any | null;
}

export interface MaterialSerializer {
    id?: number;
    name: string;
    one_outlet_connection?: any | null;
    two_outlet_connection?: any | null;
    three_outlet_connection?: any | null;
    default_diameter?: any | null;
}

export interface DiameterSerializer {
    id?: number;
    name: string;
    internal_diameter: number;
    material: any;
}

export interface FittingSerializer {
    id?: number;
    name: string;
}

export interface FittingDiameterSerializer {
    id?: number;
    material?: number;
    equivalent_length: number;
    fitting: any;
    diameter: any;
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
    inlet_diameter: any;
    outlet_diameter: any;
}

export interface MaterialConnectionSerializer {
    id?: number;
    name: string;
    equivalent_length: number;
    inlet_material: any;
    outlet_material: any;
    inlet_diameter: any;
    outlet_diameter: any;
}

export interface GASSerializer {
    id?: number;
    name: string;
    description: string;
    pci: number;
    relative_density: number;
    start_pressure: number;
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
    pressure_drop_accumulated?: number | null;
}

export interface IGCCalcSerializer {
    fileinfo: FileInfoSerializer;
    name?: string | null;
    material_id: number;
    diameter_id: number;
    gas_id: number;
    paths: IGCCalcPathSerializer[];
    error?: string | null;
    calculated_at?: string | null;
}

