import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  InputAdornment,
  alpha,
  Alert,
  CircularProgress
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/logo1.png";
import { verifyResetToken, resetPassword } from "../apis/resetPassword";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  const mainBlue = '#1a2b4b';

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlToken = queryParams.get("token");
    const urlEmail = queryParams.get("email");

    if (urlToken && urlEmail) {
      setToken(urlToken);
      setEmail(urlEmail);
      
      verifyToken(urlToken, urlEmail);
    } else {
      setError("Invalid password reset link. Please request a new one.");
      setTokenValid(false);
      setIsVerifying(false);
    }
  }, [location]);

  const verifyToken = async (token: string, email: string) => {
    try {
      await verifyResetToken({ token, email });
      setTokenValid(true);
    } catch (error) {
      setError((error as Error).message || "Invalid or expired token. Please request a new password reset.");
      setTokenValid(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        token,
        email,
        newPassword: password
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setError((error as Error).message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        p: { xs: 2, sm: 4, md: 6 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '500px',
          borderRadius: '20px',
          overflow: 'hidden',
          border: `1px solid ${alpha(mainBlue, 0.1)}`,
          p: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4,
            '& img': {
              maxWidth: '200px',
              height: 'auto',
            },
          }}
        >
          <a href="https://technocrafts.net/" target="_blank" rel="noreferrer">
            <img src={logo} alt="Logo" />
          </a>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            color: mainBlue,
            mb: 2,
            textAlign: 'center',
          }}
        >
          Reset Password
        </Typography>

        {tokenValid === false && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || "Invalid or expired reset link. Please request a new one."}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your password has been successfully reset. You will be redirected to the login page.
          </Alert>
        )}

        {tokenValid && !success && (
          <form onSubmit={handlePasswordReset}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  '& fieldset': {
                    borderColor: alpha(mainBlue, 0.2),
                  },
                  '&:hover fieldset': {
                    borderColor: mainBlue,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: alpha(mainBlue, 0.7),
                },
              }}
            />
            
            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleConfirmPasswordVisibility} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  '& fieldset': {
                    borderColor: alpha(mainBlue, 0.2),
                  },
                  '&:hover fieldset': {
                    borderColor: mainBlue,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: alpha(mainBlue, 0.7),
                },
              }}
            />
            
            <Button
              variant="contained"
              fullWidth
              type="submit"
              disabled={isSubmitting}
              sx={{
                py: 1.5,
                borderRadius: '10px',
                backgroundColor: mainBlue,
                textTransform: 'none',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: alpha(mainBlue, 0.9),
                },
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Resetting...
                </Box>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        )}
        
        {isVerifying && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', my: 4 }}>
            <CircularProgress size={30} sx={{ color: mainBlue, mb: 2 }} />
            <Typography textAlign="center" color={alpha(mainBlue, 0.7)}>
              Verifying reset link...
            </Typography>
          </Box>
        )}
        
        {tokenValid === false && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              onClick={() => navigate('/login')}
              sx={{
                color: mainBlue,
                textTransform: 'none',
              }}
            >
              Back to Login
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword;