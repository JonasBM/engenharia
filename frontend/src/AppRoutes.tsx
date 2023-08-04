import { Navigate, Route, Routes } from "react-router-dom";

import Administration from "Components/Administration";
import Login from "./Components/Accounts/Login";
import Logout from "./Components/Accounts/Logout";
import NotFound from "./Components/Common/NotFound";
import PrivateRoute from "./Components/Common/PrivateRoute";
import Profile from "Components/Accounts/Profile";
import SHP from "./Components/SHP/System";
import IGC from "./Components/IGC/System";
import SPDA from "Components/SPDA";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/shp" />} />
      <Route path="/shp" element={<PrivateRoute children={<SHP />} />} />
      <Route path="/igc" element={<PrivateRoute children={<IGC />} />} />
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
