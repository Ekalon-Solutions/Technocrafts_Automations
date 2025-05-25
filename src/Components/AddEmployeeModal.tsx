import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  IconButton,
  Stack,
  Typography,
  alpha,
  Chip,
  Box,
  FormHelperText,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, Refresh as RefreshIcon, Flight as FlightIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { createUser } from '../apis/addUser';
import LocationSearchBar from './LocationSearchBar';
import { User } from '../data-models/users';

const MAIN_BLUE = '#1a2b4b';

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

interface VisaDetails {
  visaExpiryDate: string;
  visaCountry: string[];
  multipleEntry: boolean;
  applicable: boolean;
}

const AddEmployeeModal = ({ authToken }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<User>({
    code: '',
    name: '',
    grade: '',
    branch: '',
    department: '',
    designation: '',
    access: '',
    gender: 'Male',
    email: '',
    password: generateRandomPassword(),
    joinDate: undefined,
    birthDate: undefined,
    phoneNumber: '',
    alternativePhoneNumber: '',
    alternateEmail: '',
    curr_location: '',
    passport: {
      passportNumber: '',
      passportIssueDate: '',
      passportExpiryDate: ''
    },
    visa: []
  });

  const [openVisaDialog, setOpenVisaDialog] = useState(false);
  const [currentVisa, setCurrentVisa] = useState<VisaDetails>({
    visaExpiryDate: '',
    visaCountry: [],
    multipleEntry: false,
    applicable: true,
  });
  const [editingVisaIndex, setEditingVisaIndex] = useState<number | null>(null);
  const [countryInput, setCountryInput] = useState('');
  const [visaFormErrors, setVisaFormErrors] = useState<Record<string, string>>({});

  const branchOptions = ["North", "South", "East", "West", "Central", "Head Office"];
  const departmentOptions = ["Logistics", "Technical Services", "Marketing"];

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

  const handleInputChange = (field: keyof User, value: any) => {
    if (field === 'access') {
      setFormData(prev => ({
        ...prev,
        access: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePassportChange = (field: keyof typeof formData.passport, value: string) => {
    setFormData(prev => ({
      ...prev,
      passport: {
        ...prev.passport,
        [field]: value
      }
    }));

    if (formErrors['passport']) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors['passport'];
        return newErrors;
      });
    }
  };

  const isPassportValid = () => {
    const passport = formData.passport;
    if (!passport) return true;

    const hasAnyPassportInfo = passport.passportNumber || passport.passportIssueDate || passport.passportExpiryDate;
    const hasAllPassportInfo = passport.passportNumber && passport.passportIssueDate && passport.passportExpiryDate;

    return !hasAnyPassportInfo || hasAllPassportInfo;
  };

  const hasPassportInfo = () => {
    const passport = formData.passport;
    return passport && passport.passportNumber && passport.passportIssueDate && passport.passportExpiryDate;
  };

  const validateVisaForm = () => {
    const errors: Record<string, string> = {};

    if (!hasPassportInfo()) {
      errors['passport'] = 'Complete passport information is required before adding visa details';
      return errors;
    }

    if (!currentVisa.visaExpiryDate) {
      errors['visaExpiryDate'] = 'Visa expiry date is required';
    }

    if (!currentVisa.visaCountry || currentVisa.visaCountry.length === 0) {
      errors['visaCountry'] = 'At least one country must be selected';
    }

    return errors;
  };

  const handleOpenVisaDialog = (index?: number) => {
    if (!hasPassportInfo()) {
      setFormErrors(prev => ({
        ...prev,
        passport: 'Complete passport information is required before adding visa details'
      }));
      return;
    }

    if (index !== undefined && formData.visa) {
      setCurrentVisa({
        ...formData.visa[index]
      });
      setEditingVisaIndex(index);
    } else {
      setCurrentVisa({
        visaExpiryDate: '',
        visaCountry: [],
        multipleEntry: false,
        applicable: true,
      });
      setEditingVisaIndex(null);
    }
    setVisaFormErrors({});
    setOpenVisaDialog(true);
  };

  const handleCloseVisaDialog = () => {
    setOpenVisaDialog(false);
    setVisaFormErrors({});
  };

  const handleVisaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setCurrentVisa(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (visaFormErrors[name]) {
      setVisaFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDeleteCountry = (country: string) => {
    setCurrentVisa(prev => ({
      ...prev,
      visaCountry: prev.visaCountry.filter(c => c !== country),
    }));
  };

  const handleSaveVisa = () => {
    const errors = validateVisaForm();
    if (Object.keys(errors).length > 0) {
      setVisaFormErrors(errors);
      return;
    }

    const newVisa = { ...currentVisa };

    if (editingVisaIndex !== null && formData.visa) {
      const updatedVisas = [...formData.visa];
      updatedVisas[editingVisaIndex] = newVisa;
      setFormData(prev => ({
        ...prev,
        visa: updatedVisas
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        visa: [...(prev.visa || []), newVisa]
      }));
    }

    handleCloseVisaDialog();
  };

  const handleDeleteVisa = (index: number) => {
    if (formData.visa) {
      setFormData(prev => ({
        ...prev,
        visa: prev.visa.filter((_, i) => i !== index)
      }));
    }
  };

  const regeneratePassword = () => {
    setFormData(prev => ({
      ...prev,
      password: generateRandomPassword()
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    const requiredFields: Array<keyof User> = ['code', 'name', 'branch', 'department', 'designation', 'access', 'email', 'curr_location'];

    requiredFields.forEach(field => {
      if (!formData[field] && field !== 'curr_location') {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
      else if (field === 'curr_location' && !formData.curr_location) {
        errors['curr_location'] = 'Current location is required';
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors['email'] = 'Invalid email format';
    }

    if (formData.email === formData.alternateEmail) {
      errors['alternateEmail'] = 'Alternate email cannot be the same as primary email';
    }

    if (!isPassportValid()) {
      errors['passport'] = 'If any passport field is filled, all passport fields must be filled';
    }

    return errors;
  };

  const handleSubmit = async () => {
    try {
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setLoading(true);
      setError('');

      const result = await createUser(authToken, formData);

      setOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      grade: '',
      branch: '',
      department: '',
      designation: '',
      access: '',
      gender: 'Male',
      email: '',
      password: generateRandomPassword(),
      joinDate: undefined,
      birthDate: undefined,
      phoneNumber: '',
      alternativePhoneNumber: '',
      alternateEmail: '',
      curr_location: '',
      passport: {
        passportNumber: '',
        passportIssueDate: '',
        passportExpiryDate: ''
      },
      visa: []
    });
    setFormErrors({});
  };

  const renderAccessSelect = () => {
    const baseAccessValues = [
      "Admin",
      "Employee",
      "HO Manager",
      "Product Admin",
      "Product Manager",
      "Marketing Admin",
      "Marketing Incharge",
      "HR Admin",
      "Site Incharge",
      "Zone Manager - Central",
      "Zone Manager - East",
      "Zone Manager - North",
      "Zone Manager - South",
      "Zone Manager - West",
      "Zone Manager - International",
      "Revoked",
    ];

    return (
      <FormControl fullWidth size="small" error={!!formErrors['access']}>
        <InputLabel>Access *</InputLabel>
        <Select
          label="Access"
          value={formData.access}
          onChange={(e) => handleInputChange('access', e.target.value)}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300
              },
            },
          }}
          required
        >
          {baseAccessValues.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </Select>
        {formErrors['access'] && <FormHelperText>{formErrors['access']}</FormHelperText>}
      </FormControl>
    );
  };

  const renderPassportFields = () => (
    <>
      <Grid item xs={12} sx={{ mt: 1 }}>
        <Typography variant="subtitle1" fontWeight="600" color="text.primary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
          <FlightIcon sx={{ mr: 1, fontSize: 18 }} />
          Passport Information
          {formErrors['passport'] && (
            <Typography component="span" color="error" variant="caption" sx={{ ml: 2 }}>
              {formErrors['passport']}
            </Typography>
          )}
        </Typography>
      </Grid>

      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          size="small"
          label="Passport Number"
          value={formData.passport?.passportNumber || ''}
          onChange={(e) => handlePassportChange('passportNumber', e.target.value)}
          error={!!formErrors['passport']}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          size="small"
          type="date"
          label="Passport Issue Date"
          InputLabelProps={{ shrink: true }}
          value={formData.passport?.passportIssueDate || ''}
          onChange={(e) => handlePassportChange('passportIssueDate', e.target.value)}
          error={!!formErrors['passport']}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          size="small"
          type="date"
          label="Passport Expiry Date"
          InputLabelProps={{ shrink: true }}
          value={formData.passport?.passportExpiryDate || ''}
          onChange={(e) => handlePassportChange('passportExpiryDate', e.target.value)}
          error={!!formErrors['passport']}
        />
      </Grid>
    </>
  );

  const renderVisaSection = () => (
    <>
      <Grid item xs={12} sx={{ mt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="600" color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <FlightIcon sx={{ mr: 1, fontSize: 18 }} />
            Visa Information
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleOpenVisaDialog()}
            sx={{
              bgcolor: MAIN_BLUE,
              '&:hover': {
                bgcolor: alpha(MAIN_BLUE, 0.9)
              }
            }}
          >
            Add Visa
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12}>
        {formData.visa && formData.visa.length > 0 ? (
          <Box sx={{ mb: 2 }}>
            {formData.visa.map((visa, index) => (
              <Box key={index} sx={{
                p: 2,
                mb: 2,
                border: `1px solid ${alpha(MAIN_BLUE, 0.1)}`,
                borderRadius: '8px'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" fontWeight="600" color="text.secondary">
                        Expiry Date:
                      </Typography>
                      <Typography variant="body2">
                        {visa.visaExpiryDate || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" fontWeight="600" color="text.secondary">
                        Multiple Entry:
                      </Typography>
                      <Typography variant="body2">
                        {visa.multipleEntry ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" fontWeight="600" color="text.secondary">
                        Countries:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {visa.visaCountry && visa.visaCountry.length > 0 ? (
                          visa.visaCountry.map((country, i) => (
                            <Chip key={i} label={country} size="small" />
                          ))
                        ) : (
                          <Typography variant="body2">None specified</Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteVisa(index)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
            No visa information added yet
          </Typography>
        )}
      </Grid>
    </>
  );

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => {
          resetForm();
          setOpen(true);
        }}
        sx={{
          bgcolor: MAIN_BLUE,
          borderRadius: '10px',
          textTransform: 'none',
          padding: '8px 16px',
          '&:hover': {
            bgcolor: alpha(MAIN_BLUE, 0.9)
          }
        }}
      >
        Add Employee
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflowY: 'auto'
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: `1px solid ${alpha(MAIN_BLUE, 0.1)}`
        }}>
          <Typography variant="h6" fontWeight="bold">Add New Employee</Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {error && <Alert severity="error" sx={{ mt: 1, mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
              {/* Personal Information Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                  Personal Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Employee Code"
                  required
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  error={!!formErrors['code']}
                  helperText={formErrors['code']}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Full Name"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={!!formErrors['name']}
                  helperText={formErrors['name']}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.gender}
                    label="Gender"
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  label="Birth Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.birthDate || ''}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocationSearchBar
                  label="Current Location *"
                  value={formData.curr_location || ''}
                  onChange={(value) => handleInputChange('curr_location', value)}
                  error={!!formErrors['curr_location']}
                  helperText={formErrors['curr_location']}
                />
              </Grid>

              {/* Employment Information Section */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle1" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                  Employment Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Grade"
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" error={!!formErrors['branch']}>
                  <InputLabel>Branch *</InputLabel>
                  <Select
                    label="Branch"
                    value={formData.branch}
                    onChange={(e) => handleInputChange('branch', e.target.value)}
                    required
                  >
                    {branchOptions.map((branch) => (
                      <MenuItem key={branch} value={branch}>
                        {branch}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors['branch'] && <FormHelperText>{formErrors['branch']}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" error={!!formErrors['department']}>
                  <InputLabel>Department *</InputLabel>
                  <Select
                    label="Department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    required
                  >
                    {departmentOptions.map((department) => (
                      <MenuItem key={department} value={department}>
                        {department}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors['department'] && <FormHelperText>{formErrors['department']}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Designation"
                  required
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  error={!!formErrors['designation']}
                  helperText={formErrors['designation']}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  label="Joining Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.joinDate || ''}
                  onChange={(e) => handleInputChange('joinDate', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                {renderAccessSelect()}
              </Grid>

              {/* Contact Information Section */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle1" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                  Contact Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!formErrors['email']}
                  helperText={formErrors['email']}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Alternate Email"
                  type="email"
                  value={formData.alternateEmail || ''}
                  onChange={(e) => handleInputChange('alternateEmail', e.target.value)}
                  error={!!formErrors['alternateEmail']}
                  helperText={formErrors['alternateEmail']}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Phone Number"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Alternative Phone Number"
                  value={formData.alternativePhoneNumber || ''}
                  onChange={(e) => handleInputChange('alternativePhoneNumber', e.target.value)}
                />
              </Grid>

              {/* Travel Information Section */}
              {renderPassportFields()}
              {renderVisaSection()}

              {/* Account Information Section */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle1" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                  Account Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Password (Auto-generated)"
                    type="text"
                    value={formData.password}
                    InputProps={{
                      readOnly: true,
                      sx: { fontFamily: 'monospace' }
                    }}
                  />
                  <IconButton
                    onClick={regeneratePassword}
                    sx={{ ml: 1, color: MAIN_BLUE }}
                    title="Generate new password"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Box>
                <FormHelperText>
                  This randomly generated password will be assigned to the user
                </FormHelperText>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(MAIN_BLUE, 0.1)}` }}>
          <Button
            onClick={() => setOpen(false)}
            sx={{
              color: MAIN_BLUE,
              fontWeight: 500,
              '&:hover': {
                bgcolor: alpha(MAIN_BLUE, 0.1)
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              bgcolor: MAIN_BLUE,
              fontWeight: 500,
              px: 3,
              '&:hover': {
                bgcolor: alpha(MAIN_BLUE, 0.9)
              }
            }}
          >
            {loading ? 'Adding...' : 'Add Employee'}
          </Button>
        </DialogActions>
      </Dialog>

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
                value={currentVisa.visaExpiryDate || ''}
                onChange={handleVisaChange}
                InputLabelProps={{ shrink: true }}
                required
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
                      required
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
                        setCountryInput('');
                      }
                    }}
                    sx={{ width: '100%' }}
                    required
                  >
                    <MenuItem value="" disabled>
                      Select a country
                    </MenuItem>
                    {country_list.map((country, index) => (
                      <MenuItem key={index} value={country}>{country}</MenuItem>
                    ))}
                  </Select>
                </Box>
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
    </>
  );
};

export default AddEmployeeModal;