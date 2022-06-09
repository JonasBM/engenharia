import { OptionsObject, SnackbarMessage, useSnackbar } from "notistack";
import React, { Fragment, useCallback, useEffect } from "react";

import { useAppSelector } from "redux/utils";
import { usePrevious } from "hooks";

const Alerts = () => {
  const { errors, messages } = useAppSelector((state) => state);
  const prevErrors = usePrevious(errors);
  const prevMessages = usePrevious(messages);
  const { enqueueSnackbar } = useSnackbar();

  const cutEnqueueSnackbar = useCallback(
    (message: SnackbarMessage, options: OptionsObject) => {
      if (typeof message === "string") {
        enqueueSnackbar(message.substring(0, 200), options);
      } else {
        enqueueSnackbar(message, options);
      }
    },
    [enqueueSnackbar]
  );

  useEffect(() => {
    if (errors !== prevErrors) {
      switch (errors.status) {
        case 404:
          cutEnqueueSnackbar("Pagina não encontrada!", { variant: "error" });
          break;
        default:
          if (typeof errors.detail === "string") {
            cutEnqueueSnackbar(errors.detail, { variant: "error" });
          } else if (typeof errors.detail === "object") {
            if (errors.status && errors.status >= 400 && errors.status < 500) {
              for (const key in errors.detail) {
                if (key === "detail") {
                  cutEnqueueSnackbar((errors.detail as any)[key], {
                    variant: "error",
                  });
                } else if (key === "non_field_errors") {
                  cutEnqueueSnackbar((errors.detail as any)[key].toString(), {
                    variant: "error",
                  });
                } else {
                  cutEnqueueSnackbar(key + ": " + (errors.detail as any)[key], {
                    variant: "error",
                  });
                }
              }
            }
          }
      }
    }
  }, [errors, prevErrors, cutEnqueueSnackbar]);

  useEffect(() => {
    if (messages !== prevMessages) {
      if (typeof messages.detail === "string") {
        cutEnqueueSnackbar(messages.detail, { variant: "info" });
      } else if (typeof messages.detail === "object") {
        if (messages.detail.CRUDCreate)
          cutEnqueueSnackbar(messages.detail.CRUDCreate, {
            variant: "success",
          });
        if (messages.detail.CRUDUpdate)
          cutEnqueueSnackbar(messages.detail.CRUDUpdate, {
            variant: "success",
          });
        if (messages.detail.CRUDList)
          cutEnqueueSnackbar(messages.detail.CRUDList, { variant: "success" });
        if (messages.detail.ERROR)
          cutEnqueueSnackbar(messages.detail.ERROR, { variant: "error" });
        if (messages.detail.INFO)
          cutEnqueueSnackbar(messages.detail.INFO, { variant: "info" });
        if (messages.detail.WARNING)
          cutEnqueueSnackbar(messages.detail.INFO, { variant: "warning" });
        if (messages.detail.SUCCESS)
          cutEnqueueSnackbar(messages.detail.SUCCESS, { variant: "success" });
      }
    }
  }, [messages, prevMessages, cutEnqueueSnackbar]);

  return <Fragment />;
};

export default Alerts;
