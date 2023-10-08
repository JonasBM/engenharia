import { Navigate, Route, Routes } from "react-router-dom";

import Administration from "Components/Administration";
import Login from "./Components/Accounts/Login";
import Logout from "./Components/Accounts/Logout";
import NotFound from "./Components/Common/NotFound";
import PrivateRoute from "./Components/Common/PrivateRoute";
import Profile from "Components/Accounts/Profile";
import SHP from "./Components/SHP/System";
import IGCPrimary from "./Components/IGC/SystemPrimary";
import IGCSecondary from "./Components/IGC/SystemSecondary";
import SPDA from "Components/SPDA";
import Home from "Components/Main/Home";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shp" element={<PrivateRoute children={<SHP />} />} />
      <Route path="/igcprimary" element={<PrivateRoute children={<IGCPrimary />} />} />
      <Route path="/igcsecondary" element={<PrivateRoute children={<IGCSecondary />} />} />
      <Route path="/spda" element={<PrivateRoute children={<SPDA />} />} />
      <Route
        path="/admin/*"
        element={<PrivateRoute children={<Administration />} />}
      />
      <Route
        path="/profile"
        element={<PrivateRoute children={<Profile />} />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
