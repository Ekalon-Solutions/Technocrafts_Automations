import React, { useState, useEffect } from "react";
import {
  Paper,
  alpha,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Description, Build } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Layout from "../Components/Layout";

interface AppTool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  category: string;
  color: string;
  bgGradient: string;
  isNew?: boolean;
  isPopular?: boolean;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { storedValue: user } = useLocalStorage("user", null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTools, setFilteredTools] = useState<AppTool[]>([]);

  const primaryRed = '#dc2626';
  const darkRed = '#b91c1c';
  const darkGrey = '#1f2937';
  const mediumGrey = '#6b7280';
  const lightGrey = '#f3f4f6';
  const white = '#ffffff';
  const black = '#000000';

  const appTools: AppTool[] = [
    {
      id: '1',
      title: 'BOM Creator',
      description: 'Create and manage Bill of Materials with automated calculations',
      icon: <Build sx={{ fontSize: 32, color: white }} />,
      route: '/bom-creator',
      category: 'Production',
      color: primaryRed,
      bgGradient: `linear-gradient(135deg, ${primaryRed} 0%, ${darkRed} 100%)`,
      isPopular: true,
    },
    {
      id: '2',
      title: 'Design PDF Tools',
      description: 'Convert, merge, and optimize PDF documents for technical designs',
      icon: <Description sx={{ fontSize: 32, color: white }} />,
      route: '/pdf-tools',
      category: 'Documentation',
      color: darkGrey,
      bgGradient: `linear-gradient(135deg, ${darkGrey} 0%, ${black} 100%)`,
      isNew: true,
    },
  ];

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTools(appTools);
    } else {
      const filtered = appTools.filter(tool =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTools(filtered);
    }
  }, [searchQuery]);

  const handleToolClick = (route: string) => {
    navigate(route);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  };

  return (
    <Layout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            mx: "auto",
            borderRadius: "24px",
            backgroundColor: lightGrey,
            minHeight: "100vh",
            background: `linear-gradient(145deg, ${lightGrey} 0%, ${white} 100%)`,
            overflow: 'hidden',
          }}
        >
          {/* Header Section */}
          <motion.div variants={itemVariants}>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${darkGrey} 0%, ${black} 100%)`,
                p: { xs: 3, md: 4 },
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
              {/* Top Bar */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      color: white,
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                    }}
                  >
                    Technocrafts Suite
                  </Typography>
                </Box>
              </Box>

              {/* Welcome Section */}
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 800,
                    color: white,
                    mb: 1,
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    lineHeight: 1.2,
                  }}
                >
                  Welcome back, {user?.name || 'User'}!
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    color: alpha(white, 0.8),
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    mb: 3,
                  }}
                >
                  Your productivity tools are ready to use
                </Typography>

                {/* Search Bar */}
                <TextField
                  fullWidth
                  placeholder="Search tools, features, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: mediumGrey }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    maxWidth: '600px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      backgroundColor: alpha(white, 0.95),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(white, 0.2)}`,
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover': {
                        backgroundColor: white,
                        boxShadow: `0 8px 32px ${alpha(black, 0.1)}`,
                      },
                      '&.Mui-focused': {
                        backgroundColor: white,
                        boxShadow: `0 8px 32px ${alpha(primaryRed, 0.2)}`,
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: 1.5,
                      fontSize: '1rem',
                    },
                  }}
                />
              </Box>
            </Box>
          </motion.div>

          {/* Tools Grid Section */}
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <motion.div variants={itemVariants}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  color: darkGrey,
                  mb: 3,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                }}
              >
                Available Tools
                <Chip
                  label={`${filteredTools.length} tool${filteredTools.length !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    ml: 2,
                    backgroundColor: alpha(primaryRed, 0.1),
                    color: primaryRed,
                    fontWeight: 500,
                  }}
                />
              </Typography>
            </motion.div>

            {/* Tools Grid */}
            <Grid container spacing={3}>
              <AnimatePresence mode="wait">
                {filteredTools.map((tool, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={tool.id}>
                    <motion.div
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.03, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        onClick={() => handleToolClick(tool.route)}
                        sx={{
                          borderRadius: '20px',
                          cursor: 'pointer',
                          border: 'none',
                          boxShadow: `0 8px 32px ${alpha(black, 0.08)}`,
                          transition: 'all 0.3s ease',
                          height: '240px',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            boxShadow: `0 16px 48px ${alpha(black, 0.12)}`,
                            transform: 'translateY(-4px)',
                          },
                        }}
                      >
                        {/* Card Header with Icon */}
                        <Box
                          sx={{
                            background: tool.bgGradient,
                            p: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            minHeight: '120px',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: `radial-gradient(circle at 30% 30%, ${alpha(white, 0.2)} 0%, transparent 70%)`,
                              pointerEvents: 'none',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              position: 'relative',
                              zIndex: 1,
                              transform: 'rotate(-5deg)',
                            }}
                          >
                            {tool.icon}
                          </Box>
                          
                          {/* Badges */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              display: 'flex',
                              gap: 1,
                            }}
                          >
                            {tool.isNew && (
                              <Chip
                                label="New"
                                size="small"
                                sx={{
                                  backgroundColor: alpha(white, 0.9),
                                  color: primaryRed,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  height: '20px',
                                }}
                              />
                            )}
                            {tool.isPopular && (
                              <Chip
                                label="Popular"
                                size="small"
                                sx={{
                                  backgroundColor: alpha(white, 0.9),
                                  color: darkGrey,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  height: '20px',
                                }}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Card Content */}
                        <CardContent
                          sx={{
                            p: 3,
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 700,
                                color: darkGrey,
                                mb: 1,
                                fontSize: '1.1rem',
                                lineHeight: 1.2,
                              }}
                            >
                              {tool.title}
                            </Typography>
                            <Typography
                              sx={{
                                color: mediumGrey,
                                fontSize: '0.85rem',
                                lineHeight: 1.4,
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              {tool.description}
                            </Typography>
                          </Box>
                          
                          <Chip
                            label={tool.category}
                            size="small"
                            sx={{
                              alignSelf: 'flex-start',
                              mt: 2,
                              backgroundColor: alpha(tool.color, 0.1),
                              color: tool.color,
                              fontWeight: 500,
                              fontSize: '0.75rem',
                            }}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>

            {/* No Results State */}
            {filteredTools.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: mediumGrey,
                      fontFamily: "'Inter', sans-serif",
                      mb: 2,
                    }}
                  >
                    No tools found
                  </Typography>
                  <Typography
                    sx={{
                      color: alpha(mediumGrey, 0.7),
                      fontSize: '0.9rem',
                    }}
                  >
                    Try adjusting your search query or browse all available tools
                  </Typography>
                </Box>
              </motion.div>
            )}
          </Box>
        </Paper>
      </motion.div>
    </Layout>
  );
};

export default ProfilePage;