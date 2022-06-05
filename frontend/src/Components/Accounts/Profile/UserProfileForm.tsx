import * as yup from "yup";

import { Button, Paper, TextField, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "redux/utils";

import React from "react";
import { UserProfileCRUDAction } from "api/accounts";
import { UserProfileSerializer } from "api/types/accountsTypes";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const validationSchema = () =>
  yup
    .object({
      first_name: yup.string().required(),
      last_name: yup.string(),
      email: yup.string().email(),
    })
    .required();

const UserProfileForm = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserProfileSerializer>({
    resolver: yupResolver(validationSchema()),
    defaultValues: auth.user ? auth.user : {},
  });

  const onSubmit = (data: UserProfileSerializer) => {
    dispatch(UserProfileCRUDAction.partialUpdate(data)).then((res) => {
      dispatch({ type: "auth/my-profile/fulfilled", payload: res });
    });
  };

  return (
    <Paper
      sx={{ padding: 3 }}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Typography variant="h6">Dados do Perfil:</Typography>
      <TextField
        label="Nome"
        error={errors.first_name ? true : false}
        helperText={errors.first_name?.message}
        {...register("first_name")}
      />
      <TextField
        label="Sobrenome"
        error={errors.last_name ? true : false}
        helperText={errors.last_name?.message}
        {...register("last_name")}
      />
      <TextField
        label="Email"
        error={errors.email ? true : false}
        helperText={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
        Salvar
      </Button>
    </Paper>
  );
};

export default UserProfileForm;
