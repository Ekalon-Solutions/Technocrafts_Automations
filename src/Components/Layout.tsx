import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  alpha,
  IconButton,
  Fade,
  Paper,
  Tooltip,
  useMediaQuery,
  Collapse,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ProfileIcon from "@mui/icons-material/AccountCircle";
import PeopleIcon from "@mui/icons-material/Group";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import HomeIcon from "@mui/icons-material/Home";

import Navbar from "./Navbar";
import { useNavigate, useLocation } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { User } from "../data-models/users";

interface LayoutProps {
  children: React.ReactNode;
}

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      light: '#34495e',
      dark: '#1a2b4b',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f6f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#7f8c8d',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
});

const Layout = (props: LayoutProps) => {
  const { storedValue: user } = useLocalStorage<User | null>("user", null);
  const { storedValue: isPinned, setValue: setIsPinned } = useLocalStorage<boolean>("sidebarPinned", false);
  
  const [open, setOpen] = useState(isPinned);
  const [permanentDrawer, setPermanentDrawer] = useState(isPinned);
  
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dashboardOpen, setDashboardOpen] = useState(false);

  useEffect(() => {
    setPermanentDrawer(isPinned);
    if (isPinned) {
      setOpen(true);
    }
  }, [isPinned]);

  const baseListItems = useMemo(() => [
    {
      text: "Home",
      icon: <HomeIcon />,
      path: "/home",
      requiredAccess: null,
    },
    {
      text: "Profile",
      icon: <ProfileIcon />,
      path: "/profile",
      requiredAccess: null,
    }
  ], []);

  const adminListItems = useMemo(() => [
    ...baseListItems,
    {
      text: "Employees",
      icon: <PeopleIcon />,
      path: "/employees",
      requiredAccess: "Admin",
    }
  ], [baseListItems]);

  const marketingListItems = useMemo(() => [
    ...baseListItems,
    {
      text: "Employees",
      icon: <PeopleIcon />,
      path: "/employees",
      requiredAccess: "Marketing",
    }
  ], [baseListItems]);


  const listItems = useMemo(() => {
    let selectedList;

    if (user?.access.includes("Marketing")) {
      selectedList = marketingListItems;
    } else if (user?.access.includes("Admin")) {
      selectedList = adminListItems;
    } else {
      selectedList = baseListItems;
    }

    return selectedList.filter(item =>
      !item.requiredAccess || user?.access.includes(item.requiredAccess)
    );
  }, [user, marketingListItems, adminListItems, baseListItems]);


  const handleOptionClick = useCallback((path: string) => {
    navigate(path);

    if (isMobile) {
      setOpen(false);
    }
  }, [navigate, isMobile]);


  const togglePermanentDrawer = useCallback(() => {
    const newPinnedState = !permanentDrawer;
    setPermanentDrawer(newPinnedState);
    setIsPinned(newPinnedState);
    setOpen(newPinnedState);
  }, [permanentDrawer, setIsPinned]);

  const toggleMobileMenu = useCallback(() => {
    setOpen(!open);
  }, [open]);

  const drawerWidth = open || permanentDrawer ? 260 : 80;

  const renderMobileMenuButton = () => (
    <IconButton
      color="inherit"
      aria-label="open drawer"
      edge="start"
      onClick={toggleMobileMenu}
      sx={{
        position: 'fixed',
        left: 16,
        top: 12,
        zIndex: theme.zIndex.drawer + 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        },
      }}
    >
      <MenuIcon />
    </IconButton>
  );

  const handleDashboardToggle = useCallback(() => {
    setDashboardOpen(prevDashboardOpen => !prevDashboardOpen);
  }, [setDashboardOpen]);

  useEffect(() => {
    if (!open && !isMobile && !permanentDrawer) {
      setDashboardOpen(false);
    }
  }, [open, isMobile, permanentDrawer, setDashboardOpen]);

  const handleMouseEnter = useCallback(() => {
    if (!permanentDrawer && !isMobile) {
      setOpen(true);
    }
  }, [permanentDrawer, isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!permanentDrawer && !isMobile) {
      setOpen(false);
    }
  }, [permanentDrawer, isMobile]);

  return (
    <ThemeProvider theme={lightTheme}>
      <Box
        sx={{
          display: 'flex',
          bgcolor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <CssBaseline />
        <Navbar showMenuButton={isMobile} onMenuClick={toggleMobileMenu} />
        {isMobile && renderMobileMenuButton()}

        <Drawer
          variant={isMobile ? "temporary" : (permanentDrawer ? "persistent" : "permanent")}
          open={open}
          onClose={() => setOpen(false)}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              top: '64px',
              height: 'calc(100% - 64px)',
              borderRight: `1px solid ${alpha(lightTheme.palette.primary.main, 0.1)}`,
              backgroundColor: 'background.paper',
              boxShadow: lightTheme.shadows[2],
              transition: lightTheme.transitions.create(['width'], {
                easing: lightTheme.transitions.easing.easeInOut,
                duration: lightTheme.transitions.duration.standard,
              }),
              zIndex: lightTheme.zIndex.appBar - 1,
              overflowX: 'hidden',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(lightTheme.palette.primary.main, 0.2),
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: alpha(lightTheme.palette.primary.main, 0.3),
              },
            },
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            borderBottom: `1px solid ${alpha(lightTheme.palette.primary.main, 0.1)}`,
          }}>
            {!isMobile && (
              <Tooltip title={permanentDrawer ? "Unpin Menu" : "Pin Menu"}>
                <IconButton
                  onClick={togglePermanentDrawer}
                  color={permanentDrawer ? "primary" : "default"}
                >
                  {permanentDrawer ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <List sx={{ p: 2 }}>
            <AnimatePresence>
              {listItems.map((item, index) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.05
                  }}
                >
                  {item.children ? (
                    <React.Fragment key={item.text}>
                      <ListItem
                        button
                        onClick={handleDashboardToggle}
                        sx={{
                          borderRadius: '12px',
                          mb: 1,
                          p: 1.5,
                          color: dashboardOpen ? 'primary.main' : 'text.secondary',
                          bgcolor: dashboardOpen ? alpha(lightTheme.palette.primary.main, 0.1) : 'transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: alpha(lightTheme.palette.primary.main, 0.05),
                            transform: 'translateX(5px)',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'inherit',
                            minWidth: 40,
                          },
                        }}
                      >
                        <Tooltip title={!open && !isMobile ? item.text : ''} placement="right">
                          <ListItemIcon>{item.icon}</ListItemIcon>
                        </Tooltip>
                        <Fade in={open || isMobile} timeout={300}>
                          <ListItemText
                            primary={
                              <Typography
                                sx={{
                                  fontFamily: "'Inter', sans-serif",
                                  fontWeight: open ? 600 : 400,
                                  fontSize: '0.95rem',
                                  color: dashboardOpen ? 'primary.main' : 'text.secondary',
                                  opacity: open || isMobile ? 1 : 0,
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                {item.text}
                              </Typography>
                            }
                          />
                        </Fade>
                        {(open || isMobile) && (dashboardOpen ? <ExpandLess /> : <ExpandMore />)}
                      </ListItem>
                      <Collapse in={dashboardOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item.children.map(child => (
                            <ListItem
                              key={child.text}
                              button
                              onClick={() => handleOptionClick(child.path!)}
                              selected={location.pathname === child.path}
                              sx={{
                                borderRadius: '12px',
                                mb: 1,
                                p: 1.5,
                                pl: '1rem',
                                color: location.pathname === child.path
                                  ? 'primary.main'
                                  : 'text.secondary',
                                bgcolor: location.pathname === child.path
                                  ? alpha(lightTheme.palette.primary.main, 0.1)
                                  : 'transparent',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  bgcolor: alpha(lightTheme.palette.primary.main, 0.05),
                                  transform: 'translateX(5px)',
                                },
                                '& .MuiListItemIcon-root': {
                                  color: 'inherit',
                                  minWidth: 40,
                                },
                              }}
                            >
                              <Tooltip title={!open && !isMobile ? child.text : ''} placement="right">
                                <ListItemIcon>{child.icon}</ListItemIcon>
                              </Tooltip>
                              <Fade in={open || isMobile} timeout={300}>
                                <ListItemText
                                  primary={
                                    <Typography
                                      sx={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontWeight: open ? 600 : 400,
                                        fontSize: '0.9rem',
                                        color: location.pathname === child.path
                                          ? 'primary.main'
                                          : 'text.secondary',
                                        opacity: open || isMobile ? 1 : 0,
                                        transition: 'all 0.3s ease',
                                      }}
                                    >
                                      {child.text}
                                    </Typography>
                                  }
                                />
                              </Fade>
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </React.Fragment>
                  ) : (
                    <ListItem
                      button
                      onClick={() => handleOptionClick(item.path!)}
                      selected={location.pathname === item.path}
                      sx={{
                        borderRadius: '12px',
                        mb: 1,
                        p: 1.5,
                        color: location.pathname === item.path
                          ? 'primary.main'
                          : 'text.secondary',
                        bgcolor: location.pathname === item.path
                          ? alpha(lightTheme.palette.primary.main, 0.1)
                          : 'transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: alpha(lightTheme.palette.primary.main, 0.05),
                          transform: 'translateX(5px)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'inherit',
                          minWidth: 40,
                        },
                      }}
                    >
                      <Tooltip title={!open && !isMobile ? item.text : ''} placement="right">
                        <ListItemIcon>{item.icon}</ListItemIcon>
                      </Tooltip>
                      <Fade in={open || isMobile} timeout={300}>
                        <ListItemText
                          primary={
                            <Typography
                              sx={{
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: open ? 600 : 400,
                                fontSize: '0.95rem',
                                color: location.pathname === item.path
                                  ? 'primary.main'
                                  : 'text.secondary',
                                opacity: open || isMobile ? 1 : 0,
                                transition: 'all 0.3s ease',
                              }}
                            >
                              {item.text}
                            </Typography>
                          }
                        />
                      </Fade>
                    </ListItem>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            pt: '88px',
            maxWidth: '100%',
            width: {
              xs: '100%',
              sm: !isMobile
                ? `calc(100% - ${open || permanentDrawer ? drawerWidth : 80}px)`
                : '100%'
            },

            transition: lightTheme.transitions.create(['width', 'margin'], {
              easing: lightTheme.transitions.easing.easeInOut,
              duration: lightTheme.transitions.duration.standard,
            }),
          }}
        >
          <Paper
            elevation={1}
            sx={{
              borderRadius: 3,
              bgcolor: 'background.paper',
              minHeight: 'calc(100vh - 120px)',
            }}
          >
            {props.children}
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;