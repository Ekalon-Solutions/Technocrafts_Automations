import React, { useCallback, useState, useRef } from 'react';
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import {
  Box,
  Button,
  LinearProgress,
  Modal,
  Snackbar,
  Typography,
  Alert,
  Paper,
  Backdrop,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

export interface UploadResponse {
  success: boolean;
  url: string | null;
  key: string | null;
  error: string | null;
}

interface FileUploadProps {
  onUploadSuccess?: (response: UploadResponse | UploadResponse[]) => void;
  onUploadError?: (error: string) => void;
  onUploadProgress?: (progress: number) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
  profilePicture?: boolean;
  buttonText: string;
  isTask?: boolean;
  projectId?: string;
  isProject?: boolean;
}

interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
  color: 'white',
  fontWeight: 600,
  fontSize: '0.95rem',
  padding: '12px 24px',
  borderRadius: '12px',
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
  border: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const StyledModal = styled(Modal)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ModalContent = styled(motion.div)(({ theme }) => ({
  width: '90%',
  maxWidth: '480px',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  borderRadius: '20px',
  padding: '32px',
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
  outline: 'none',
  border: '1px solid rgba(220, 38, 38, 0.1)',
}));

const DropZone = styled(Paper)(({ theme, isDragActive }: { isDragActive: boolean }) => ({
  padding: '32px 24px',
  border: `2px dashed ${isDragActive ? '#dc2626' : '#e5e7eb'}`,
  borderRadius: '16px',
  background: isDragActive 
    ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(185, 28, 28, 0.02) 100%)'
    : 'linear-gradient(145deg, #fafafa 0%, #f5f5f5 100%)',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    borderColor: '#dc2626',
    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.03) 0%, rgba(185, 28, 28, 0.01) 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(220, 38, 38, 0.1)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.1), transparent)',
    transition: 'left 0.6s',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const StyledLinearProgress = styled(LinearProgress)({
  height: '8px',
  borderRadius: '4px',
  backgroundColor: '#f3f4f6',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
    borderRadius: '4px',
  },
});

