export interface MaterialSerializer {
    id?: number;
    name: string;
    hazen_williams_coefficient: number;
    one_outlet_connection?: 3 | 4 | 1 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 2 | 78 | 79 | 80 | null;
    two_outlet_connection?: 3 | 4 | 1 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 2 | 78 | 79 | 80 | null;
    three_outlet_connection?: 3 | 4 | 1 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 2 | 78 | 79 | 80 | null;
    default_diameter?: 1 | 2 | 4 | 5 | 6 | 7 | 103 | null;
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
    fitting: 3 | 4 | 1 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 2 | 78 | 79 | 80;
    diameter: 1 | 2 | 4 | 5 | 6 | 7 | 103;
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
    inlet_diameter: 1 | 2 | 4 | 5 | 6 | 7 | 103;
    outlet_diameter: 1 | 2 | 4 | 5 | 6 | 7 | 103;
}

export interface MaterialConnectionSerializer {
    id?: number;
    inlet_material?: number;
    outlet_material?: number;
    name: string;
    equivalent_length: number;
    inlet_diameter: 1 | 2 | 4 | 5 | 6 | 7 | 103;
    outlet_diameter: 1 | 2 | 4 | 5 | 6 | 7 | 103;
}

export interface FixtureSerializer {
    id?: number;
    name: string;
    type: "TC" | "RE" | "MA";
    extra_equivalent_length?: number | null;
    hose_hazen_williams_coefficient: number;
    hose_internal_diameter: number;
    k_factor?: number | null;
    outlet_diameter: number;
    minimum_flow_rate: number;
    material?: 3 | 5 | null;
    inlet_diameter?: 1 | 2 | 4 | 5 | 6 | 7 | 103 | null;
    reductions?: 1 | 6 | 14 | 16 | 15 | 18 | 19 | 17[];
    fittings?: 3 | 4 | 1 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 2 | 78 | 79 | 80[];
}

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

