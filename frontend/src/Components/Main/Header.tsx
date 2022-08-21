import * as React from "react";

import { Link, useLocation } from "react-router-dom";
import { getUserFullName, getUserInitials } from "utils";
import { useEffect, useState } from "react";

import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { GlobalConfig } from "redux-simplified";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Stack } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useAppSelector } from "redux/utils";

const pages = [
  { path: "/shp/", title: "SHP" },
  // { path: "/igc/", title: "IGC" },
  // { path: "/spda/", title: "SPDA" },
  { path: "/admin/", title: "Administração" },
];

const settings = [
  { path: "/profile/", title: "Perfil" },
  { path: "/logout/", title: "Logout" },
];

const Header = () => {
  const location = useLocation();
  const auth = useAppSelector((state) => state.auth);
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (auth.token) {
      GlobalConfig.setConfig({
        authorizationHeaderContent: `Token ${auth.token}`,
        actionMessages: {
          reset: null,
          list: null,
          create: "Criado com sucesso!",
          retrieve: null,
          update: "Atualizado com sucesso!",
          destroy: "Removido com sucesso!",
        },
      });
    }
  }, [auth.token]);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    // page.title === "IGC" || page.title === "SPDA" ? true : false
    setAnchorElNav(null);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            component="img"
            sx={{
              height: 60,
              mr: 2,
              display: { xs: "none", md: "flex" },
            }}
            alt=""
            src={"/brand.png"}
          />

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.title}
                  component={Link}
                  to={page.path}
                  onClick={handleCloseNavMenu}
                >
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
            }}
          >
            <Box
              component="img"
              sx={{
                height: 60,
              }}
              alt=""
              src={"/brand.png"}
            />
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={1}
            >
              {pages.map((page) => (
                <Button
                  key={page.title}
                  component={Link}
                  to={page.path}
                  onClick={handleCloseNavMenu}
                  color={
                    location.pathname.includes(page.path)
                      ? "secondary"
                      : "primary"
                  }
                  variant={
                    location.pathname.includes(page.path) ? "contained" : "text"
                  }
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  <Typography
                    variant="h6"
                    noWrap
                    minWidth={"100px"}
                    textAlign="center"
                  >
                    {page.title}
                  </Typography>
                </Button>
              ))}
            </Stack>
          </Box>

          {auth.isAuthenticated ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title={getUserFullName(auth.user)}>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={getUserFullName(auth.user)}
                    sx={{ backgroundColor: "success.main" }}
                  >
                    {getUserInitials(auth.user)}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem
                    key={setting.title}
                    component={Link}
                    to={setting.path}
                    onClick={handleCloseUserMenu}
                  >
                    <Typography textAlign="center">{setting.title}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          ) : (
            <Button
              component={Link}
              to="/login"
              sx={{ my: 2, color: "white", display: "block" }}
            >
              <Typography
                variant="h6"
                noWrap
                minWidth={"100px"}
                textAlign="center"
              >
                Entrar
              </Typography>
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default Header;
