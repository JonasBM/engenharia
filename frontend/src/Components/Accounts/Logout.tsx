import { Navigate } from "react-router-dom";
import React from "react";
import { authLogout } from "api/auth";
import { useAppDispatch } from "redux/utils";
import { useEffect } from "react";

const Logout = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(authLogout());
  }, [dispatch]);

  return <Navigate to="/" replace />;
};

export default Logout;
