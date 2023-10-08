import { Collapse, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import React, { useEffect } from "react";
import { blue, green, indigo, lightBlue, orange, red } from "@mui/material/colors";

import Alerts from "./Components/Alerts/Alerts";
import AppRoutes from "./AppRoutes";
import { Container } from "@mui/system";
import Header from "./Components/Main/Header";
import { LoadingIndicator } from "redux-simplified";
import SnackbarCloseButton from "./Components/Alerts/SnackbarCloseButton";
import { SnackbarProvider } from "notistack";
import { documentTitles } from "myConstants";
import { ptBR as muiPtBR } from "@mui/material/locale";
import { useAppSelector } from "redux/utils";
import { ptBR as yupPtBR } from "./yupLocale";
import { setLocale as yupSetLocale } from "yup";

import {
  SHPCalcDialogForm,
  SHPDiameterDialogForm,
  SHPFittingDialogForm,
  SHPFixtureDialogForm,
  SHPMaterialConnectionDialogForm,
  SHPMaterialDialogForm,
  SHPReductionDialogForm,
} from "./Components/SHP/DialogForm";

import {
  IGCPrimaryCalcDialogForm,
  IGCSecondaryCalcDialogForm,
  IGCDiameterDialogForm,
  IGCFittingDialogForm,
  IGCGASDialogForm,
  IGCMaterialConnectionDialogForm,
  IGCMaterialDialogForm,
  IGCReductionDialogForm,
} from "./Components/IGC/DialogForm";
import SignatoryDialogForm from "Components/Main/Admin/DialogForm/SignatoryDialogForm";

yupSetLocale(yupPtBR);

// const theme = createTheme({}, muiPtBR);

const theme = createTheme(
  {
    palette: {
      primary: blue,
      secondary: indigo,
      error: red,
      warning: orange,
      info: lightBlue,
      success: green,
    },
    components: {
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          margin: "dense",
          size: "small",
          fullWidth: true,
        },
      },
      MuiButton: {
        defaultProps: {
          variant: "contained",
          size: "small",
        },
      },
    },
  },
  muiPtBR
);

function App() {
  const fetching = useAppSelector((state) => state.fetching);
  useEffect(() => {
    document.title = documentTitles.PORTAL;
  }, []);

  return (
    <SnackbarProvider
      maxSnack={5}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      TransitionComponent={Collapse}
      action={(key) => <SnackbarCloseButton id={key} />}
    >
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Header />
        <Alerts />

        <SignatoryDialogForm />

        <SHPCalcDialogForm />
        <SHPDiameterDialogForm />
        <SHPFittingDialogForm />
        <SHPFixtureDialogForm />
        <SHPMaterialConnectionDialogForm />
        <SHPMaterialDialogForm />
        <SHPReductionDialogForm />

        <IGCPrimaryCalcDialogForm />
        <IGCSecondaryCalcDialogForm />
        <IGCDiameterDialogForm />
        <IGCFittingDialogForm />
        <IGCGASDialogForm />
        <IGCMaterialConnectionDialogForm />
        <IGCMaterialDialogForm />
        <IGCReductionDialogForm />

        <LoadingIndicator fetching={fetching} />
        <Container maxWidth={false} sx={{ marginTop: 3, marginBottom: 5 }}>
          <AppRoutes />
        </Container>
      </ThemeProvider>
    </SnackbarProvider>
  );
}

export default App;
