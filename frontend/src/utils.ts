import { SHPCalcState, setCalc } from "redux/shp";

import { MaterialFileSerializer } from "api/types/shpTypes";
import { UserProfileSerializer } from "./api/types/accountsTypes";
import store from "redux/store";

export const DecimalFormatter = (
  value: string | number,
  decimals: number = 2
) => {
  const clean = value
    .toString()
    .replace(/[^\d,]/g, "")
    .replace(/(,.*?),(.*,)?/, "$1");
  console.log(clean);
  // const valueWithComma = value.toString().replace(".", ",");
  // const commaIndex = clean.indexOf(",");
  // console.log(teste[0]);
  // console.log(teste[1]);
  // valueWithComma.replace(/[^\d]/g, ""),
  return clean;
};

export const getUserInitials = (
  user?: UserProfileSerializer | null
): string => {
  if (user) {
    if (user.first_name) {
      return `${user.first_name.charAt(0)}${user.last_name?.charAt(
        0
      )}`.toUpperCase();
    } else {
      return user.username.charAt(0).toUpperCase();
    }
  }
  return "";
};

export const getUserFullName = (
  user?: UserProfileSerializer | null
): string => {
  if (user) {
    if (user.first_name) {
      return `${user.first_name} ${user.last_name}`;
    } else {
      return user.username;
    }
  }
  return "";
};

export const addServerErrors = <T>(
  errors: { [P in keyof T]?: string[] },
  setError: (
    fieldName: keyof T,
    error: { type: string; message: string }
  ) => void
) => {
  return Object.keys(errors).forEach((key) => {
    setError(key as keyof T, {
      type: "server",
      message: errors[key as keyof T]!.join(". "),
    });
  });
};

export const saveFile = (
  content: string,
  fileName: string,
  contentType: string
) => {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

export const sanitizeFilename = (filename: string) => {
  return filename.replace(/[/\\?%*:|"<>#$!`&@{}='+=]/g, "");
};

export const saveSHPMaterial = (_material_id: number) => {
  const shpState = store.getState().shp;
  const data: MaterialFileSerializer = {
    fileinfo: {
      type: "material_backup",
      version: "1.0.0",
    },
    material: shpState.materials.find((m) => m.id === _material_id),
    reductions: shpState.reductions.filter((r) => r.material === _material_id),
    diameters: shpState.diameters.filter((d) => d.material === _material_id),
    fittings: shpState.fittings.filter((f) => f.material === _material_id),
    fittingdiameters: shpState.fittingDiameters.find(
      (fd) => fd.material === _material_id
    ),
  };
  const jsonData = JSON.stringify(data);
  saveFile(jsonData, `${data.material.name}.shpmat`, "application/json");
};

export const saveSHPCalc = (data: SHPCalcState) => {
  data["fileinfo"] = {
    type: "shp_calc",
    version: "1.0.0",
  };
  store.dispatch(setCalc(data));
  const jsonData = JSON.stringify(data);
  let fileName = sanitizeFilename(data.name);
  if (!data.name) {
    fileName = "Cálculo de SHP";
  }
  saveFile(jsonData, `${fileName}.shpcalc`, "application/json");
};
