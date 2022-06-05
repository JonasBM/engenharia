import * as yup from "yup";

import {
  Button,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { PasswordSerializer } from "api/types/accountsTypes";
import { setPassword } from "api/accounts";
import { useAppDispatch } from "redux/utils";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const validationSchema = () =>
  yup
    .object({
      old_password: yup.string().required(),
      new_password: yup.string().required(),
    })
    .required();

const PasswordForm = () => {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordSerializer>({
    resolver: yupResolver(validationSchema()),
  });

  const [showPassword, setShowPassword] = useState({
    old_password: false,
    new_password: false,
  });

  const handleShowPassword = (field: "old_password" | "new_password") => {
    if (field === "old_password") {
      setShowPassword((value) => {
        return {
          ...value,
          old_password: !value.old_password,
        };
      });
    }
    if (field === "new_password") {
      setShowPassword((value) => {
        return {
          ...value,
          new_password: !value.new_password,
        };
      });
    }
  };

  const onSubmit = (data: PasswordSerializer) => {
    dispatch(setPassword(data)).then(() => {
      reset();
    });
  };

  return (
    <Paper
      sx={{ padding: 3 }}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Typography variant="h6">Alterar Senha:</Typography>
      <TextField
        label="Senha atual"
        type={showPassword.old_password ? "text" : "password"}
        InputProps={{
          endAdornment: (
            <IconButton
              onClick={() => {
                handleShowPassword("old_password");
              }}
            >
              {showPassword.old_password ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          ),
        }}
        error={errors.old_password ? true : false}
        helperText={errors.old_password?.message}
        {...register("old_password")}
      />
      <TextField
        label="Nova senha"
        type={showPassword.new_password ? "text" : "password"}
        InputProps={{
          endAdornment: (
            <IconButton
              onClick={() => {
                handleShowPassword("new_password");
              }}
            >
              {showPassword.new_password ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          ),
        }}
        error={errors.new_password ? true : false}
        helperText={errors.new_password?.message}
        {...register("new_password")}
      />
      <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
        Alterar
      </Button>
    </Paper>
  );
};

export default PasswordForm;
