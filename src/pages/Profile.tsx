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
  Divider,
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

  const mainBlue = '#1a2b4b';

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
          <Box sx={{ p: 3 }}>
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
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap',
  }));

  const InfoLabel = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    minWidth: '150px',
    color: '#1a2b4b',
    display: 'flex',
    alignItems: 'center',
  }));

  const InfoValue = styled(Typography)(({ theme }) => ({
    flex: 1,
    color: theme.palette.text.secondary,
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

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            mx: "auto",
            borderRadius: "20px",
            backgroundColor: '#f8f9fa',
            p: 3,
            boxShadow: `0 4px 6px ${alpha(mainBlue, 0.1)}`,
          }}
        >
          {/* New Unified Profile section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 0,
                borderRadius: "12px",
                backgroundColor: 'white',
                mb: 3,
                overflow: 'hidden'
              }}
            >
              <Grid container>
                <Grid item xs={12} md={3}
                  sx={{
                    borderRight: { xs: 'none', md: `1px solid ${alpha(mainBlue, 0.1)}` },
                    borderBottom: { xs: `1px solid ${alpha(mainBlue, 0.1)}`, md: 'none' },
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Avatar
                    alt={profileData?.name}
                    src={profilePicture || profileData?.profilePictureURL}
                    sx={{
                      width: 180,
                      height: 180,
                      mb: 2,
                      boxShadow: `0 4px 10px ${alpha(mainBlue, 0.2)}`
                    }}
                  />

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: mainBlue,
                      mb: 1,
                      textAlign: 'center'
                    }}
                  >
                    {profileData?.name}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: alpha(mainBlue, 0.7),
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {profileData?.designation}
                  </Typography>

                  <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                    {profileData?.profilePictureURL && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => handleUploadSuccess({ success: true, url: null })}
                        >
                          Remove Profile Picture
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <PasswordChange />
                </Grid>

                {/* Right side - Tabbed content */}
                <Grid item xs={12} md={9} sx={{ p: 0 }}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
                            py: 2
                          },
                          '& .Mui-selected': {
                            color: `${mainBlue} !important`,
                            fontWeight: 600
                          },
                          '& .MuiTabs-indicator': {
                            backgroundColor: mainBlue
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
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2
                          }}
                        >
                          {profileData && (
                            <UserPersonalProfile profileData={profileData} authToken={authToken} />
                          )}
                        </Box>
                      </Box>
                    </TabPanel>

                    {/* Employment Details Tab */}
                    <TabPanel value={tabValue} index={1}>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 2, color: mainBlue }}>
                          Employment Information
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <InfoRow>
                              <InfoLabel>
                                <WorkIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />
                                Designation:
                              </InfoLabel>
                              <InfoValue>{profileData?.designation || 'Not provided'}</InfoValue>
                            </InfoRow>

                            <InfoRow>
                              <InfoLabel>
                                <AssignmentIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />
                                Department:
                              </InfoLabel>
                              <InfoValue>{profileData?.department || 'Not provided'}</InfoValue>
                            </InfoRow>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <InfoRow>
                              <InfoLabel>
                                <DateRangeIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />
                                Join Date:
                              </InfoLabel>
                              <InfoValue>{formatDateForDisplay(profileData?.joinDate)}</InfoValue>
                            </InfoRow>

                            <InfoRow>
                              <InfoLabel>
                                <TimelineIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />
                                Idle Days:
                              </InfoLabel>
                              <InfoValue>{profileData?.totalIdleDays || 0}</InfoValue>
                            </InfoRow>
                          </Grid>
                        </Grid>
                      </Box>
                    </TabPanel>

                    {/* Travel Details Tab */}
                    <TabPanel value={tabValue} index={2}>
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2
                          }}
                        >
                          {profileData && (
                            <UserTravelProfile profileData={profileData} authToken={authToken} />
                          )}
                        </Box>
                      </Box>
                    </TabPanel>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        </Paper>
      </motion.div>
    </Layout>
  );
};

export default ProfilePage;