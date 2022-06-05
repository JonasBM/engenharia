import { Navigate, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "redux/utils";

import Loading from "./Loading";
import { authLoadProfile } from "api/auth";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  //has token but not authenticated => try login
  //has token and authenticated => open page
  //dont has token => login page
  useEffect(() => {
    if (auth.loading === "idle" && auth.token && !auth.isAuthenticated) {
      dispatch(authLoadProfile());
    }
  }, [auth, dispatch]);

  if (auth.loading === "succeeded" && auth.token && auth.isAuthenticated) {
    return children;
  }
  if (auth.loading !== "pending" && !auth.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Loading />;
};

export default PrivateRoute;
