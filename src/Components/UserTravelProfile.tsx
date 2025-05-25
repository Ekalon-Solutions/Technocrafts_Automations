import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Grid,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  Chip,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  alpha,
  styled
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Flight as FlightIcon
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserDetails, UserUpdateDetails } from '../apis/updateUserDetails';
import { UserCompleteDetails } from '../apis/getProfileDetails';

interface EditUserTravelProfileProps {
  profileData: UserCompleteDetails;
  authToken: string;
}

const formatDate = (date: Date | null): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

const formatDateForDisplay = (dateString: string | Date | null): string => {
  if (!dateString) return 'N/A';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const UserTravelProfile: React.FC<EditUserTravelProfileProps> = ({ profileData, authToken }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserUpdateDetails>>({
    name: '',
    branch: '',
    department: '',
    designation: '',
    birthDate: '',
    phoneNumber: '',
    email: '',
    gender: '',
  });
  const [passport, setPassport] = useState({
    passportNumber: '',
    passportIssueDate: null as Date | null,
    passportExpiryDate: null as Date | null,
  });
  const country_list = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia",
    "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
    "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
    "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad",
    "Chile", "China", "Colombia", "Comoros", "Congo", "Congo (Democratic Republic)", "Costa Rica", "Croatia",
    "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
    "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland",
    "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
    "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
    "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea (North)",
    "Korea (South)", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
    "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
    "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
    "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
    "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay",
    "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
    "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
    "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
    "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
    "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
    "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
    "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  interface VisaDetails {
    visaExpiryDate: Date | null;
    visaCountry: string[];
    multipleEntry: boolean;
    applicable: boolean;
  }

  const [visas, setVisas] = useState<Array<VisaDetails>>([]);
  const [openVisaDialog, setOpenVisaDialog] = useState(false);
  const [currentVisa, setCurrentVisa] = useState({
    visaExpiryDate: null as Date | null,
    visaCountry: [] as string[],
    multipleEntry: false,
    applicable: true,
  });
  const [editingVisaIndex, setEditingVisaIndex] = useState<number | null>(null);
  const [countryInput, setCountryInput] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [passportErrors, setPassportErrors] = useState({
    passportNumber: false,
    passportIssueDate: false,
    passportExpiryDate: false,
  });

  const [visaErrors, setVisaErrors] = useState({
    visaExpiryDate: false,
    visaCountry: false,
  });

  const [originalData, setOriginalData] = useState({
    formData: {} as Partial<UserUpdateDetails>,
    passport: {} as typeof passport,
    visas: [] as Array<VisaDetails>
  });

  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData, token }: { id: string; userData: UserUpdateDetails; token: string }) =>
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
      };

      const newPassport = {
        passportNumber: profileData.passport?.passportNumber || '',
        passportIssueDate: profileData.passport?.passportIssueDate ? new Date(profileData.passport.passportIssueDate) : null,
        passportExpiryDate: profileData.passport?.passportExpiryDate ? new Date(profileData.passport.passportExpiryDate) : null,
      };

      const newVisas = profileData.visa.map(visa => ({
        ...visa,
        visaExpiryDate: visa.visaExpiryDate ? new Date(visa.visaExpiryDate) : null,
      })) || [];

      setFormData(newFormData);
      setPassport(newPassport);
      setVisas(newVisas);

      setOriginalData({
        formData: { ...newFormData },
        passport: { ...newPassport },
        visas: [...newVisas]
      });
    }
  }, [profileData]);

  const handlePassportDateChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setPassport(prev => ({ ...prev, [name]: new Date(value) }));
      setPassportErrors(prev => ({ ...prev, [name]: false }));
    } else {
      setPassportErrors(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleVisaDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setCurrentVisa(prev => ({ ...prev, visaExpiryDate: new Date(value) }));
      setVisaErrors(prev => ({ ...prev, visaExpiryDate: false }));
    } else {
      setVisaErrors(prev => ({ ...prev, visaExpiryDate: true }));
    }
  };

  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassport(prev => ({ ...prev, [name]: value }));
    if (value) {
      setPassportErrors(prev => ({ ...prev, [name]: false }));
    } else {
      setPassportErrors(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleVisaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setCurrentVisa(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDeleteCountry = (country: string) => {
    const updatedCountries = currentVisa.visaCountry.filter(c => c !== country);
    setCurrentVisa(prev => ({
      ...prev,
      visaCountry: updatedCountries,
    }));

    setVisaErrors(prev => ({
      ...prev,
      visaCountry: updatedCountries.length === 0
    }));
  };

  const handleOpenVisaDialog = (index?: number) => {
    if (!passport.passportNumber || !passport.passportIssueDate || !passport.passportExpiryDate) {
      setSnackbar({
        open: true,
        message: 'Please complete all passport details before adding visa information',
        severity: 'error',
      });
      return;
    }

    if (index !== undefined) {
      setCurrentVisa({
        ...visas[index],
        visaExpiryDate: visas[index].visaExpiryDate ? new Date(visas[index].visaExpiryDate) : null,
      });
      setEditingVisaIndex(index);
    } else {
      setCurrentVisa({
        visaExpiryDate: null,
        visaCountry: [],
        multipleEntry: false,
        applicable: true,
      });
      setEditingVisaIndex(null);
    }

    setVisaErrors({
      visaExpiryDate: false,
      visaCountry: false,
    });

    setOpenVisaDialog(true);
  };

  const handleCloseVisaDialog = () => {
    setOpenVisaDialog(false);
  };

  const validateVisa = () => {
    const newVisaErrors = {
      visaExpiryDate: !currentVisa.visaExpiryDate,
      visaCountry: currentVisa.visaCountry.length === 0
    };

    setVisaErrors(newVisaErrors);
    return !newVisaErrors.visaExpiryDate && !newVisaErrors.visaCountry;
  };

  const handleSaveVisa = () => {
    if (!validateVisa()) {
      return;
    }

    const newVisa = {
      ...currentVisa,
      visaExpiryDate: currentVisa.visaExpiryDate ? formatDate(currentVisa.visaExpiryDate) : null,
    };

    if (editingVisaIndex !== null) {
      const updatedVisas = [...visas];
      updatedVisas[editingVisaIndex] = {
        ...newVisa,
        visaExpiryDate: newVisa.visaExpiryDate ? new Date(newVisa.visaExpiryDate) : null,
      };
      setVisas(updatedVisas);
    } else {
      setVisas(prev => [...prev, {
        ...newVisa,
        visaExpiryDate: newVisa.visaExpiryDate ? new Date(newVisa.visaExpiryDate) : null,
      }]);
    }

    handleCloseVisaDialog();
  };

  const handleDeleteVisa = (index: number) => {
    setVisas(prev => prev.filter((_, i) => i !== index));
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
      setFormData({ ...originalData.formData });
      setPassport({ ...originalData.passport });
      setVisas([...originalData.visas]);

      setPassportErrors({
        passportNumber: false,
        passportIssueDate: false,
        passportExpiryDate: false,
      });
    } else {
      setOriginalData({
        formData: { ...formData },
        passport: { ...passport },
        visas: [...visas]
      });
    }
    setEditMode(!editMode);
  };

  const validatePassport = () => {
    const newPassportErrors = {
      passportNumber: !passport.passportNumber,
      passportIssueDate: !passport.passportIssueDate,
      passportExpiryDate: !passport.passportExpiryDate
    };

    setPassportErrors(newPassportErrors);

    return !newPassportErrors.passportNumber &&
      !newPassportErrors.passportIssueDate &&
      !newPassportErrors.passportExpiryDate;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isPassportValid = validatePassport();

    if (!isPassportValid) {
      setSnackbar({
        open: true,
        message: 'Please fill all required passport fields',
        severity: 'error',
      });
      return;
    }

    const userData: UserUpdateDetails = {
      ...formData,
      passport: {
        passportNumber: passport.passportNumber,
        passportIssueDate: passport.passportIssueDate ? formatDate(passport.passportIssueDate) : undefined,
        passportExpiryDate: passport.passportExpiryDate ? formatDate(passport.passportExpiryDate) : undefined,
      },
      visa: visas.map(visa => ({
        ...visa,
        visaExpiryDate: visa.visaExpiryDate ?
          (typeof visa.visaExpiryDate === 'string' ? visa.visaExpiryDate : formatDate(visa.visaExpiryDate)) :
          null
      })),
    };

    updateUserMutation.mutate({
      id: profileData.id,
      userData,
      token: authToken,
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: mainBlue }}>
            Travel Information
          </Typography>

          {/* Add edit/save buttons in the same style as Profile.tsx */}
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
                  disabled={updateUserMutation.status === 'pending'}
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
                Edit Details
              </Button>
            )}
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <InfoRow>
              <InfoLabel>
                Current Location:
              </InfoLabel>
              <InfoValue>{profileData.curr_location || 'N/A'}</InfoValue>
            </InfoRow>
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoRow>
              <InfoLabel>
                Total Travelling Days:
              </InfoLabel>
              <InfoValue>{profileData.travelDays || 0}</InfoValue>
            </InfoRow>
          </Grid>
        </Grid>

        {/* Replace the Paper and Card components with the styling used in Profile.tsx */}
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: mainBlue, display: 'flex', alignItems: 'center' }}>
              <FlightIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />
              Passport Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                {editMode ? (
                  <TextField
                    fullWidth
                    label="Passport Number"
                    name="passportNumber"
                    value={passport.passportNumber || ''}
                    onChange={handlePassportChange}
                    required
                    error={passportErrors.passportNumber}
                    helperText={passportErrors.passportNumber ? "Passport number is required" : ""}
                  />
                ) : (
                  <InfoRow>
                    <InfoLabel>
                      Passport Number:
                    </InfoLabel>
                    <InfoValue>{passport.passportNumber || 'Not provided'}</InfoValue>
                  </InfoRow>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {editMode ? (
                  <TextField
                    fullWidth
                    label="Issue Date"
                    name="passportIssueDate"
                    type="date"
                    value={passport.passportIssueDate instanceof Date ? formatDate(passport.passportIssueDate) : ''}
                    onChange={handlePassportDateChange("passportIssueDate")}
                    InputLabelProps={{ shrink: true }}
                    required
                    error={passportErrors.passportIssueDate}
                    helperText={passportErrors.passportIssueDate ? "Issue date is required" : ""}
                  />
                ) : (
                  <InfoRow>
                    <InfoLabel>
                      Issue Date:
                    </InfoLabel>
                    <InfoValue>
                      {passport.passportIssueDate ? formatDateForDisplay(passport.passportIssueDate) : 'Not provided'}
                    </InfoValue>
                  </InfoRow>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {editMode ? (
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    name="passportExpiryDate"
                    type="date"
                    value={passport.passportExpiryDate instanceof Date ? formatDate(passport.passportExpiryDate) : ''}
                    onChange={handlePassportDateChange("passportExpiryDate")}
                    InputLabelProps={{ shrink: true }}
                    required
                    error={passportErrors.passportExpiryDate}
                    helperText={passportErrors.passportExpiryDate ? "Expiry date is required" : ""}
                  />
                ) : (
                  <InfoRow>
                    <InfoLabel>
                      Expiry Date:
                    </InfoLabel>
                    <InfoValue>
                      {passport.passportExpiryDate ? formatDateForDisplay(passport.passportExpiryDate) : 'Not provided'}
                    </InfoValue>
                  </InfoRow>
                )}
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: mainBlue, display: 'flex', alignItems: 'center' }}>
                <FlightIcon sx={{ mr: 1, fontSize: 18, color: mainBlue }} />
                Visa Information
              </Typography>

              {editMode && (
                <Tooltip
                  title={!passport.passportNumber || !passport.passportIssueDate || !passport.passportExpiryDate ?
                    "Complete passport details before adding visa information" : ""}
                >
                  <span> {/* Wrapper needed for disabled buttons */}
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenVisaDialog()}
                      disabled={!passport.passportNumber || !passport.passportIssueDate || !passport.passportExpiryDate}
                    >
                      Add Visa
                    </Button>
                  </span>
                </Tooltip>
              )}
            </Box>

            {visas.length === 0 ? (
              <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
                No visa information available.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {visas.map((visa, index) => (
                  <Grid item xs={12} key={index}>
                    <Box sx={{
                      p: 2,
                      border: `1px solid ${alpha(mainBlue, 0.1)}`,
                      borderRadius: '8px',
                      mb: 1
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <InfoRow>
                              <InfoLabel>Expiry Date:</InfoLabel>
                              <InfoValue>
                                {visa.visaExpiryDate ? formatDateForDisplay(visa.visaExpiryDate) : 'Not provided'}
                              </InfoValue>
                            </InfoRow>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <InfoRow>
                              <InfoLabel>Multiple Entry:</InfoLabel>
                              <InfoValue>{visa.multipleEntry ? 'Yes' : 'No'}</InfoValue>
                            </InfoRow>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <InfoRow>
                              <InfoLabel>Countries:</InfoLabel>
                              <InfoValue>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                  {visa.visaCountry && visa.visaCountry.length > 0 ? (
                                    visa.visaCountry.map((country, i) => (
                                      <Chip key={i} label={country} size="small" />
                                    ))
                                  ) : (
                                    'None specified'
                                  )}
                                </Stack>
                              </InfoValue>
                            </InfoRow>
                          </Grid>
                        </Grid>
                        {editMode && (
                          <Box>
                            <IconButton size="small" onClick={() => handleOpenVisaDialog(index)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteVisa(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </form>

        {/* Visa Dialog */}
        <Dialog open={openVisaDialog} onClose={handleCloseVisaDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingVisaIndex !== null ? 'Edit Visa' : 'Add New Visa'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  name="visaExpiryDate"
                  type="date"
                  value={currentVisa.visaExpiryDate ? formatDate(currentVisa.visaExpiryDate) : ''}
                  onChange={handleVisaDateChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={visaErrors.visaExpiryDate}
                  helperText={visaErrors.visaExpiryDate ? "Expiry date is required" : ""}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={currentVisa.multipleEntry}
                        onChange={handleVisaChange}
                        name="multipleEntry"
                      />
                    }
                    label="Multiple Entry"
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Countries
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Select
                      size="small"
                      label="Add Country"
                      displayEmpty
                      value={countryInput}
                      onChange={(e) => {
                        if (e.target.value) {
                          setCurrentVisa(prev => ({
                            ...prev,
                            visaCountry: [...prev.visaCountry, e.target.value as string],
                          }));
                          setVisaErrors(prev => ({ ...prev, visaCountry: false }));
                          setCountryInput('');
                        }
                      }}
                      sx={{ width: '100%' }}
                      required
                      error={visaErrors.visaCountry}
                    >
                      <MenuItem value="" disabled>
                        Select a country
                      </MenuItem>
                      {country_list.map((country, index) => (
                        <MenuItem key={index} value={country}>{country}</MenuItem>
                      ))}
                    </Select>
                  </Box>
                  {visaErrors.visaCountry && (
                    <Typography variant="caption" color="error">
                      Please select at least one country
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {currentVisa.visaCountry.map((country, index) => (
                      <Chip
                        key={index}
                        label={country}
                        onDelete={() => handleDeleteCountry(country)}
                      />
                    ))}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseVisaDialog}>Cancel</Button>
            <Button
              onClick={handleSaveVisa}
              variant="contained"
              color="primary"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

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

export default UserTravelProfile;