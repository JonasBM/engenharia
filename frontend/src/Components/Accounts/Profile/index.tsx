import { Container } from "@mui/system";
import { Grid } from "@mui/material";
import PasswordForm from "./PasswordForm";
import React from "react";
import UserProfileForm from "./UserProfileForm";

const Profile = () => {
  return (
    <Container sx={{ marginTop: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <UserProfileForm />
        </Grid>
        <Grid item xs={12} md={6}>
          <PasswordForm />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
