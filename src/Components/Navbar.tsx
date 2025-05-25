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
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { User } from "../data-models/users";
import logo from "../assets/images/main-logo.png";

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

  const mainBlue = '#1a2b4b';
  const accentColor = '#007bff';
  const softGray = '#f4f6f9';

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
      color: '#dc3545'
    }
  ], [auth, handleClose]);

  const getInitials = useCallback((name?: string) => {
    if (!name) return 'U';
    const initials = name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
    return initials.length > 2 ? initials.slice(0, 2) : initials;
  }, []);

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: 'white',
        boxShadow: `0 2px 6px ${alpha(mainBlue, 0.12)}`,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        color: mainBlue,
      }}
    >
      <Toolbar sx={{
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3, md: 4 },
        height: '64px',
        ml: showMenuButton ? '48px' : 0
      }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', ml: showMenuButton ? 2 : 0
        }}>
          <Tooltip title="Home">
            <img
              src={logo}
              alt="Logo"
              style={{
                height: '36px',
                marginRight: '16px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onClick={() => navigate('/home')}
            />
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
              textTransform: 'none',
              color: mainBlue,
              borderRadius: '12px',
              padding: '6px 12px',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: softGray,
              }
            }}
          >
            <Avatar
              alt={user?.name}
              src={user?.profilePictureURL}
              sx={{
                width: 40,
                height: 40,
                marginRight: { xs: 0, sm: 1.5 },
                backgroundColor: alpha(accentColor, isHovered ? 0.3 : 0.2),
                color: accentColor,
                fontWeight: 700,
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isHovered ? `0 4px 10px ${alpha(accentColor, 0.2)}` : 'none'
              }
              }
            >
              {(!user?.profilePictureURL) && getInitials(user?.name)}
            </Avatar>
            <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: mainBlue,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.95rem',
                  lineHeight: 1.2
                }}
              >
                {user?.name || 'User'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: alpha(mainBlue, 0.7),
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.8rem',
                  lineHeight: 1
                }}
              >
                {user?.designation || 'Role'}
              </Typography>
            </Box>
          </Button>

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
                mt: 1,
                minWidth: 240,
                borderRadius: '12px',
                boxShadow: `0 8px 24px ${alpha(mainBlue, 0.15)}`,
                border: `1px solid ${alpha(mainBlue, 0.1)}`,
                backgroundColor: 'white',
                overflow: 'visible',
              }
            }}
          >
            {menuItems.map((item, index) => (
              <React.Fragment key={item.text}>
                <MenuItem
                  onClick={item.onClick}
                  sx={{
                    color: item.color || (mainBlue),
                    fontFamily: "'Inter', sans-serif",
                    borderRadius: '8px',
                    margin: '4px 8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(item.color || mainBlue, 0.1),
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', mr: 1.5 }}>
                    {item.icon}
                  </ListItemIcon>
                  {item.text}
                </MenuItem>
                {index < menuItems.length - 1 && <Divider sx={{ my: 0.5 }} />}
              </React.Fragment>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;