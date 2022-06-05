import React, { Fragment, useEffect } from "react";

import { useAppSelector } from "redux/utils";
import { usePrevious } from "hooks";
import { useSnackbar } from "notistack";

const Alerts = () => {
  const { errors, messages } = useAppSelector((state) => state);
  const prevErrors = usePrevious(errors);
  const prevMessages = usePrevious(messages);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (errors !== prevErrors) {
      switch (errors.status) {
        case 404:
          enqueueSnackbar("Pagina não encontrada!", { variant: "error" });
          break;
        default:
          if (typeof errors.detail === "string") {
            enqueueSnackbar(errors.detail, { variant: "error" });
          } else if (typeof errors.detail === "object") {
            if (errors.status && errors.status >= 400 && errors.status < 500) {
              for (const key in errors.detail) {
                if (key === "detail") {
                  enqueueSnackbar((errors.detail as any)[key], {
                    variant: "error",
                  });
                } else if (key === "non_field_errors") {
                  enqueueSnackbar((errors.detail as any)[key].toString(), {
                    variant: "error",
                  });
                } else {
                  enqueueSnackbar(key + ": " + (errors.detail as any)[key], {
                    variant: "error",
                  });
                }
              }
            }
          }
      }
    }
  }, [errors, prevErrors, enqueueSnackbar]);

  useEffect(() => {
    if (messages !== prevMessages) {
      if (typeof messages.detail === "string") {
        enqueueSnackbar(messages.detail, { variant: "info" });
      } else if (typeof messages.detail === "object") {
        if (messages.detail.CRUDCreate)
          enqueueSnackbar(messages.detail.CRUDCreate, { variant: "success" });
        if (messages.detail.CRUDUpdate)
          enqueueSnackbar(messages.detail.CRUDUpdate, { variant: "success" });
        if (messages.detail.CRUDList)
          enqueueSnackbar(messages.detail.CRUDList, { variant: "success" });
        if (messages.detail.ERROR)
          enqueueSnackbar(messages.detail.ERROR, { variant: "error" });
        if (messages.detail.INFO)
          enqueueSnackbar(messages.detail.INFO, { variant: "info" });
        if (messages.detail.WARNING)
          enqueueSnackbar(messages.detail.INFO, { variant: "warning" });
        if (messages.detail.SUCCESS)
          enqueueSnackbar(messages.detail.SUCCESS, { variant: "success" });
      }
    }
  }, [messages, prevMessages, enqueueSnackbar]);

  return <Fragment />;
};

export default Alerts;
