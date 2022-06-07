export interface MaterialSerializer {
    id?: number;
    name: string;
    hazen_williams_coefficient: number;
    one_outlet_connection?: 3 | 4 | 1 | 2 | 74 | 75 | 76 | 77 | 5 | null;
    two_outlet_connection?: 3 | 4 | 1 | 2 | 74 | 75 | 76 | 77 | 5 | null;
    three_outlet_connection?: 3 | 4 | 1 | 2 | 74 | 75 | 76 | 77 | 5 | null;
}

export interface DiameterSerializer {
    id?: number;
    name: string;
    internal_diameter: number;
    material: 3 | 33 | 5;
}

export interface FittingSerializer {
    id?: number;
    name: string;
    material: 3 | 33 | 5;
}

export interface FittingDiameterSerializer {
    id?: number;
    material?: number;
    equivalent_length: number;
    fitting: 3 | 4 | 1 | 2 | 74 | 75 | 76 | 77 | 5;
    diameter: 1 | 2 | 4 | 5 | 6 | 98 | 99 | 100 | 101 | 102 | 7;
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
    inlet_diameter: 1 | 2 | 4 | 5 | 6 | 98 | 99 | 100 | 101 | 102 | 7;
    outlet_diameter: 1 | 2 | 4 | 5 | 6 | 98 | 99 | 100 | 101 | 102 | 7;
}

export interface MaterialConnectionSerializer {
    id?: number;
    name: string;
    equivalent_length: number;
    inlet_material: 3 | 33 | 5;
    outlet_material: 3 | 33 | 5;
    inlet_diameter: 1 | 2 | 4 | 5 | 6 | 98 | 99 | 100 | 101 | 102 | 7;
    outlet_diameter: 1 | 2 | 4 | 5 | 6 | 98 | 99 | 100 | 101 | 102 | 7;
}

export interface FixtureSerializer {
    id?: number;
    name: string;
    type: "TC" | "RE" | "MA";
    extra_equivalent_length?: number | null;
    hose_hazen_williams_coefficient: number;
    k_factor?: number | null;
    outlet_diameter: number;
    minimum_flow_rate: number;
    material?: 3 | 33 | 5 | null;
    inlet_diameter?: 1 | 2 | 4 | 5 | 6 | 98 | 99 | 100 | 101 | 102 | 7 | null;
    fittings?: 3 | 4 | 1 | 2 | 74 | 75 | 76 | 77 | 5[];
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

