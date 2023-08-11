import { MaterialFileSerializer } from "api/types/igcTypes";
import { saveFile } from "utils";

import { formatInTimeZone } from "date-fns-tz";
import store from "redux/store";

export const saveIGCMaterial = (_material_id: number) => {
  const igcState = store.getState().igc;

  const todayString = formatInTimeZone(new Date(), "America/Sao_Paulo", "yyyy-MM-dd HH:mm:ssXXX");
  const material = igcState.materials.find((m) => m.id === _material_id);
  if (material) {
    const data: MaterialFileSerializer = {
      fileinfo: {
        type: "igc_material",
        version: "1.0.0",
        created: todayString,
        updated: todayString,
      },
      material: material,
      reductions: igcState.reductions.find((r) => r.material === _material_id),
      diameters: igcState.diameters.filter((d) => d.material === _material_id),
      fittings: igcState.fittings,
      fittingdiameters: igcState.fittingDiameters.find((fd) => fd.material === _material_id),
    };
    const jsonData = JSON.stringify(data);
    saveFile(jsonData, `${data.material.name}.igcmat`, "application/json");
  }
};

