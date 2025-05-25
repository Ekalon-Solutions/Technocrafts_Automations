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

import Navbar from "./Navbar";
import { useNavigate, useLocation } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { User } from "../data-models/users";

interface LayoutProps {
  children: React.ReactNode;
}

const technocraftsTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#dc2626',
      light: '#ef4444',
      dark: '#b91c1c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6b7280',
      light: '#9ca3af',
      dark: '#374151',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    body1: {
      fontWeight: 400,
    },
    body2: {
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
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
    },
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

  const drawerWidth = open || permanentDrawer ? 280 : 72;

  const renderMobileMenuButton = () => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
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
          bgcolor: 'white',
          color: 'grey.700',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid',
          borderColor: 'grey.200',
          '&:hover': {
            bgcolor: 'grey.50',
            transform: 'scale(1.05)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        <MenuIcon />
      </IconButton>
    </motion.div>
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
    <ThemeProvider theme={technocraftsTheme}>
      <Box
        sx={{
          display: 'flex',
          bgcolor: 'grey.50',
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
              borderRight: '1px solid',
              borderColor: 'grey.200',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transition: technocraftsTheme.transitions.create(['width'], {
                easing: technocraftsTheme.transitions.easing.easeInOut,
                duration: technocraftsTheme.transitions.duration.standard,
              }),
              zIndex: technocraftsTheme.zIndex.appBar - 1,
              overflowX: 'hidden',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(technocraftsTheme.palette.grey[400], 0.5),
                borderRadius: '2px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: alpha(technocraftsTheme.palette.grey[500], 0.7),
              },
            },
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'grey.200',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            }}>
              {!isMobile && (
                <Tooltip title={permanentDrawer ? "Unpin Menu" : "Pin Menu"}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IconButton
                      onClick={togglePermanentDrawer}
                      sx={{
                        color: permanentDrawer ? 'primary.main' : 'grey.600',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: permanentDrawer ? alpha(technocraftsTheme.palette.primary.main, 0.1) : 'grey.100',
                        }
                      }}
                    >
                      {permanentDrawer ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                    </IconButton>
                  </motion.div>
                </Tooltip>
              )}
            </Box>
          </motion.div>
          
          <List sx={{ p: 3 }}>
            <AnimatePresence>
              {listItems.map((item, index) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  {item.children ? (
                    <React.Fragment key={item.text}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ListItem
                          button
                          onClick={handleDashboardToggle}
                          sx={{
                            borderRadius: '12px',
                            mb: 1.5,
                            p: 2,
                            color: dashboardOpen ? 'primary.main' : 'grey.700',
                            bgcolor: dashboardOpen ? alpha(technocraftsTheme.palette.primary.main, 0.05) : 'transparent',
                            border: '1px solid',
                            borderColor: dashboardOpen ? alpha(technocraftsTheme.palette.primary.main, 0.2) : 'transparent',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              bgcolor: dashboardOpen ? alpha(technocraftsTheme.palette.primary.main, 0.08) : 'grey.50',
                              borderColor: dashboardOpen ? alpha(technocraftsTheme.palette.primary.main, 0.3) : 'grey.200',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                            },
                            '& .MuiListItemIcon-root': {
                              color: 'inherit',
                              minWidth: 44,
                            },
                          }}
                        >
                          <Tooltip title={!open && !isMobile ? item.text : ''} placement="right">
                            <ListItemIcon>{item.icon}</ListItemIcon>
                          </Tooltip>
                          <Fade in={open || isMobile} timeout={400}>
                            <ListItemText
                              primary={
                                <Typography
                                  sx={{
                                    fontFamily: "'Roboto', sans-serif",
                                    fontWeight: open ? 600 : 500,
                                    fontSize: '0.95rem',
                                    color: dashboardOpen ? 'primary.main' : 'grey.700',
                                    opacity: open || isMobile ? 1 : 0,
                                    transition: 'all 0.3s ease',
                                  }}
                                >
                                  {item.text}
                                </Typography>
                              }
                            />
                          </Fade>
                          {(open || isMobile) && (
                            <motion.div
                              animate={{ rotate: dashboardOpen ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {dashboardOpen ? <ExpandLess /> : <ExpandMore />}
                            </motion.div>
                          )}
                        </ListItem>
                      </motion.div>
                      <Collapse in={dashboardOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item.children.map((child, childIndex) => (
                            <motion.div
                              key={child.text}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: childIndex * 0.05 }}
                            >
                              <motion.div
                                whileHover={{ x: 8 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <ListItem
                                  button
                                  onClick={() => handleOptionClick(child.path!)}
                                  selected={location.pathname === child.path}
                                  sx={{
                                    borderRadius: '10px',
                                    mb: 1,
                                    p: 1.5,
                                    ml: 2,
                                    color: location.pathname === child.path ? 'primary.main' : 'grey.600',
                                    bgcolor: location.pathname === child.path 
                                      ? alpha(technocraftsTheme.palette.primary.main, 0.08)
                                      : 'transparent',
                                    borderLeft: '3px solid',
                                    borderLeftColor: location.pathname === child.path 
                                      ? 'primary.main' 
                                      : 'transparent',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                      bgcolor: location.pathname === child.path 
                                        ? alpha(technocraftsTheme.palette.primary.main, 0.12)
                                        : 'grey.50',
                                      borderLeftColor: location.pathname === child.path 
                                        ? 'primary.main' 
                                        : 'grey.300',
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
                                  <Fade in={open || isMobile} timeout={400}>
                                    <ListItemText
                                      primary={
                                        <Typography
                                          sx={{
                                            fontFamily: "'Roboto', sans-serif",
                                            fontWeight: open ? 500 : 400,
                                            fontSize: '0.9rem',
                                            color: location.pathname === child.path ? 'primary.main' : 'grey.600',
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
                              </motion.div>
                            </motion.div>
                          ))}
                        </List>
                      </Collapse>
                    </React.Fragment>
                  ) : (
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ListItem
                        button
                        onClick={() => handleOptionClick(item.path!)}
                        selected={location.pathname === item.path}
                        sx={{
                          borderRadius: '12px',
                          mb: 1.5,
                          p: 2,
                          color: location.pathname === item.path ? 'primary.main' : 'grey.700',
                          bgcolor: location.pathname === item.path 
                            ? alpha(technocraftsTheme.palette.primary.main, 0.05)
                            : 'transparent',
                          border: '1px solid',
                          borderColor: location.pathname === item.path 
                            ? alpha(technocraftsTheme.palette.primary.main, 0.2)
                            : 'transparent',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            bgcolor: location.pathname === item.path 
                              ? alpha(technocraftsTheme.palette.primary.main, 0.08)
                              : 'grey.50',
                            borderColor: location.pathname === item.path 
                              ? alpha(technocraftsTheme.palette.primary.main, 0.3)
                              : 'grey.200',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'inherit',
                            minWidth: 44,
                          },
                        }}
                      >
                        <Tooltip title={!open && !isMobile ? item.text : ''} placement="right">
                          <ListItemIcon>{item.icon}</ListItemIcon>
                        </Tooltip>
                        <Fade in={open || isMobile} timeout={400}>
                          <ListItemText
                            primary={
                              <Typography
                                sx={{
                                  fontFamily: "'Roboto', sans-serif",
                                  fontWeight: open ? 600 : 500,
                                  fontSize: '0.95rem',
                                  color: location.pathname === item.path ? 'primary.main' : 'grey.700',
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
                    </motion.div>
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
            bgcolor: 'grey.50',
            pt: '88px',
            maxWidth: '100%',
            width: {
              xs: '100%',
              sm: !isMobile
                ? `calc(100% - ${open || permanentDrawer ? drawerWidth : 72}px)`
                : '100%'
            },
            transition: technocraftsTheme.transitions.create(['width', 'margin'], {
              easing: technocraftsTheme.transitions.easing.easeInOut,
              duration: technocraftsTheme.transitions.duration.standard,
            }),
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: '16px',
                bgcolor: 'white',
                minHeight: 'calc(100vh - 120px)',
                border: '1px solid',
                borderColor: 'grey.200',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                backdropFilter: 'blur(10px)',
                background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
              }}
            >
              {props.children}
            </Paper>
          </motion.div>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;