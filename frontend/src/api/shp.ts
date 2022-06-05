import {
  DiameterSerializer,
  FittingDiameterResponseSerializer,
  FittingSerializer,
  FixtureSerializer,
  MaterialConnectionSerializer,
  MaterialSerializer,
  ReductionSerializer,
} from "./types/shpTypes";

import { CRUDAction } from "redux-simplified";

export const MaterialCRUDAction = new CRUDAction<MaterialSerializer>(
  "shp/materials",
  new URL("/shp/materials/", process.env.REACT_APP_API_URL).href
);

export const DiameterCRUDAction = new CRUDAction<DiameterSerializer>(
  "shp/diameters",
  new URL("/shp/diameters/", process.env.REACT_APP_API_URL).href
);

export const FittingCRUDAction = new CRUDAction<FittingSerializer>(
  "shp/fittings",
  new URL("/shp/fittings/", process.env.REACT_APP_API_URL).href
);

export const FittingDiameterCRUDAction =
  new CRUDAction<FittingDiameterResponseSerializer>(
    "shp/fittingdiameter",
    new URL("/shp/fittingdiameter/", process.env.REACT_APP_API_URL).href,
    {
      payloadIdName: "material",
      actionMessages: { create: "Conexões salvas com sucesso!" },
    }
  );

export const ReductionCRUDAction = new CRUDAction<ReductionSerializer>(
  "shp/reductions",
  new URL("/shp/reductions/", process.env.REACT_APP_API_URL).href
);

export const MaterialConnectionCRUDAction =
  new CRUDAction<MaterialConnectionSerializer>(
    "shp/materialconnections",
    new URL("/shp/materialconnections/", process.env.REACT_APP_API_URL).href
  );

export const FixtureCRUDAction = new CRUDAction<FixtureSerializer>(
  "shp/fixtures",
  new URL("/shp/fixtures/", process.env.REACT_APP_API_URL).href
);
