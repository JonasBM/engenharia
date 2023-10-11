import { CilinderSerializer, GASSerializer, MeterSerializer } from "api/types/igcTypes";

export enum CalculatorTypes {
    CONVERT = "Converter",
    METER = "Medidor",
    CILINDERS = "Cilindros",
}

export enum UnitTypes {
    Kcalmin = "Kcal/min",
    Kcalh = "Kcal/h",
    Kgh = "Kg/h",
    m3h = "m³/h",
}



export const convert = (input: number, gas: GASSerializer, inputUnit: UnitTypes, outputUnit: UnitTypes): number => {
    if (!input) return 0

    const conversionFactors: { [key: string]: number } = {
        [UnitTypes.Kcalmin]: 1,
        [UnitTypes.Kcalh]: 1 / 60,
        [UnitTypes.Kgh]: (gas.pck || 0) / 60,
        [UnitTypes.m3h]: (gas.pci || 0) / 60,
    };

    const result = (input * conversionFactors[inputUnit]) / conversionFactors[outputUnit];
    return result

}

export const findMeter = (flow: number, meters: MeterSerializer[]): MeterSerializer | null => {
    let smallestMeter: MeterSerializer | null = null;
    let smallestMaxFlow = Number.MAX_VALUE;
    for (const meter of meters) {
        if (meter.max_flow && meter.max_flow >= flow && meter.max_flow < smallestMaxFlow) {
            smallestMeter = meter;
            smallestMaxFlow = meter.max_flow;
        }
    }
    return smallestMeter;
}

export const calculateConcurrencyFactor = (powerRating: number, gas: GASSerializer, inputUnit: UnitTypes): number => {
    powerRating = convert(powerRating, gas, inputUnit, UnitTypes.Kcalh)
    if (!powerRating || powerRating < 21000) {
        return 1
    }
    if (powerRating < 576720) {
        return 1 / (1 + 0.001 * Math.pow((powerRating/60) - 349, 0.8712))
    }
    if (powerRating < 1200000) {
        return 1 / (1 + 0.4705 * Math.pow((powerRating/60) - 1055, 0.19931))
    }
    return 0.23
}


export const calculateCilinder = (flow: number, cilinder: CilinderSerializer, concurrencyFactor: number, reductionFactor: number): number | null => {
    if (!cilinder.vaporization_rate) return 0
    const power_rating_adopted = flow * concurrencyFactor
    const result = power_rating_adopted / cilinder.vaporization_rate
    return result * (1 - reductionFactor)
}


