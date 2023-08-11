import { IGCCalcSerializer } from "api/types/igcTypes";
import { getNewFileInfo, setCalc } from "redux/igcPrimary";
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

export const saveFileIGCCalc = (data: IGCCalcSerializer) => {
  data["fileinfo"] = getNewFileInfo();

  data = saveIGCCalc(data);
  const jsonData = JSON.stringify(data);
  let fileName = sanitizeFilename(data.name);
  if (!data.name) {
    fileName = "Cálculo de IGC primária";
  }
  saveFile(jsonData, `${fileName}.igcprcalc`, "application/json");
};

export const saveIGCCalc = (data: IGCCalcSerializer) => {
  if (!data.fileinfo) {
    data.fileinfo = getNewFileInfo();
  } else {
    data.fileinfo.updated = formatInTimeZone(new Date(), "America/Sao_Paulo", "yyyy-MM-dd HH:mm:ssXXX");
  }
  store.dispatch(setCalc(data));
  return data;
};

export const cleanCalc = (data: IGCCalcSerializer, setValue: UseFormSetValue<IGCCalcSerializer>) => {
  setValue("calculated_at", null);
  setValue("max_fail_level", null);
  for (let i = 0; i < data.paths.length; i++) {
    setValue(`paths.${i}.power_rating_accumulated`, null);
    setValue(`paths.${i}.power_rating_adopted`, null);
    setValue(`paths.${i}.concurrency_factor`, null);
    setValue(`paths.${i}.flow`, null);
    setValue(`paths.${i}.speed`, null);
    setValue(`paths.${i}.total_length`, null);
    setValue(`paths.${i}.start_pressure`, null);
    setValue(`paths.${i}.end_pressure`, null);
    setValue(`paths.${i}.pressure_drop`, null);
    setValue(`paths.${i}.pressure_drop_color`, null);
    setValue(`paths.${i}.pressure_drop_accumulated`, null);
    setValue(`paths.${i}.pressure_drop_accumulated_color`, null);
    setValue(`paths.${i}.fail`, null);
    setValue(`paths.${i}.fail_level`, null);
    setValue(`paths.${i}.connection_names`, null);
  }
};
