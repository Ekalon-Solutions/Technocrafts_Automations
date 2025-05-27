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
  Button,
  IconButton
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  DateRange as DateRangeIcon,
  AccountCircle as ProfileIcon,
  Timeline as TimelineIcon,
  FlightTakeoff as FlightIcon,
  PhotoCamera as PhotoCameraIcon,
  DeleteOutline as DeleteOutlineIcon,
  LockOutlined as LockOutlinedIcon,
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
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
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
    padding: theme.spacing(2.5),
    borderRadius: '12px',
    background: `linear-gradient(135deg, ${alpha(lightGrey, 0.4)} 0%, ${alpha(white, 0.9)} 100%)`,
    border: `1px solid ${alpha(mediumGrey, 0.08)}`,
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      border: `1px solid ${alpha(primaryRed, 0.15)}`,
    }
  }));

  const InfoLabel = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    minWidth: '140px',
    color: darkGrey,
    display: 'flex',
    alignItems: 'center',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    letterSpacing: '-0.025em',
    [theme.breakpoints.down('sm')]: {
      minWidth: 'auto',
      marginBottom: theme.spacing(0.5),
    }
  }));

  const InfoValue = styled(Typography)(({ theme }) => ({
    flex: 1,
    color: mediumGrey,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
  }));

  const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    padding: theme.spacing(1.2, 2.5),
    transition: 'all 0.2s ease',
    border: `1px solid ${alpha(darkGrey, 0.15)}`,
    color: darkGrey,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: alpha(darkGrey, 0.04),
      border: `1px solid ${alpha(darkGrey, 0.25)}`,
      transform: 'translateY(-1px)',
    },
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
          }}
        >
          <motion.div variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                mx: "auto",
                borderRadius: "20px",
                backgroundColor: 'transparent',
                p: 0,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "20px",
                    backgroundColor: white,
                    mb: 0,
                    overflow: 'hidden',
                    border: `1px solid ${alpha(darkGrey, 0.08)}`,
                    boxShadow: `0 8px 32px -8px ${alpha(black, 0.1)}`,
                  }}
                >
                  <Grid container>
                    {/* Left Sidebar */}
                    <Grid item xs={12} md={3}
                      sx={{
                        background: `linear-gradient(180deg, ${white} 0%, ${alpha(lightGrey, 0.3)} 100%)`,
                        p: { xs: 3, md: 4 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRight: { md: `1px solid ${alpha(darkGrey, 0.08)}` },
                        borderBottom: { xs: `1px solid ${alpha(darkGrey, 0.08)}`, md: 'none' },
                      }}
                    >
                      {/* Avatar Section */}
                      <Box
                        sx={{
                          position: 'relative',
                          mb: 3,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Avatar
                            alt={profileData?.name}
                            src={profilePicture || profileData?.profilePictureURL}
                            sx={{
                              width: { xs: 120, md: 140 },
                              height: { xs: 120, md: 140 },
                              border: `2px solid ${alpha(darkGrey, 0.1)}`,
                              mb: 2,
                            }}
                          />
                        </motion.div>

                        {/* Profile Picture Actions */}
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1.5,
                          flexDirection: { xs: 'row', sm: 'row' },
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          justifyContent: 'center'
                        }}>
                          <FileUpload
                            onUploadSuccess={handleUploadSuccess}
                            onUploadError={handleUploadError}
                            maxFileSize={10 * 1024 * 1024}
                            profilePicture={true}
                            buttonText={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PhotoCameraIcon fontSize="small" />
                                <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                  Update
                                </Typography>
                              </Box>
                            }
                            acceptedFileTypes={[
                              'image/heic',
                              'image/jpeg',
                              'image/jpg',
                              'image/png',
                            ]}
                          />
                          
                          {profileData?.profilePictureURL && (
                            <IconButton
                              onClick={() => handleUploadSuccess({ success: true, url: null })}
                              sx={{
                                border: `1px solid ${alpha(darkGrey, 0.15)}`,
                                color: darkGrey,
                                '&:hover': {
                                  backgroundColor: alpha(primaryRed, 0.05),
                                  borderColor: alpha(primaryRed, 0.2),
                                },
                              }}
                              size="small"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>

                      {/* User Info */}
                      <Box sx={{ textAlign: 'center', mb: 4, width: '100%' }}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 600,
                            color: darkGrey,
                            mb: 1,
                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                            letterSpacing: '-0.025em',
                            fontSize: { xs: '1.25rem', md: '1.5rem' }
                          }}
                        >
                          {profileData?.name}
                        </Typography>

                        <Typography
                          variant="body1"
                          sx={{
                            color: mediumGrey,
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          {profileData?.designation}
                        </Typography>
                      </Box>

                      {/* Password Change */}
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <ActionButton
                          startIcon={<LockOutlinedIcon />}
                          fullWidth
                          sx={{ maxWidth: '200px' }}
                        >
                          <PasswordChange />
                        </ActionButton>
                      </Box>
                    </Grid>

                    {/* Main Content */}
                    <Grid item xs={12} md={9} sx={{ p: 0 }}>
                      <Box sx={{ width: '100%' }}>
                        {/* Tabs */}
                        <Box sx={{ 
                          borderBottom: `1px solid ${alpha(mediumGrey, 0.08)}`,
                          background: `linear-gradient(135deg, ${alpha(lightGrey, 0.2)} 0%, ${alpha(white, 0.9)} 100%)`,
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
                                px: { xs: 2, sm: 3 },
                                py: 3,
                                textTransform: 'none',
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 600,
                                color: mediumGrey,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  color: primaryRed,
                                  backgroundColor: alpha(primaryRed, 0.03),
                                },
                              },
                              '& .Mui-selected': {
                                color: `${primaryRed} !important`,
                                backgroundColor: alpha(primaryRed, 0.05),
                              },
                              '& .MuiTabs-indicator': {
                                backgroundColor: primaryRed,
                                height: 2,
                                borderRadius: '1px',
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

                        {/* Personal Details Tab */}
                        <TabPanel value={tabValue} index={0}>
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
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
                                  <ProfileIcon sx={{ fontSize: 20, color: white }} />
                                </Box>
                                <Typography 
                                  variant="h5" 
                                  sx={{ 
                                    color: darkGrey,
                                    fontFamily: "'Inter', sans-serif",
                                    fontWeight: 700,
                                    letterSpacing: '-0.025em',
                                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                  }}
                                >
                                  Personal Information
                                </Typography>
                              </Box>

                              {profileData && (
                                <UserPersonalProfile profileData={profileData} authToken={authToken} />
                              )}
                            </Box>
                          </motion.div>
                        </TabPanel>

                        {/* Employment Details Tab */}
                        <TabPanel value={tabValue} index={1}>
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
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
                                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                  }}
                                >
                                  Employment Information
                                </Typography>
                              </Box>

                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <motion.div
                                    whileHover={{ y: -1 }}
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
                                    whileHover={{ y: -1 }}
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
                                    whileHover={{ y: -1 }}
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
                                    whileHover={{ y: -1 }}
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

                        {/* Travel Details Tab */}
                        <TabPanel value={tabValue} index={2}>
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
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
                                  <FlightIcon sx={{ fontSize: 20, color: white }} />
                                </Box>
                                <Typography 
                                  variant="h5" 
                                  sx={{ 
                                    color: darkGrey,
                                    fontFamily: "'Inter', sans-serif",
                                    fontWeight: 700,
                                    letterSpacing: '-0.025em',
                                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                  }}
                                >
                                  Travel Information
                                </Typography>
                              </Box>

                              {profileData && (
                                <UserTravelProfile profileData={profileData} authToken={authToken} />
                              )}
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