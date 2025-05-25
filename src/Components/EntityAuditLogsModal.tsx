import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Box,
  Chip,
  Grid,
  TextField,
  Button,
  Pagination,
  CircularProgress,
  MenuItem,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  History as HistoryIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';

import { getAllAuditLogs } from "../apis/getAuditLog";
import { debounce } from 'lodash';

interface AuditLog {
  _id: string;
  metadata: {
    ipAddress: string;
    userAgent: string;
    timestamp: string;
  };
  status: string;
  entity_type: string;
  entity_id: {
    _id: string;
    name?: string;
    device_id?: string;
    [key: string]: any;
  };
  user_id: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  currentState: any;
  createdAt: string;
}

interface EntityAuditLogsModalProps {
  entityType: string;
  open: boolean;
  onClose: () => void;
  authToken: string;
}

const EntityAuditLogsModal: React.FC<EntityAuditLogsModalProps> = ({
  entityType,
  open,
  onClose,
  authToken
}) => {
  const theme = useTheme();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const logsPerPage = 15;

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    entity_id: '',
    user_id: '',
    action: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  const debouncedFetch = useCallback(
    debounce((filters, page) => {
      fetchAuditLogs(filters, page);
    }, 500),
    []
  );

  useEffect(() => {
    if (open) {
      debouncedFetch(filters, page);
    }
  }, [open, page, filters, debouncedFetch]);

  const fetchAuditLogs = async (currentFilters: typeof filters, currentPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAuditLogs(authToken, {
        entity_type: entityType,
        ...currentFilters,
        limit: logsPerPage,
        skip: (currentPage - 1) * logsPerPage
      });

      setAuditLogs(response.auditLogs);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError(`Failed to load ${entityType} audit logs`);
      console.error(`Error fetching ${entityType} audit logs:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));

    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      entity_id: '',
      user_id: '',
      action: '',
      startDate: '',
      endDate: '',
      status: ''
    });
    setPage(1);
  };

  const renderActionChip = (action: string) => {
    const colorMap: Record<string, "success" | "primary" | "error" | "default"> = {
      CREATE: 'success',
      UPDATE: 'primary',
      DELETE: 'error',
      default: 'default'
    };

    const color = colorMap[action] || colorMap.default;

    return (
      <Chip
        label={action}
        color={color}
        size="small"
        sx={{
          fontWeight: 500,
          minWidth: '80px',
          textAlign: 'center'
        }}
      />
    );
  };

  const renderStatusChip = (status: string) => {
    const colorMap: Record<string, "success" | "error" | "warning" | "default"> = {
      SUCCESS: 'success',
      FAILED: 'error',
      PARTIAL: 'warning',
      default: 'default'
    };

    const color = colorMap[status] || colorMap.default;

    return (
      <Chip
        label={status}
        color={color}
        size="small"
        sx={{
          fontWeight: 500,
          minWidth: '80px',
          textAlign: 'center'
        }}
      />
    );
  };

  const renderChangeDetails = (log: AuditLog) => {
    if (!log.changes || log.changes.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          No specific changes recorded
        </Typography>
      );
    }

    return (
      <Box sx={{ maxHeight: '120px', overflowY: 'auto', pr: 1 }}>
        {log.changes.map((change, index) => (
          <Box key={index} sx={{ mb: 0.5 }}>
            <Typography variant="body2" fontWeight={500} component="span">
              {change.field}:
            </Typography>
            <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
              {change.oldValue !== undefined
                ? <>
                  {typeof change.oldValue === 'object' ? JSON.stringify(change.oldValue) : change.oldValue}
                  <span style={{ fontSize: '0.8rem', color: theme.palette.text.secondary }}>→</span>
                  {typeof change.newValue === 'object' ? JSON.stringify(change.newValue) : change.newValue}
                </>
                : (typeof change.newValue === 'object' ? JSON.stringify(change.newValue) : change.newValue)
              }
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).replace(/am/i, 'AM').replace(/pm/i, 'PM');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(2, 3)
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <HistoryIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight={600}>
              {entityType} Audit Logs
            </Typography>
          </Box>
          <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"}>
            <IconButton
              onClick={handleFilterToggle}
              sx={{
                backgroundColor: showFilters ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2)
                }
              }}
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ padding: theme.spacing(3), pb: 4 }}>
        {showFilters && (
          <Box mb={3} p={2} sx={{
            backgroundColor: alpha(theme.palette.background.default, 0.7),
            borderRadius: '6px',
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Grid container spacing={2.5} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Entity ID"
                  name="entity_id"
                  value={filters.entity_id}
                  onChange={handleFilterChange}
                  variant="outlined"
                  size="small"
                  placeholder="Filter by entity ID"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="User ID"
                  name="user_id"
                  value={filters.user_id}
                  onChange={handleFilterChange}
                  variant="outlined"
                  size="small"
                  placeholder="Filter by user ID"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Action"
                  name="action"
                  value={filters.action}
                  onChange={handleFilterChange}
                  variant="outlined"
                  size="small"
                  select
                >
                  <MenuItem value="">All Actions</MenuItem>
                  <MenuItem value="CREATE">Create</MenuItem>
                  <MenuItem value="UPDATE">Update</MenuItem>
                  <MenuItem value="DELETE">Delete</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  variant="outlined"
                  size="small"
                  select
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="SUCCESS">Success</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                  <MenuItem value="PARTIAL">Partial</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={clearFilters}
                    size="small"
                    sx={{
                      borderRadius: '6px',
                      textTransform: 'none',
                      fontWeight: 500,
                      ml: 2
                    }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={6} alignItems="center" height="200px">
            <CircularProgress size={40} thickness={4} />
          </Box>
        ) : error ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            my={4}
            p={3}
            sx={{
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              borderRadius: '8px',
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
            }}
          >
            <Typography color="error" align="center" sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ mr: 1 }} />
              {error}
            </Typography>
          </Box>
        ) : auditLogs.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            my={4}
            p={4}
            sx={{
              backgroundColor: alpha(theme.palette.info.main, 0.05),
              borderRadius: '8px'
            }}
          >
            <Typography color="text.secondary" align="center">
              No audit logs found for the specified criteria
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderRadius: '8px',
                mb: 2
              }}
            >
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                    <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Performed By</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Entity Details</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Changes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.map((log, index) => (
                    <React.Fragment key={log._id}>
                      <TableRow sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02)
                        }
                      }}>
                        <TableCell sx={{ py: 1.5, verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {formatDateTime(log.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, verticalAlign: 'top' }}>
                          {renderActionChip(log.action)}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, verticalAlign: 'top' }}>
                          {renderStatusChip(log.status)}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, verticalAlign: 'top' }}>
                          <Typography variant="body2" fontWeight={500}>
                            {log.user_id?.name || 'Unknown User'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {log.user_id?.email || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, verticalAlign: 'top' }}>
                          <Typography variant="body2" fontWeight={500}>
                            {log.entity_id
                              ? (log.entity_id.name || log.entity_id.device_id || log.entity_id._id)
                              : 'N/A'
                            }
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, verticalAlign: 'top', minWidth: '240px' }}>
                          {renderChangeDetails(log)}
                        </TableCell>
                      </TableRow>
                      {index < auditLogs.length - 1 && (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ p: 0 }}>
                            <Divider />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalCount > 0 && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={3}
                px={1}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing {auditLogs.length} of {totalCount} logs
                </Typography>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  size="medium"
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EntityAuditLogsModal;