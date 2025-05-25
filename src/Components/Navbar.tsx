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
  Divider,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import {
  AccountCircle as ProfileIcon,
  Logout as LogoutIcon,
  ElectricalServices as ElectricalIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { User } from "../data-models/users";

interface NavbarProps {
  showMenuButton?: boolean;
  onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ showMenuButton, onMenuClick }) => {
  const auth = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { storedValue: user } = useLocalStorage<User | null>("user", null);

  const primaryRed = '#dc2626';
  const darkGray = '#1f2937';
  const mediumGray = '#6b7280';

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
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          color: darkGray,
          borderBottom: '1px solid',
          borderBottomColor: alpha(mediumGray, 0.2),
        }}
      >
        <Toolbar sx={{
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3, md: 4 },
          height: '64px',
          ml: showMenuButton ? '56px' : 0
        }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Box sx={{
              display: 'flex', 
              alignItems: 'center', 
              ml: showMenuButton ? 2 : 0,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/home')}
            >
              <Tooltip title="Technocrafts Electric - Home">
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 2,
                  p: 1,
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: alpha(primaryRed, 0.05),
                  }
                }}>
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <ElectricalIcon 
                      sx={{ 
                        fontSize: '2rem', 
                        color: primaryRed,
                        filter: 'drop-shadow(0 2px 4px rgba(220, 38, 38, 0.2))'
                      }} 
                    />
                  </motion.div>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        color: darkGray,
                        lineHeight: 1.2,
                        background: `linear-gradient(135deg, ${darkGray} 0%, ${primaryRed} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      TECHNOCRAFTS
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        color: mediumGray,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Electric Solutions
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
            </Box>
          </motion.div>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                sx={{
                  textTransform: 'none',
                  color: darkGray,
                  borderRadius: '16px',
                  padding: '8px 16px',
                  border: '1px solid',
                  borderColor: alpha(mediumGray, 0.2),
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: alpha(primaryRed, 0.05),
                    borderColor: alpha(primaryRed, 0.3),
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                <motion.div
                  animate={{ scale: isHovered ? 1.05 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Avatar
                    alt={user?.name}
                    src={user?.profilePictureURL}
                    sx={{
                      width: 40,
                      height: 40,
                      marginRight: { xs: 0, sm: 1.5 },
                      backgroundColor: alpha(primaryRed, 0.1),
                      color: primaryRed,
                      fontWeight: 700,
                      fontSize: '1rem',
                      border: '2px solid',
                      borderColor: isHovered ? alpha(primaryRed, 0.3) : alpha(mediumGray, 0.2),
                      transition: 'all 0.3s ease',
                      boxShadow: isHovered ? `0 4px 12px ${alpha(primaryRed, 0.25)}` : '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {(!user?.profilePictureURL) && getInitials(user?.name)}
                  </Avatar>
                </motion.div>
                <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: darkGray,
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: '0.95rem',
                      lineHeight: 1.2
                    }}
                  >
                    {user?.name || 'User'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: mediumGray,
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: '0.8rem',
                      lineHeight: 1,
                      fontWeight: 500
                    }}
                  >
                    {user?.designation || 'Team Member'}
                  </Typography>
                </Box>
              </Button>
            </motion.div>

            <AnimatePresence>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => handleClose()}
                TransitionProps={{
                  style: {
                    transformOrigin: 'top right'
                  }
                }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 260,
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    border: '1px solid',
                    borderColor: alpha(mediumGray, 0.2),
                    backgroundColor: 'white',
                    overflow: 'visible',
                    backdropFilter: 'blur(10px)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                    '&::before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'white',
                      transform: 'translateY(-50%) rotate(45deg)',
                      border: '1px solid',
                      borderColor: alpha(mediumGray, 0.2),
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
                  transition={{ duration: 0.2 }}
                >
                  <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha(mediumGray, 0.1) }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: mediumGray,
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 500,
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Account Menu
                    </Typography>
                  </Box>
                  {menuItems.map((item, index) => (
                    <React.Fragment key={item.text}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 4 }}
                      >
                        <MenuItem
                          onClick={item.onClick}
                          sx={{
                            color: item.color || darkGray,
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 500,
                            borderRadius: '12px',
                            margin: '8px 12px',
                            padding: '12px 16px',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              backgroundColor: alpha(item.color || primaryRed, 0.08),
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            }
                          }}
                        >
                          <ListItemIcon sx={{ 
                            color: 'inherit', 
                            mr: 2,
                            minWidth: 'auto'
                          }}>
                            {item.icon}
                          </ListItemIcon>
                          {item.text}
                        </MenuItem>
                      </motion.div>
                      {index < menuItems.length - 1 && (
                        <Divider sx={{ 
                          my: 0.5, 
                          mx: 2,
                          borderColor: alpha(mediumGray, 0.1)
                        }} />
                      )}
                    </React.Fragment>
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