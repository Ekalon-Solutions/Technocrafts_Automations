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
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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
      <Button variant="contained" onClick={() => setModalOpen(true)}>
        {buttonText}
      </Button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            width: 400,
            margin: 'auto',
            mt: 10,
            padding: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" gutterBottom>
            {buttonText}
          </Typography>

          <Paper
            sx={{
              mt: 2,
              mb: 2,
              p: 3,
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Box display="flex" flexDirection="column" alignItems="center">
              <CloudUploadIcon sx={{ fontSize: 48, mb: 1, color: 'primary.main' }} />
              <Typography variant="body1" gutterBottom>
                Drag and drop files here
              </Typography>
              <Typography variant="body2" color="textSecondary">
                or click to select files
              </Typography>
              {acceptedFileTypes && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                  Accepted files:  pdf, word, xml, excel, csv, text, markdown, video/mp4, video/quicktime, image/heic, image/jpeg, image/png, audio/mpeg, audio/wav,
                </Typography>
              )}
            </Box>
            <input
              type="file"
              hidden
              multiple={multiple}
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={acceptedFileTypes.join(',')}
            />
          </Paper>

          {state.isUploading && (
            <Box mt={2}>
              <LinearProgress variant="determinate" value={state.progress} />
              <Typography mt={1}>{state.progress}%</Typography>
            </Box>
          )}

          {state.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {state.error}
            </Alert>
          )}
        </Box>
      </Modal>

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage(null)}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarMessage(null)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FileUpload;