const s3Client = new S3Client({
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
  region: import.meta.env.VITE_AWS_REGION || '',
});

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  onUploadProgress,
  acceptedFileTypes = ['image/*', 'application/pdf'],
  maxFileSize = 215 * 1024 * 1024,
  multiple = false,
  children,
  profilePicture = false,
  buttonText = 'Upload File',
  isTask = false,
  projectId,
  isProject = false,
}) => {
  const [state, setState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isDragActive, setIsDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = localStorage.getItem('user');
  const employeeName = user ? JSON.parse(user).name : '';

  const validateFile = (file: File): string | null => {
    if (!acceptedFileTypes.some((type) => new RegExp(type.replace('*', '.*')).test(file.type))) {
      return 'File type not supported';
    }

    if (file.size > maxFileSize) {
      return `File size should be less than ${maxFileSize / (1024 * 1024)}MB`;
    }

    return null;
  };

  const uploadToS3 = async (file: File): Promise<UploadResponse> => {
    try {
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
      const fileExtension = sanitizedFileName.split('.').pop();
      const baseFileName = sanitizedFileName.replace(`.${fileExtension}`, '');

      let directory = '';
      if (isTask && projectId) {
        directory = `Projects/${projectId}/tasks/`;
      } else if (isProject && projectId) {
        directory = `Projects/${projectId}/Documents/`;
      } else if (profilePicture) {
        directory = 'Profile Pictures/';
      }
      const fileName = `${directory}${timestamp}-${baseFileName}-${employeeName}.${fileExtension}`;

      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: import.meta.env.VITE_AWS_BUCKET_NAME || '',
          Key: fileName,
          Body: file,
          ContentType: file.type,
        },
      });

      upload.on('httpUploadProgress', (progress) => {
        const percentage = Math.round((progress.loaded / progress.total) * 100);
        setState((prev) => ({ ...prev, progress: percentage }));
        onUploadProgress?.(percentage);
      });

      const result = await upload.done();

      return {
        success: true,
        url: `https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${fileName}`,
        key: fileName,
        error: null
      };
    } catch (error) {
      return { success: false, url: null, key: null, error: 'Upload failed' };
    }
  };

  const handleUpload = async (files: FileList | File[]) => {
    setState((prev) => ({ ...prev, isUploading: true, error: null }));

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const validationError = validateFile(file);
        if (validationError) throw new Error(validationError);

        return await uploadToS3(file);
      });

      const responses = await Promise.all(uploadPromises);
      const successfulUploads = responses.filter((res) => res.success);

      if (successfulUploads.length > 0) {
        onUploadSuccess?.(multiple ? successfulUploads : successfulUploads[0]);
        setSnackbarMessage('Upload successful!');
        setSnackbarSeverity('success');
        setModalOpen(false);
      }

      setState((prev) => ({ ...prev, isUploading: false, progress: 0 }));
    } catch (error) {
      setState((prev) => ({ ...prev, isUploading: false, error: error.message }));
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
      onUploadError?.(error.message);
    } finally {
      setModalOpen(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) handleUpload(files);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (!multiple && files.length > 1) {
        setSnackbarMessage('Please upload only one file');
        setSnackbarSeverity('error');
        return;
      }
      handleUpload(files);
    }
  }, [multiple]);

  return (
    <>
      <StyledButton
        component={motion.button}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setModalOpen(true)}
      >
        {buttonText}
      </StyledButton>

      <AnimatePresence>
        {modalOpen && (
          <StyledModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
              sx: { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
            }}
          >
            <ModalContent
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <Typography 
                variant="h5" 
                sx={{
                  fontWeight: 700,
                  color: '#1f2937',
                  textAlign: 'center',
                  mb: 3,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {buttonText}
              </Typography>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <DropZone
                  isDragActive={isDragActive}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  component={motion.div}
                  whileHover={{ scale: 1.01 }}
                >
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <motion.div
                      animate={{ 
                        scale: isDragActive ? 1.1 : 1,
                        rotate: isDragActive ? 5 : 0 
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <CloudUploadIcon 
                        sx={{ 
                          fontSize: 56, 
                          mb: 2, 
                          color: isDragActive ? '#dc2626' : '#6b7280',
                          transition: 'color 0.3s ease'
                        }} 
                      />
                    </motion.div>
                    <Typography 
                      variant="h6" 
                      sx={{
                        fontWeight: 600,
                        color: '#1f2937',
                        mb: 1,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {isDragActive ? 'Drop files here' : 'Drag and drop files here'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: '#6b7280',
                        mb: 2,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      or click to select files
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{
                        color: '#9ca3af',
                        textAlign: 'center',
                        lineHeight: 1.4,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Accepted files: PDF, Word, XML, Excel, CSV, Text, Markdown, Video (MP4, QuickTime), Images (HEIC, JPEG, PNG), Audio (MP3, WAV)
                    </Typography>
                  </Box>
                  <input
                    type="file"
                    hidden
                    multiple={multiple}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={acceptedFileTypes.join(',')}
                  />
                </DropZone>
              </motion.div>

              <AnimatePresence>
                {state.isUploading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box mt={3}>
                      <StyledLinearProgress 
                        variant="determinate" 
                        value={state.progress}
                        component={motion.div}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        style={{ originX: 0 }}
                      />
                      <Typography 
                        sx={{ 
                          mt: 1, 
                          textAlign: 'center',
                          fontWeight: 600,
                          color: '#dc2626',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {state.progress}%
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {state.error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mt: 2,
                        borderRadius: '12px',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {state.error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </ModalContent>
          </StyledModal>
        )}
      </AnimatePresence>

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbarSeverity} 
          onClose={() => setSnackbarMessage(null)}
          sx={{
            borderRadius: '12px',
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FileUpload;