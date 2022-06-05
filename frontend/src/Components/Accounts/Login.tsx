import * as yup from "yup";

import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

import { authLogin } from "api/auth";
import { useAppDispatch } from "redux/utils";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

export type LoginType = {
  username: string;
  password: string;
};

const validationSchema = () =>
  yup
    .object({
      username: yup.string().required(),
      password: yup.string().required(),
    })
    .required();

const Login = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [showPassword, setShowshowPassword] = useState(false);

  const handleShowPassword = () => {
    setShowshowPassword((value) => !value);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginType>({
    resolver: yupResolver(validationSchema()),
  });

  const onSubmit = (data: LoginType) => {
    const fromPath =
      (location.state as { from?: Location })?.from?.pathname || "/";
    dispatch(authLogin(data)).then((res) => {
      if (res) {
        navigate(fromPath, { replace: true });
      }
    });
  };

  return (
    <Box
      sx={{
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Paper sx={{ padding: 5, maxWidth: 500 }}>
        <Typography component="h1" variant="h6">
          Por favor, entre com usuário e senha para acessar o sistema:
        </Typography>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={1}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ mt: 1, textAlign: "center" }}
        >
          <TextField
            autoFocus
            label="Username"
            error={errors.username ? true : false}
            helperText={errors.username?.message}
            {...register("username")}
          />
          <TextField
            label="Senha"
            type={showPassword ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleShowPassword}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
            error={errors.password ? true : false}
            helperText={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
            Entrar
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;
