import { Grid } from "@mui/material";
import { Link } from "react-router-dom";
import React from "react";

const NotFound = () => {
  return (
    <Grid container spacing={0} direction="column" alignItems="center">
      <h1>404 - Pagina não encontrada!</h1>
      <Link to="/">Ir para a pagina inicial</Link>
    </Grid>
  );
};

export default NotFound;
