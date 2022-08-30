import { AxiosRequestHeaders } from "axios";

export type PayloadIdType = number;

export type ActionTypes = {
  LIST: string;
  CREATE: string;
  RETRIEVE: string;
  UPDATE: string;
  DESTROY: string;
  RESET: string;
};

export type actionMessages = {
  reset?: string | null;
  list?: string | null;
  create?: string | null;
  retrieve?: string | null;
  update?: string | null;
  destroy?: string | null;
};

export type Config = ActionConfig & {
  paginated?: boolean;
  paginatedArrayName?: string;
  actionMessages?: actionMessages;
};

export type ActionConfig = {
  saveState?: boolean;
  contentHeader?: AxiosRequestHeaders;
  payloadIdName?: string;
  authorizationHeaderContent?: string;
  showLoading?: boolean;
};

export type Message = {
  detail: any | string;
  status: number | null;
};
