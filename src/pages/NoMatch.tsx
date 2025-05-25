import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../Components/Layout";
import { 
  Home as HomeIcon, 
  ElectricalServices,
  Warning,
  ArrowBack
} from '@mui/icons-material';

const NoMatch: React.FC = () => {
  const navigate = useNavigate();
  
  const primaryRed = '#dc2626';
  const darkRed = '#b91c1c';
  const darkGrey = '#1f2937';
  const mediumGrey = '#6b7280';
  const lightGrey = '#f3f4f6';
  const white = '#ffffff';
  const black = '#000000';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }
    }
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const glitchVariants = {
    glitch: {
      x: [0, -2, 2, 0],
      filter: [
        'hue-rotate(0deg)',
        'hue-rotate(90deg)',
        'hue-rotate(180deg)',
        'hue-rotate(0deg)'
      ],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        repeatDelay: 2,
      }
    }
  };

  return (
    <Layout>
      <Box
        sx={{
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 1, sm: 2, md: 3 },
          background: `linear-gradient(135deg, ${lightGrey} 0%, ${white} 100%)`,
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ flex: 1 }}
        >
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: "24px",
              background: `linear-gradient(145deg, ${white} 0%, ${lightGrey} 100%)`,
              border: `1px solid ${alpha(primaryRed, 0.1)}`,
              overflow: 'hidden',
              boxShadow: `0 20px 40px ${alpha(black, 0.1)}`,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at 80% 20%, ${alpha(primaryRed, 0.03)} 0%, transparent 50%)`,
                pointerEvents: 'none',
              },
            }}
          >
            {/* Header */}
            <motion.div variants={itemVariants}>
              <Box
                sx={{
                  p: { xs: 3, sm: 4, md: 5 },
                  borderBottom: `1px solid ${alpha(mediumGrey, 0.1)}`,
                  background: `linear-gradient(135deg, ${darkGrey} 0%, ${black} 100%)`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(45deg, ${alpha(primaryRed, 0.1)} 0%, transparent 100%)`,
                  },
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
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
                        boxShadow: `0 8px 24px ${alpha(primaryRed, 0.3)}`,
                      }}
                    >
                      <Warning sx={{ fontSize: 28, color: white }} />
                    </Box>
                  </motion.div>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontWeight: 700,
                      color: white,
                      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                      letterSpacing: '-0.025em',
                    }}
                  >
                    Page Not Found
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            {/* Main Content */}
            <Box
              sx={{
                p: { xs: 3, sm: 4, md: 6 },
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Floating Background Elements */}
              <motion.div
                variants={floatingVariants}
                animate="float"
                style={{
                  position: 'absolute',
                  top: '20%',
                  right: '20%',
                  opacity: 0.1,
                }}
              >
                <ElectricalServices sx={{ fontSize: 120, color: primaryRed }} />
              </motion.div>

              <motion.div
                variants={floatingVariants}
                animate="float"
                style={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '15%',
                  opacity: 0.05,
                  animationDelay: '1s',
                }}
              >
                <ElectricalServices sx={{ fontSize: 80, color: darkGrey }} />
              </motion.div>

              {/* 404 Text */}
              <motion.div variants={itemVariants}>
                <motion.div
                  variants={glitchVariants}
                  animate="glitch"
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 900,
                      background: `linear-gradient(135deg, ${alpha(primaryRed, 0.2)} 0%, ${alpha(darkGrey, 0.1)} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { xs: '6rem', sm: '8rem', md: '12rem' },
                      mb: 2,
                      textAlign: 'center',
                      letterSpacing: '-0.05em',
                      position: 'relative',
                      '&::before': {
                        content: '"404"',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(135deg, ${primaryRed} 0%, ${darkRed} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        opacity: 0.1,
                        transform: 'translate(2px, 2px)',
                      },
                    }}
                  >
                    404
                  </Typography>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    color: darkGrey,
                    mb: 2,
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  }}
                >
                  Oops! Something went wrong
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    color: mediumGrey,
                    mb: 6,
                    textAlign: 'center',
                    maxWidth: '500px',
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                  }}
                >
                  The page you're looking for seems to have vanished into the electrical void. 
                  Let's get you back to safety.
                </Typography>
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<HomeIcon />}
                      onClick={() => navigate("/home")}
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: "12px",
                        background: `linear-gradient(135deg, ${primaryRed} 0%, ${darkRed} 100%)`,
                        color: white,
                        textTransform: "none",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: '1rem',
                        boxShadow: `0 8px 32px ${alpha(primaryRed, 0.3)}`,
                        border: 'none',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${darkRed} 0%, ${primaryRed} 100%)`,
                          boxShadow: `0 12px 40px ${alpha(primaryRed, 0.4)}`,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      Go to Home
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={() => window.history.back()}
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: "12px",
                        borderColor: alpha(primaryRed, 0.5),
                        color: primaryRed,
                        textTransform: "none",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: '1rem',
                        borderWidth: '2px',
                        '&:hover': {
                          borderColor: primaryRed,
                          backgroundColor: alpha(primaryRed, 0.05),
                          borderWidth: '2px',
                        },
                      }}
                    >
                      Go Back
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            </Box>

            {/* Footer */}
            <motion.div variants={itemVariants}>
              <Box
                sx={{
                  p: { xs: 3, sm: 4, md: 5 },
                  borderTop: `1px solid ${alpha(mediumGrey, 0.1)}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                  background: alpha(lightGrey, 0.5),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        background: `linear-gradient(135deg, ${primaryRed} 0%, ${darkRed} 100%)`,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ElectricalServices sx={{ fontSize: 24, color: white }} />
                    </Box>
                  </motion.div>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "'Inter', sans-serif",
                      color: mediumGrey,
                      fontWeight: 500,
                    }}
                  >
                    Technocrafts Electric - Switchgear & Panels
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    color: alpha(mediumGrey, 0.7),
                    fontSize: '0.875rem',
                  }}
                >
                  Powering Innovation Since 1995
                </Typography>
              </Box>
            </motion.div>
          </Paper>
        </motion.div>
      </Box>
    </Layout>
  );
};

export default NoMatch;