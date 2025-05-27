import React, { useState, useCallback, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Avatar,
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  alpha,
  ListItemIcon,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AccountCircle as ProfileIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { User } from "../data-models/users";

import logo from "../assets/images/logo-small.png";

interface NavbarProps {
  showMenuButton?: boolean;
  onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ showMenuButton, onMenuClick }) => {
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { storedValue: user } = useLocalStorage<User | null>("user", null);

  const primaryRed = '#dc2626';
  const darkGrey = '#1f2937';
  const mediumGrey = '#6b7280';
  const white = '#ffffff';

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback((route?: string) => {
    if (route) {
      navigate(route);
    }
    setAnchorEl(null);
  }, [navigate]);

  const menuItems = useMemo(() => [
    {
      icon: <ProfileIcon fontSize="small" />,
      text: "Profile",
      onClick: () => handleClose("/profile")
    },
    {
      icon: <LogoutIcon fontSize="small" />,
      text: "Logout",
      onClick: () => {
        auth?.logout();
        handleClose();
      },
      color: primaryRed
    }
  ], [auth, handleClose]);

  const getInitials = useCallback((name?: string) => {
    if (!name) return 'TC';
    const initials = name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
    return initials.length > 2 ? initials.slice(0, 2) : initials;
  }, []);

  return (
    <motion.div
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: white,
          borderBottom: `1px solid ${alpha(mediumGrey, 0.15)}`,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar 
          sx={{
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3, md: 4 },
            height: { xs: '56px', sm: '64px' },
            minHeight: { xs: '56px', sm: '64px' },
            ml: showMenuButton && !isMobile ? '240px' : 0,
            transition: 'margin-left 0.3s ease',
          }}
        >
          {/* Left side: Menu button (mobile) + Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {showMenuButton && isMobile && (
              <IconButton
                onClick={onMenuClick}
                sx={{
                  color: darkGrey,
                  p: 1,
                  '&:hover': {
                    backgroundColor: alpha(primaryRed, 0.05),
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  py: 1,
                  px: { xs: 1, sm: 2 },
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(primaryRed, 0.04),
                  },
                }}
                onClick={() => navigate('/home')}
              >
                <Box
                  sx={{
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: { xs: 1, sm: 1.5 },
                  }}
                >
                  <img
                    src={logo}
                    alt="Technocrafts Logo"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
                
                {!isMobile && (
                  <Typography
                    sx={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      color: darkGrey,
                      fontSize: { sm: '1.1rem', md: '1.2rem' },
                      letterSpacing: '-0.025em',
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    Technocrafts Electric
                  </Typography>
                )}
              </Box>
            </motion.div>
          </Box>

          {/* Right side: User menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleClick}
                sx={{
                  textTransform: 'none',
                  color: darkGrey,
                  borderRadius: '12px',
                  p: { xs: 1, sm: 1.5 },
                  minWidth: 'auto',
                  backgroundColor: white,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(primaryRed, 0.04),
                    borderColor: alpha(primaryRed, 0.2),
                  },
                }}
              >
                <Avatar
                  alt={user?.name}
                  src={user?.profilePictureURL}
                  sx={{
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    backgroundColor: alpha(primaryRed, 0.1),
                    color: primaryRed,
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    mr: isTablet ? 0 : 1.5,
                  }}
                >
                  {(!user?.profilePictureURL) && getInitials(user?.name)}
                </Avatar>
                
                {!isTablet && (
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        color: darkGrey,
                        fontSize: '0.9rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {user?.name || 'User'}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        color: mediumGrey,
                        fontSize: '0.75rem',
                        lineHeight: 1,
                        fontWeight: 400,
                      }}
                    >
                      {user?.designation || 'Team Member'}
                    </Typography>
                  </Box>
                )}
              </Button>
            </motion.div>

            <AnimatePresence>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => handleClose()}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: { xs: 200, sm: 240 },
                    borderRadius: '12px',
                    border: `1px solid ${alpha(mediumGrey, 0.15)}`,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    backgroundColor: white,
                    overflow: 'visible',
                    '&::before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: white,
                      transform: 'translateY(-50%) rotate(45deg)',
                      border: `1px solid ${alpha(mediumGrey, 0.15)}`,
                      borderBottom: 'none',
                      borderRight: 'none',
                    },
                  }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* User info section */}
                  <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${alpha(mediumGrey, 0.1)}` }}>
                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        color: darkGrey,
                        fontSize: '0.9rem',
                        mb: 0.5,
                      }}
                    >
                      {user?.name || 'User'}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        color: mediumGrey,
                        fontSize: '0.8rem',
                      }}
                    >
                      {user?.designation || 'Team Member'}
                    </Typography>
                  </Box>

                  {/* Menu items */}
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <MenuItem
                        onClick={item.onClick}
                        sx={{
                          color: item.color || darkGrey,
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 500,
                          fontSize: '0.9rem',
                          borderRadius: '8px',
                          mx: 1.5,
                          my: 0.5,
                          py: 1.5,
                          px: 2,
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            backgroundColor: alpha(item.color || primaryRed, 0.06),
                          },
                        }}
                      >
                        <ListItemIcon 
                          sx={{ 
                            color: 'inherit', 
                            mr: 1.5,
                            minWidth: 'auto',
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        {item.text}
                      </MenuItem>
                    </motion.div>
                  ))}
                </motion.div>
              </Menu>
            </AnimatePresence>
          </Box>
        </Toolbar>
      </AppBar>
    </motion.div>
  );
};

export default Navbar;