import React, { useEffect } from "react";

import { documentTitles } from "myConstants";
import { Box, Paper, Typography } from "@mui/material";

const Home = () => {
  useEffect(() => {
    document.title = documentTitles.PORTAL;
    return () => {
      document.title = documentTitles.PORTAL;
    };
  }, []);

  return (
    <Box
      sx={{
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Paper sx={{ padding: 5 }}>
        <Typography component="h1" variant="h6">
          Bem vindo ao portal de cálculo da Trichês Engenharia.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Home;
