import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  IconButton,
  InputAdornment,
  Modal,
  Fade
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useLocalStorage } from "../hooks/useLocalStorage";
import { changePassword } from '../apis/changePassword';

const PasswordChange = () => {
  const [open, setOpen] = useState(false);
  const { storedValue: authToken } = useLocalStorage("token", "");
  const { storedValue: user } = useLocalStorage("user", "");

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const [errors, setErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    error: false,
    message: ''
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setSubmitStatus({
      success: false,
      error: false,
      message: ''
    });
  };

  const handleClickShowPassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = (password) => {
    const validations = {
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      length: password.length >= 8
    };

    const failedChecks = [];
    if (!validations.uppercase) failedChecks.push('one uppercase letter');
    if (!validations.lowercase) failedChecks.push('one lowercase letter');
    if (!validations.number) failedChecks.push('one number');
    if (!validations.length) failedChecks.push('minimum 8 characters');

    return {
      isValid: Object.values(validations).every(v => v),
      failedChecks
    };
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));

    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));

    if (field === 'newPassword') {
      const { isValid, failedChecks } = validatePassword(value);
      if (!isValid) {
        setErrors(prev => ({
          ...prev,
          newPassword: `Password must contain ${failedChecks.join(', ')}`
        }));
      }
    }

    if (field === 'confirmPassword') {
      if (value !== passwordData.newPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ success: false, error: false, message: '' });

    let hasErrors = false;
    const newErrors = { ...errors };

    if (!passwordData.oldPassword) {
      newErrors.oldPassword = 'Old password is required';
      hasErrors = true;
    }

    const { isValid, failedChecks } = validatePassword(passwordData.newPassword);
    if (!isValid) {
      newErrors.newPassword = `Password must contain ${failedChecks.join(', ')}`;
      hasErrors = true;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    try {
      const userId = user?.id;

      const response = await changePassword(
        {
          userId,
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        authToken
      );

      setSubmitStatus({
        success: true,
        error: false,
        message: response.message || 'Password changed successfully!',
      });

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      setSubmitStatus({
        success: false,
        error: true,
        message: error.message || 'Failed to change password. Please try again.',
      });
    }
  };

  const black = '#000000';

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<KeyIcon />}
        onClick={handleOpen}
        sx={{
          color: black,
          borderColor: black,
          '&:hover': {
            borderColor: alpha(black, 0.9),
            backgroundColor: alpha(black, 0.1),
          },
        }}
      >
        Change Password
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Fade in={open}>
          <Box sx={{ width: '100%', maxWidth: '500px', outline: 'none' }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "12px",
                backgroundColor: 'white',
                boxShadow: `0 4px 6px ${alpha(black, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                <LockIcon sx={{ mr: 1, color: black }} />
                <Typography variant="h6" sx={{ color: black }}>
                  Change Password
                </Typography>
              </Box>

              {(submitStatus.success || submitStatus.error) && (
                <Alert
                  severity={submitStatus.success ? "success" : "error"}
                  sx={{ mb: 3 }}
                >
                  {submitStatus.message}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    type={showPassword.oldPassword ? 'text' : 'password'}
                    label="Old Password"
                    value={passwordData.oldPassword}
                    onChange={handleInputChange('oldPassword')}
                    error={!!errors.oldPassword}
                    helperText={errors.oldPassword}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleClickShowPassword('oldPassword')}
                            edge="end"
                          >
                            {showPassword.oldPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    type={showPassword.newPassword ? 'text' : 'password'}
                    label="New Password"
                    value={passwordData.newPassword}
                    onChange={handleInputChange('newPassword')}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleClickShowPassword('newPassword')}
                            edge="end"
                          >
                            {showPassword.newPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    type={showPassword.confirmPassword ? 'text' : 'password'}
                    label="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleClickShowPassword('confirmPassword')}
                            edge="end"
                          >
                            {showPassword.confirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                      onClick={handleClose}
                      variant="outlined"
                      fullWidth
                      sx={{
                        color: black,
                        borderColor: black,
                        '&:hover': {
                          borderColor: alpha(black, 0.9),
                          backgroundColor: alpha(black, 0.1),
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: black,
                        '&:hover': {
                          backgroundColor: alpha(black, 0.9),
                        },
                      }}
                    >
                      Change Password
                    </Button>
                  </Box>
                </Box>
              </form>
            </Paper>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default PasswordChange;