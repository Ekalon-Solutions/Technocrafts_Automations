import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Grid,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  styled
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Cake as CakeIcon,
  Male as MaleIcon,
  Female as FemaleIcon
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserDetails, UserUpdateDetails } from '../apis/updateUserDetails';
import { UserCompleteDetails } from '../apis/getProfileDetails';

interface UserPersonalProfileProps {
  profileData: UserCompleteDetails;
  authToken: string;
}

const formatDateForDisplay = (dateString: string | Date | null): string => {
  if (!dateString) return 'N/A';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

interface ExtendedUserUpdateDetails extends UserUpdateDetails {
  alternateEmail?: string;
  alternativePhoneNumber?: string;
}

const UserPersonalProfile: React.FC<UserPersonalProfileProps> = ({ profileData, authToken }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<ExtendedUserUpdateDetails>>({
    name: '',
    branch: '',
    department: '',
    designation: '',
    birthDate: '',
    phoneNumber: '',
    email: '',
    gender: '',
    alternateEmail: '',
    alternativePhoneNumber: '',
  });
  const [errors, setErrors] = useState<{
    alternateEmail?: string;
  }>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [originalData, setOriginalData] = useState<Partial<ExtendedUserUpdateDetails>>({});

  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData, token }: { id: string; userData: ExtendedUserUpdateDetails; token: string }) =>
      updateUserDetails({ id, userData, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getUserCompleteDetails', profileData.id] });
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
      setEditMode(false);
    },
    onError: (error: { message: string }) => {
      setSnackbar({
        open: true,
        message: `Error updating profile: ${error.message}`,
        severity: 'error',
      });
    },
  });

  useEffect(() => {
    if (profileData) {
      const newFormData = {
        name: profileData.name || '',
        branch: profileData.branch || '',
        department: profileData.department || '',
        designation: profileData.designation || '',
        birthDate: profileData.birthDate || '',
        phoneNumber: profileData.phoneNumber || '',
        email: profileData.email || '',
        gender: profileData.gender || '',
        alternateEmail: (profileData as any).alternateEmail || '',
        alternativePhoneNumber: (profileData as any).alternativePhoneNumber || '',
      };

      setFormData(newFormData);

      setOriginalData({ ...newFormData });
    }
  }, [profileData]);

  const validateEmail = (email: string): boolean => {
    if (!email) return true;
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email.toLowerCase());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'alternateEmail') {
      validateAlternateEmail(value);
    }
  };

  const validateAlternateEmail = (email: string): void => {
    if (!email) {
      setErrors(prev => ({ ...prev, alternateEmail: undefined }));
      return;
    }

    if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, alternateEmail: 'Please enter a valid email address' }));
    } else if (email === formData.email) {
      setErrors(prev => ({ ...prev, alternateEmail: 'Alternate email must be different from primary email' }));
    } else {
      setErrors(prev => ({ ...prev, alternateEmail: undefined }));
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: { alternateEmail?: string } = {};

    if (formData.alternateEmail) {
      if (!validateEmail(formData.alternateEmail)) {
        newErrors.alternateEmail = 'Please enter a valid email address';
        isValid = false;
      } else if (formData.alternateEmail === formData.email) {
        newErrors.alternateEmail = 'Alternate email must be different from primary email';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const mainBlue = '#1a2b4b';
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
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  }));

  const InfoValue = styled(Typography)(({ theme }) => ({
    flex: 1,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  }));

  const toggleEditMode = () => {
    if (editMode) {
      setFormData({ ...originalData });
      setErrors({});
    } else {
      setOriginalData({ ...formData });
    }
    setEditMode(!editMode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix validation errors before submitting',
        severity: 'error',
      });
      return;
    }

    const userData: ExtendedUserUpdateDetails = {
      ...profileData,
      phoneNumber: formData.phoneNumber,
      alternateEmail: formData.alternateEmail,
      alternativePhoneNumber: formData.alternativePhoneNumber,
    };

    updateUserMutation.mutate({
      id: profileData.id,
      userData,
      token: authToken,
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'alternateEmail') {
      validateAlternateEmail(value);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: mainBlue }}>
            Personal Information
          </Typography>

          {/* Edit/save buttons */}
          <Box>
            {editMode ? (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={toggleEditMode}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={updateUserMutation.status === 'pending' ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSubmit}
                  disabled={updateUserMutation.status === 'pending' || Object.values(errors).some(error => !!error)}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={toggleEditMode}
              >
                Edit Contact Details
              </Button>
            )}
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {/* Email (read-only) */}
              <InfoRow>
                <InfoLabel>
                  <EmailIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />
                  Email:
                </InfoLabel>
                <InfoValue>{formData.email || 'Not provided'}</InfoValue>
              </InfoRow>

              {/* Alternative Email (editable) */}
              {editMode ? (
                <TextField
                  fullWidth
                  label="Alternative Email"
                  name="alternateEmail"
                  value={formData.alternateEmail || ''}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  margin="normal"
                  error={!!errors.alternateEmail}
                  helperText={errors.alternateEmail}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />,
                  }}
                />
              ) : (
                <InfoRow>
                  <InfoLabel>
                    <EmailIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />
                    Alternative Email:
                  </InfoLabel>
                  <InfoValue>{formData.alternateEmail || 'Not provided'}</InfoValue>
                </InfoRow>
              )}

              {/* Phone (editable) */}
              {editMode ? (
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />,
                  }}
                />
              ) : (
                <InfoRow>
                  <InfoLabel>
                    <PhoneIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />
                    Phone:
                  </InfoLabel>
                  <InfoValue>{formData.phoneNumber || 'Not provided'}</InfoValue>
                </InfoRow>
              )}

              {/* Alternative Phone (editable) */}
              {editMode ? (
                <TextField
                  fullWidth
                  label="Alternative Phone Number"
                  name="alternativePhoneNumber"
                  value={formData.alternativePhoneNumber || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />,
                  }}
                />
              ) : (
                <InfoRow>
                  <InfoLabel>
                    <PhoneIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />
                    Alternative Phone:
                  </InfoLabel>
                  <InfoValue>{formData.alternativePhoneNumber || 'Not provided'}</InfoValue>
                </InfoRow>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Gender (read-only) */}
              <InfoRow>
                <InfoLabel>
                  {formData.gender === 'Male' ? (
                    <MaleIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />
                  ) : formData.gender === 'Female' ? (
                    <FemaleIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />
                  ) : null}
                  Gender:
                </InfoLabel>
                <InfoValue>{formData.gender || 'Not provided'}</InfoValue>
              </InfoRow>

              {/* Birth Date (read-only) */}
              <InfoRow>
                <InfoLabel>
                  <CakeIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />
                  Birth Date:
                </InfoLabel>
                <InfoValue>{formatDateForDisplay(formData.birthDate || 'Not provided')}</InfoValue>
              </InfoRow>

              {/* Branch (read-only) */}
              <InfoRow>
                <InfoLabel>
                  <LocationOnIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />
                  Branch:
                </InfoLabel>
                <InfoValue>{formData.branch || 'Not provided'}</InfoValue>
              </InfoRow>
            </Grid>
          </Grid>
        </form>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default UserPersonalProfile;