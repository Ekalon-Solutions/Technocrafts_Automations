import { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  alpha,
  Tabs,
  Tab,
  styled,
  Button
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  DateRange as DateRangeIcon,
  AccountCircle as ProfileIcon,
  Timeline as TimelineIcon,
  FlightTakeoff as FlightIcon,
  ElectricalServices,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Layout from "../Components/Layout";
import { getUserCompleteDetails } from "../apis/getProfileDetails.ts";
import { updateProfilePicture } from '../apis/updateProfilePicture';

import FileUpload from '../Components/FileUpload';
import PasswordChange from '../Components/PasswordChange';
import UserTravelProfile from '../Components/UserTravelProfile.tsx';
import UserPersonalProfile from "../Components/UserPersonalProfile.tsx";

const ProfilePage = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const { storedValue: user } = useLocalStorage("user", null);
  const { storedValue: authToken } = useLocalStorage("token", "");
  const [tabValue, setTabValue] = useState(0);

  const primaryRed = '#dc2626';
  const darkRed = '#b91c1c';
  const darkGrey = '#1f2937';
  const mediumGrey = '#6b7280';
  const lightGrey = '#f3f4f6';
  const white = '#ffffff';
  const black = '#000000';

  const handleUploadSuccess = async (response: {
    success: any; url: any;
  }) => {
    if (response.success) {
      try {
        const profileUpdateResponse = await updateProfilePicture(
          {
            userId: user?.id,
            profilePictureURL: response.url
          },
          authToken
        );
        const updatedUser = {
          ...user,
          profilePictureURL: response.url,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        setProfilePicture(response.url);
      } catch (error) {

      }
    }
  };

  const handleUploadError = (error: any) => {
    console.error('Upload error');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`profile-tabpanel-${index}`}
        aria-labelledby={`profile-tab-${index}`}
        style={{ width: '100%' }}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 4 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };

  const a11yProps = (index) => {
    return {
      id: `profile-tab-${index}`,
      'aria-controls': `profile-tabpanel-${index}`,
    };
  };

  const InfoRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap',
    padding: theme.spacing(2),
    borderRadius: '12px',
    background: `linear-gradient(135deg, ${alpha(lightGrey, 0.5)} 0%, ${alpha(white, 0.8)} 100%)`,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(mediumGrey, 0.1)}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 25px ${alpha(black, 0.1)}`,
      border: `1px solid ${alpha(primaryRed, 0.2)}`,
    }
  }));

  const InfoLabel = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    minWidth: '150px',
    color: darkGrey,
    display: 'flex',
    alignItems: 'center',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    letterSpacing: '-0.025em',
  }));

  const InfoValue = styled(Typography)(({ theme }) => ({
    flex: 1,
    color: mediumGrey,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
  }));

  const formatDateForDisplay = (dateString: string | Date | null): string => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const { data: profileData }: { data: UserCompleteDetails } = useQuery({
    queryKey: ["getUserCompleteDetails", user?.id],
    queryFn: () => getUserCompleteDetails({
      id: user?.id,
      token: authToken
    }),
    enabled: !!user?.id && !!authToken,
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box
          sx={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${lightGrey} 0%, ${white} 100%)`,
            p: { xs: 2, sm: 3, md: 4 },
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 80% 20%, ${alpha(primaryRed, 0.08)} 0%, transparent 50%), 
                          radial-gradient(circle at 20% 80%, ${alpha(darkGrey, 0.05)} 0%, transparent 50%)`,
              pointerEvents: 'none',
            },
          }}
        >
          <motion.div variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                mx: "auto",
                borderRadius: "24px",
                backgroundColor: 'transparent',
                p: 0,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "20px",
                    backgroundColor: white,
                    mb: 0,
                    overflow: 'hidden',
                    border: `1px solid ${alpha(primaryRed, 0.1)}`,
                    boxShadow: `0 20px 50px -12px ${alpha(black, 0.15)}, 0 0 0 1px ${alpha(primaryRed, 0.05)}`,
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <Grid container>
                    <Grid item xs={12} md={3}
                      sx={{
                        background: `linear-gradient(145deg, ${darkGrey} 0%, ${black} 100%)`,
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        style={{ position: 'relative', zIndex: 1 }}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            mb: 3,
                          }}
                        >
                          <Avatar
                            alt={profileData?.name}
                            src={profilePicture || profileData?.profilePictureURL}
                            sx={{
                              width: 160,
                              height: 160,
                              border: `4px solid ${alpha(white, 0.2)}`,
                              boxShadow: `0 15px 35px ${alpha(black, 0.3)}`,
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: -10,
                              right: -10,
                              width: 40,
                              height: 40,
                              background: `linear-gradient(135deg, ${primaryRed} 0%, ${darkRed} 100%)`,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `3px solid ${white}`,
                              boxShadow: `0 8px 20px ${alpha(primaryRed, 0.4)}`,
                            }}
                          >
                            <ElectricalServices sx={{ fontSize: 20, color: white }} />
                          </Box>
                        </Box>
                      </motion.div>

                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: white,
                          mb: 1,
                          textAlign: 'center',
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          letterSpacing: '-0.025em',
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        {profileData?.name}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          color: alpha(white, 0.8),
                          mb: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 500,
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        {profileData?.designation}
                      </Typography>

                      <Box sx={{ 
                        mb: 3, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 1,
                        gap: 2
                      }}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FileUpload
                            onUploadSuccess={handleUploadSuccess}
                            onUploadError={handleUploadError}
                            maxFileSize={10 * 1024 * 1024}
                            profilePicture={true}
                            buttonText='Update Profile Picture'
                            acceptedFileTypes={[
                              'image/heic',
                              'image/jpeg',
                              'image/jpg',
                              'image/png',
                            ]}
                          />
                        </motion.div>
                        
                        {profileData?.profilePictureURL && (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              variant="outlined"
                              onClick={() => handleUploadSuccess({ success: true, url: null })}
                              sx={{
                                borderColor: alpha(white, 0.3),
                                color: white,
                                textTransform: 'none',
                                borderRadius: '12px',
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 500,
                                '&:hover': {
                                  borderColor: primaryRed,
                                  backgroundColor: alpha(primaryRed, 0.1),
                                },
                              }}
                            >
                              Remove Profile Picture
                            </Button>
                          </motion.div>
                        )}
                      </Box>

                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <PasswordChange />
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={9} sx={{ p: 0 }}>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ 
                          borderBottom: `1px solid ${alpha(mediumGrey, 0.1)}`,
                          background: `linear-gradient(135deg, ${alpha(lightGrey, 0.3)} 0%, ${alpha(white, 0.8)} 100%)`,
                        }}>
                          <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            aria-label="Profile tabs"
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                              '& .MuiTab-root': {
                                minWidth: 'auto',
                                px: 3,
                                py: 3,
                                textTransform: 'none',
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 600,
                                color: mediumGrey,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  color: primaryRed,
                                  backgroundColor: alpha(primaryRed, 0.05),
                                },
                              },
                              '& .Mui-selected': {
                                color: `${primaryRed} !important`,
                                backgroundColor: alpha(primaryRed, 0.08),
                              },
                              '& .MuiTabs-indicator': {
                                backgroundColor: primaryRed,
                                height: 3,
                                borderRadius: '2px',
                              }
                            }}
                          >
                            <Tab
                              icon={<ProfileIcon fontSize="small" />}
                              iconPosition="start"
                              label="Personal Details"
                              {...a11yProps(0)}
                            />
                            <Tab
                              icon={<WorkIcon fontSize="small" />}
                              iconPosition="start"
                              label="Employment Details"
                              {...a11yProps(1)}
                            />
                            <Tab
                              icon={<FlightIcon fontSize="small" />}
                              iconPosition="start"
                              label="Travel Details"
                              {...a11yProps(2)}
                            />
                          </Tabs>
                        </Box>

                        <TabPanel value={tabValue} index={0}>
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  mb: 3
                                }}
                              >
                                {profileData && (
                                  <UserPersonalProfile profileData={profileData} authToken={authToken} />
                                )}
                              </Box>
                            </Box>
                          </motion.div>
                        </TabPanel>

                        <TabPanel value={tabValue} index={1}>
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    background: `linear-gradient(135deg, ${primaryRed} 0%, ${darkRed} 100%)`,
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2,
                                  }}
                                >
                                  <WorkIcon sx={{ fontSize: 20, color: white }} />
                                </Box>
                                <Typography 
                                  variant="h5" 
                                  sx={{ 
                                    color: darkGrey,
                                    fontFamily: "'Inter', sans-serif",
                                    fontWeight: 700,
                                    letterSpacing: '-0.025em',
                                  }}
                                >
                                  Employment Information
                                </Typography>
                              </Box>

                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <motion.div
                                    whileHover={{ y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                  >
                                    <InfoRow>
                                      <InfoLabel>
                                        <WorkIcon sx={{ mr: 1.5, fontSize: 18, color: primaryRed }} />
                                        Designation:
                                      </InfoLabel>
                                      <InfoValue>{profileData?.designation || 'Not provided'}</InfoValue>
                                    </InfoRow>
                                  </motion.div>

                                  <motion.div
                                    whileHover={{ y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                  >
                                    <InfoRow>
                                      <InfoLabel>
                                        <AssignmentIcon sx={{ mr: 1.5, fontSize: 18, color: primaryRed }} />
                                        Department:
                                      </InfoLabel>
                                      <InfoValue>{profileData?.department || 'Not provided'}</InfoValue>
                                    </InfoRow>
                                  </motion.div>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                  <motion.div
                                    whileHover={{ y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                  >
                                    <InfoRow>
                                      <InfoLabel>
                                        <DateRangeIcon sx={{ mr: 1.5, fontSize: 18, color: primaryRed }} />
                                        Join Date:
                                      </InfoLabel>
                                      <InfoValue>{formatDateForDisplay(profileData?.joinDate)}</InfoValue>
                                    </InfoRow>
                                  </motion.div>

                                  <motion.div
                                    whileHover={{ y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                  >
                                    <InfoRow>
                                      <InfoLabel>
                                        <TimelineIcon sx={{ mr: 1.5, fontSize: 18, color: primaryRed }} />
                                        Idle Days:
                                      </InfoLabel>
                                      <InfoValue>{profileData?.totalIdleDays || 0}</InfoValue>
                                    </InfoRow>
                                  </motion.div>
                                </Grid>
                              </Grid>
                            </Box>
                          </motion.div>
                        </TabPanel>

                        <TabPanel value={tabValue} index={2}>
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  mb: 3
                                }}
                              >
                                {profileData && (
                                  <UserTravelProfile profileData={profileData} authToken={authToken} />
                                )}
                              </Box>
                            </Box>
                          </motion.div>
                        </TabPanel>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
            </Paper>
          </motion.div>
        </Box>
      </motion.div>
    </Layout>
  );
};

export default ProfilePage;