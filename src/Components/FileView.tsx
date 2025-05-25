import React from 'react';
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import PreviewIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { alpha } from '@mui/material/styles';

interface FileViewProps {
  urls: string[];
  onDelete?: (deletedUrl: string) => void;
  mainBlue?: string;
}

const s3Client = new S3Client({
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
  region: import.meta.env.VITE_AWS_REGION || '',
});

const FileView: React.FC<FileViewProps> = ({
  urls,
  onDelete,
  mainBlue = '#1a2b4b'
}) => {
  const [snackbarState, setSnackbarState] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleDocumentPreview = (url: string) => {
    window.open(url, '_blank');
  };

  const extractKeyFromUrl = (url: string): string => {
    try {
      const bucketName = import.meta.env.VITE_AWS_BUCKET_NAME;
      const region = import.meta.env.VITE_AWS_REGION;
      const baseUrl = `https://${bucketName}.s3.${region}.amazonaws.com/`;
      return url.replace(baseUrl, '');
    } catch (error) {
      console.error('Error extracting key from URL:', error);
      throw new Error('Invalid S3 URL format');
    }
  };

  const handleDocumentDelete = async (url: string) => {
    try {
      const key = extractKeyFromUrl(url);


      const deleteCommand = new DeleteObjectCommand({
        Bucket: import.meta.env.VITE_AWS_BUCKET_NAME || '',
        Key: key,
      });

      await s3Client.send(deleteCommand);

      onDelete?.(url);

      setSnackbarState({
        open: true,
        message: 'Document deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      setSnackbarState({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to delete document',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarState(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      {urls.map((url, index) => (
        <Box key={index} sx={{ mt: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
              borderRadius: '8px',
              backgroundColor: alpha(mainBlue, 0.05),
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: alpha(mainBlue, 0.8),
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '70%'
              }}
            >
              {decodeURIComponent(url.split('/').pop() || '')}
            </Typography>
            <Box>
              <Tooltip title="Preview Document">
                <IconButton
                  size="small"
                  onClick={() => handleDocumentPreview(url)}
                  sx={{ color: mainBlue, mr: 1 }}
                >
                  <PreviewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove Document">
                <IconButton
                  size="small"
                  onClick={() => handleDocumentDelete(url)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      ))}

      <Snackbar
        open={snackbarState.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarState.severity}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FileView;