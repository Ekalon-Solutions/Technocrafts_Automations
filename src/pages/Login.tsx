import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  InputAdornment,
  alpha,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Slide,
} from "@mui/material";
import { Visibility, VisibilityOff, ElectricalServices } from "@mui/icons-material";
import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { requestPasswordReset } from "../apis/resetPassword";

const Login: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>("");
  const [resetSent, setResetSent] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const primaryRed = '#dc2626';
  const darkRed = '#b91c1c';
  const darkGrey = '#1f2937';
  const mediumGrey = '#6b7280';
  const lightGrey = '#f3f4f6';
  const white = '#ffffff';
  const black = '#000000';

  useEffect(() => {
    if (auth?.user) {
      if (auth?.user.access.toLowerCase().includes("admin")) {
        navigate("/home");
      } else {
        navigate("/home");
      }
    }
  }, [auth?.user, navigate]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    auth?.loginUser.mutate({ email, password });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleForgotPasswordOpen = () => {
    setForgotPasswordOpen(true);
    setResetSent(false);
    setResetError("");
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
    setResetEmail("");
  };

  const handleResetSubmit = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset({ email: resetEmail });
      setResetSent(true);
      setResetError("");
    } catch (error) {
      setResetError((error as Error).message || "An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${darkGrey} 0%, ${black} 100%)`,
        p: { xs: 2, sm: 4, md: 6 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, ${alpha(primaryRed, 0.3)} 0%, transparent 50%), 
                      radial-gradient(circle at 80% 20%, ${alpha(primaryRed, 0.2)} 0%, transparent 50%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: '100%', maxWidth: '1200px', zIndex: 1 }}
      >
        <Paper
          elevation={24}
          sx={{
            width: '100%',
            borderRadius: '24px',
            overflow: 'hidden',
            border: `1px solid ${alpha(primaryRed, 0.2)}`,
            boxShadow: `0 25px 50px -12px ${alpha(black, 0.25)}, 0 0 0 1px ${alpha(primaryRed, 0.1)}`,
            backdropFilter: 'blur(20px)',
            background: `linear-gradient(145deg, ${white} 0%, ${lightGrey} 100%)`,
          }}
        >
          <Grid container>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                p: { xs: 4, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: `linear-gradient(135deg, ${darkGrey} 0%, ${black} 100%)`,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(45deg, ${alpha(primaryRed, 0.1)} 0%, transparent 100%)`,
                  pointerEvents: 'none',
                },
              }}
            >
              <motion.div variants={itemVariants}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontWeight: 800,
                      color: white,
                      mb: 2,
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                      lineHeight: 1.2,
                      letterSpacing: '-0.025em',
                    }}
                  >
                    Welcome to <br />
                    <Box
                      component="span"
                      sx={{
                        background: `linear-gradient(135deg, ${primaryRed} 0%, ${darkRed} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'inline-block',
                      }}
                    >
                      Technocrafts Electric
                    </Box>
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Inter', sans-serif",
                      color: alpha(white, 0.8),
                      fontSize: '1.1rem',
                      mb: 4,
                      fontWeight: 400,
                    }}
                  >
                    Powering Innovation in Switchgear & Panels
                  </Typography>
                </Box>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Box
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      background: `linear-gradient(135deg, ${primaryRed} 0%, ${darkRed} 100%)`,
                      borderRadius: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 20px 40px ${alpha(primaryRed, 0.3)}`,
                      border: `2px solid ${alpha(white, 0.1)}`,
                    }}
                  >
                    <ElectricalServices sx={{ fontSize: 60, color: white }} />
                  </Box>
                </Box>
              </motion.div>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
              sx={{
                p: { xs: 4, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                bgcolor: white,
              }}
            >
              <motion.div variants={itemVariants}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 4,
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        background: `linear-gradient(135deg, ${primaryRed} 0%, ${darkRed} 100%)`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ElectricalServices sx={{ fontSize: 28, color: white }} />
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        color: darkGrey,
                        letterSpacing: '-0.025em',
                      }}
                    >
                      Technocrafts
                    </Typography>
                  </Box>
                </Box>
              </motion.div>

              <motion.form
                onSubmit={handleSubmit}
                variants={itemVariants}
              >
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <TextField
                    fullWidth
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '& fieldset': {
                          borderColor: alpha(mediumGrey, 0.3),
                          borderWidth: '2px',
                        },
                        '&:hover fieldset': {
                          borderColor: primaryRed,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: primaryRed,
                          boxShadow: `0 0 0 3px ${alpha(primaryRed, 0.1)}`,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: mediumGrey,
                        '&.Mui-focused': {
                          color: primaryRed,
                        },
                      },
                    }}
                  />
                </motion.div>

                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            onClick={togglePasswordVisibility} 
                            edge="end"
                            sx={{
                              color: mediumGrey,
                              '&:hover': {
                                color: primaryRed,
                              },
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '& fieldset': {
                          borderColor: alpha(mediumGrey, 0.3),
                          borderWidth: '2px',
                        },
                        '&:hover fieldset': {
                          borderColor: primaryRed,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: primaryRed,
                          boxShadow: `0 0 0 3px ${alpha(primaryRed, 0.1)}`,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: mediumGrey,
                        '&.Mui-focused': {
                          color: primaryRed,
                        },
                      },
                    }}
                  />
                </motion.div>

                <Box sx={{ textAlign: 'right', mb: 3 }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={handleForgotPasswordOpen}
                    sx={{
                      color: primaryRed,
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: darkRed,
                      },
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    type="submit"
                    sx={{
                      py: 1.5,
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${primaryRed} 0%, ${darkRed} 100%)`,
                      textTransform: 'none',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: '1rem',
                      boxShadow: `0 8px 32px ${alpha(primaryRed, 0.3)}`,
                      border: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${darkRed} 0%, ${primaryRed} 100%)`,
                        boxShadow: `0 12px 40px ${alpha(primaryRed, 0.4)}`,
                        transform: 'translateY(-2px)',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                      },
                    }}
                  >
                    Sign In
                  </Button>
                </motion.div>
              </motion.form>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Forgot Password Dialog */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={handleForgotPasswordClose}
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            minWidth: '400px',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          color: darkGrey,
          fontFamily: "'Inter', sans-serif",
        }}>
          Reset Password
        </DialogTitle>
        <DialogContent>
          {!resetSent ? (
            <>
              <DialogContentText sx={{ mb: 2, color: mediumGrey }}>
                Enter your email address and we'll send you a link to reset your password.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Email Address"
                type="email"
                fullWidth
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                error={!!resetError}
                helperText={resetError}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&.Mui-focused fieldset': {
                      borderColor: primaryRed,
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: primaryRed,
                  },
                }}
              />
            </>
          ) : (
            <DialogContentText sx={{ color: mediumGrey }}>
              If an account exists with the email address {resetEmail}, you will receive a password reset link shortly.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleForgotPasswordClose} 
            sx={{ 
              color: mediumGrey,
              textTransform: 'none',
              '&:hover': {
                color: darkGrey,
              },
            }}
          >
            {resetSent ? 'Close' : 'Cancel'}
          </Button>
          {!resetSent && (
            <Button 
              onClick={handleResetSubmit} 
              variant="contained"
              disabled={isSubmitting}
              sx={{
                background: `linear-gradient(135deg, ${primaryRed} 0%, ${darkRed} 100%)`,
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  background: `linear-gradient(135deg, ${darkRed} 0%, ${primaryRed} 100%)`,
                },
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;