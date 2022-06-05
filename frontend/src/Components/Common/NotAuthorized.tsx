import { Grid } from "@mui/material";
import { Link } from "react-router-dom";
import React from "react";

const NotAuthorized = () => {
  return (
    <Grid container spacing={0} direction="column" alignItems="center">
      <h1>403 - Sem autorização para acessar esta pagina!</h1>
      <Link to="/">Ir para a pagina inicial</Link>
      <Link to="/logout">Logar com outra conta</Link>
    </Grid>
  );
};

export default NotAuthorized;
