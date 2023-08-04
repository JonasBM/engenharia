import { MaterialFileSerializer, SHPCalcSerializer } from "api/types/shpTypes";
import { getNewFileInfo, setCalc } from "redux/shp";
import { sanitizeFilename, saveFile } from "utils";

import { UseFormSetValue } from "react-hook-form";
import { formatInTimeZone } from "date-fns-tz";
import store from "redux/store";

export const flow_to_l_p_min = (flow?: number | null): number | undefined => {
  if (flow) {
    if (typeof flow === "number") {
      return flow * 60000;
    }
    return flow;
  }
  return undefined;
};

export const saveFileSHPCalc = (data: SHPCalcSerializer) => {
  data["fileinfo"] = getNewFileInfo();

  data = saveSHPCalc(data);
  const jsonData = JSON.stringify(data);
  let fileName = sanitizeFilename(data.name);
  if (!data.name) {
    fileName = "Cálculo de SHP";
  }
  saveFile(jsonData, `${fileName}.shpcalc`, "application/json");
};

export const saveSHPCalc = (data: SHPCalcSerializer) => {
  if (!data.fileinfo) {
    data.fileinfo = getNewFileInfo();
  } else {
    data.fileinfo.updated = formatInTimeZone(new Date(), "America/Sao_Paulo", "yyyy-MM-dd HH:mm:ssXXX");
  }
  store.dispatch(setCalc(data));
  return data;
};

export const saveSHPMaterial = (_material_id: number) => {
  const shpState = store.getState().shp;

  const todayString = formatInTimeZone(new Date(), "America/Sao_Paulo", "yyyy-MM-dd HH:mm:ssXXX");
  const material = shpState.materials.find((m) => m.id === _material_id);
  if (material) {
    const data: MaterialFileSerializer = {
      fileinfo: {
        type: "shp_material",
        version: "1.0.0",
        created: todayString,
        updated: todayString,
      },
      material: material,
      reductions: shpState.reductions.find((r) => r.material === _material_id),
      diameters: shpState.diameters.filter((d) => d.material === _material_id),
      fittings: shpState.fittings,
      fittingdiameters: shpState.fittingDiameters.find((fd) => fd.material === _material_id),
    };
    const jsonData = JSON.stringify(data);
    saveFile(jsonData, `${data.material.name}.shpmat`, "application/json");
  }
};

export const cleanCalc = (data: SHPCalcSerializer, setValue: UseFormSetValue<SHPCalcSerializer>) => {
  setValue("calculated_at", null);
  setValue("less_favorable_path_fixture_index", null);
  for (let i = 0; i < data.paths.length; i++) {
    setValue(`paths.${i}.flow`, null);
    setValue(`paths.${i}.speed`, null);
    setValue(`paths.${i}.total_length`, null);
    setValue(`paths.${i}.pressure_drop`, null);
    setValue(`paths.${i}.unit_pressure_drop`, null);
    setValue(`paths.${i}.end_pressure`, null);
    setValue(`paths.${i}.connection_names`, null);
    if (data.paths[i].fixture) {
      setValue(`paths.${i}.fixture.flow`, null);
      setValue(`paths.${i}.fixture.total_length`, null);
      setValue(`paths.${i}.fixture.pressure_drop`, null);
      setValue(`paths.${i}.fixture.hose_pressure_drop`, null);
      setValue(`paths.${i}.fixture.nozzle_pressure_drop`, null);
      setValue(`paths.${i}.fixture.unit_pressure_drop`, null);
      setValue(`paths.${i}.fixture.unit_hose_pressure_drop`, null);
      setValue(`paths.${i}.fixture.end_pressure`, null);
      setValue(`paths.${i}.fixture.connection_names`, null);
    }
  }
};
