import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  alpha,
  IconButton,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Tooltip,
  Stack,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Avatar,
  Grid,
  TableSortLabel,
  Tabs,
  Tab
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  ViewColumn as ViewColumnIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Person as PersonalIcon,
  Work as EmploymentIcon,
  FlightTakeoff as TravelIcon,
} from '@mui/icons-material';
import { useLocalStorage } from "../hooks/useLocalStorage";
import Layout from "../Components/Layout";
import { useQuery } from "@tanstack/react-query";
import { listUsers, GetListUsersResponse } from "../apis/listUsers";
import { User, Experience, Passport, Visa } from "../data-models/users";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import AddEmployeeModal from "../Components/AddEmployeeModal";
import EntityAuditLogsButton from '../Components/EntityAuditLogsButton';
import { useMutation } from "@tanstack/react-query";
import { updateUser } from '../apis/updateUser';
import { useQueryClient } from "@tanstack/react-query";

interface SortConfig {
  field: 'name' | 'grade' | 'email' | 'alternateEmail' | 'code' | 'access' | 'branch' | 'department' | 'designation' | 'curr_location';
  direction: 'asc' | 'desc';
}

interface FilterState {
  department: string;
  access: string;
  branch: string;
}

interface ColumnVisibility {
  [key: string]: boolean;
}

interface UpdateUserRequest extends Partial<User> {
  id: string;
}

const ROWS_PER_PAGE = 10;
const MAIN_BLUE = '#1a2b4b';

const DEFAULT_COLUMNS: ColumnVisibility = {
  profilePictureURL: true,
  name: true,
  phoneNumber: false,
  alternativePhoneNumber: true,
  grade: true,
  email: false,
  alternateEmail: true,
  code: true,
  access: true,
  branch: true,
  department: true,
  designation: true,
  gender: false,
  birthDate: false,
  joinDate: true,
  experience: true,
  curr_location: true,
  passport: false,
  visa: false,
};

const COLUMNS = [
  { id: 'profilePictureURL', label: 'Profile', sortable: false },
  { id: 'name', label: 'Name', sortable: true },
  { id: 'phoneNumber', label: 'Phone', sortable: false },
  { id: 'alternativePhoneNumber', label: 'Alternative Phone', sortable: false },
  { id: 'grade', label: 'Grade', sortable: true },
  { id: 'email', label: 'Email', sortable: true },
  { id: 'alternateEmail', label: 'Alternative Email', sortable: true },
  { id: 'code', label: 'Code', sortable: true },
  { id: 'access', label: 'Access', sortable: true },
  { id: 'branch', label: 'Branch', sortable: true },
  { id: 'department', label: 'Department', sortable: true },
  { id: 'designation', label: 'Designation', sortable: true },
  { id: 'gender', label: 'Gender', sortable: false },
  { id: 'birthDate', label: 'Birth Date', sortable: false },
  { id: 'joinDate', label: 'Joining Date', sortable: false },
  { id: 'experience', label: 'Experience', sortable: false },
  { id: 'curr_location', label: 'Location', sortable: true },
  { id: 'passport', label: 'Passport', sortable: false },
  { id: 'visa', label: 'Visa', sortable: false }
];

const Employees: React.FC = () => {
  const queryClient = useQueryClient();
  const { storedValue: authToken } = useLocalStorage<string>("token", "");

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [columnAnchorEl, setColumnAnchorEl] = useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState<FilterState>({
    department: "",
    access: "",
    branch: ""
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', direction: 'asc' });
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
  const [value, setValue] = useState(1);

  const togglePersonalColumns = () => {
    setVisibleColumns({
      profilePictureURL: true,
      name: true,
      phoneNumber: true,
      alternativePhoneNumber: true,
      grade: false,
      email: true,
      alternateEmail: true,
      code: true,
      access: false,
      branch: false,
      department: false,
      designation: false,
      gender: true,
      birthDate: true,
      joinDate: false,
      experience: false,
      curr_location: false,
      passport: false,
      visa: false
    });
  };

  const toggleEmploymentColumns = () => {
    setVisibleColumns({
      profilePictureURL: true,
      name: true,
      phoneNumber: false,
      alternativePhoneNumber: false,
      grade: true,
      email: false,
      alternateEmail: false,
      code: true,
      access: true,
      branch: true,
      department: true,
      designation: true,
      gender: false,
      birthDate: false,
      joinDate: true,
      experience: true,
      curr_location: true,
      passport: false,
      visa: false
    });
  };

  const toggleTravelColumns = () => {
    setVisibleColumns({
      profilePictureURL: true,
      name: true,
      phoneNumber: false,
      alternativePhoneNumber: false,
      grade: false,
      email: false,
      alternateEmail: false,
      code: true,
      access: false,
      branch: false,
      department: false,
      designation: false,
      gender: false,
      birthDate: false,
      joinDate: false,
      experience: false,
      curr_location: false,
      passport: true,
      visa: true
    });
  };

  const handleTabChange = (_event: any, newValue: React.SetStateAction<number>) => {
    setValue(newValue);
  };

  const { data: employeeData, isLoading, error } = useQuery<GetListUsersResponse, Error>({
    queryKey: ["getAllUsers"],
    queryFn: () => listUsers(authToken),
    enabled: !!authToken,
    staleTime: 5 * 60 * 1000,
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData: UpdateUserRequest) => updateUser(authToken, userData),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["getAllUsers"], (oldData: GetListUsersResponse | undefined) => {
        if (!oldData?.users) return oldData;

        return {
          ...oldData,
          users: oldData.users.map(user =>
            user.code === updatedUser.code ? updatedUser : user
          )
        };
      });

      setSelectedEmployee(updatedUser);
    },
  });

  const filteredEmployees = useMemo(() => {
    if (!employeeData?.users) return [];

    return employeeData.users.filter(employee => {
      const matchesSearch = !searchTerm ||
        employee.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !filters.department ||
        employee.department === filters.department;
      const matchesBranch = !filters.branch ||
        employee.branch === filters.branch;
      const matchesAccess = !filters.access || (() => {
        if (!employee.access) return false;

        switch (filters.access) {
          case 'Product Admin':
            return employee.access.startsWith('Product Admin');
          case 'Zone Manager':
            return employee.access.startsWith('Zone Manager');
          default:
            return employee.access === filters.access;
        }
      })();

      return matchesSearch &&
        matchesDepartment &&
        matchesAccess &&
        matchesBranch
    });
  }, [employeeData?.users, searchTerm, filters]);

  const sortedEmployees = useMemo(() => {
    if (!sortConfig.field) return filteredEmployees;

    return [...filteredEmployees].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (sortConfig.field === 'code') {
        const aNum = parseFloat(String(aValue).replace(/[^0-9.-]+/g, '')) || 0;
        const bNum = parseFloat(String(bValue).replace(/[^0-9.-]+/g, '')) || 0;
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredEmployees, sortConfig]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (page - 1) * ROWS_PER_PAGE;
    return sortedEmployees.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [sortedEmployees, page]);

  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  }, []);

  const handleSort = useCallback((field: keyof User) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      department: "",
      access: "",
      branch: ""
    });
    setSearchTerm("");
    setPage(1);
  }, []);

  const getUniqueValues = useCallback((field: keyof User): string[] => {
    if (!employeeData?.users) return [];
    return Array.from(new Set(employeeData.users.map(e => e[field])))
      .filter(Boolean) as string[];
  }, [employeeData?.users]);

  const formatDateForDisplay = useCallback((dateString: string | number | Date | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch {
      return "Invalid Date";
    }
  }, []);

  const EmployeeModal: React.FC<{ employee: User; onClose: () => void; onSave: (updatedEmployee: User) => void }> = ({
    employee,
    onClose,
    onSave,
  }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [localEmployee, setLocalEmployee] = useState<User>({ ...employee });
    const [selectedProducts, setSelectedProducts] = useState([]);

    const constructAccessString = (accessType: string, products: any[]) => {
      if (products.length === 0) return accessType;
      return `${accessType} - ${products.join(',')}`;
    };

    useEffect(() => {
      setLocalEmployee({ ...employee });
    }, [employee]);

    const handleInputChange = (field: string, value: string | Date | Experience[] | Passport | Visa[]) => {
      if (field === 'access') {
        if (value === 'Product Admin' || value === 'Product Manager') {
          setSelectedProducts([]);
          setLocalEmployee(prev => ({
            ...prev,
            access: constructAccessString(value, [])
          }));
        } else {
          setSelectedProducts([]);
          setLocalEmployee(prev => ({
            ...prev,
            access: value
          }));
        }
      } else {
        setLocalEmployee(prev => ({ ...prev, [field]: value }));
      }
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
        <FormControl fullWidth size="small" margin="dense">
          <Select
            value={localEmployee.access?.split(' - ')[0] || ''}
            onChange={(e) => handleInputChange('access', e.target.value)}
          >
            {baseAccessValues.map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    };

    const handleSave = () => {
      const baseAccess = localEmployee.access?.split(' - ')[0];
      if (baseAccess === 'Product Admin' || baseAccess === 'Product Manager') {
        const updatedAccess = constructAccessString(baseAccess, selectedProducts);
        onSave({ ...localEmployee, access: updatedAccess });
      } else {
        onSave(localEmployee);
      }
      setIsEditMode(false);
    };


    const handleCancel = () => {
      setLocalEmployee({ ...employee });
      setIsEditMode(false);
    };

    return (
      <Dialog open onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: "center" }}>
          Employee Details
          <Stack
            direction="row"
            spacing={1}
            sx={{ ml: 2, display: "inline-flex", verticalAlign: "middle" }}
          >
            {!isEditMode ? (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => setIsEditMode(true)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <>
                <Tooltip title="Save">
                  <IconButton size="small" onClick={handleSave}>
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel">
                  <IconButton size="small" onClick={handleCancel}>
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(MAIN_BLUE, 0.05)} 0%, ${alpha(MAIN_BLUE, 0.1)} 100%)`,
                }}
              >
                <Stack spacing={2} alignItems="center">
                  <Avatar sx={{ width: 120, height: 120, bgcolor: MAIN_BLUE, fontSize: "2.5rem" }} src={localEmployee.profilePictureURL || ''}>
                    {localEmployee.name?.charAt(0)}
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold">
                    {localEmployee.name}
                  </Typography>
                  {isEditMode ? (
                    <TextField
                      fullWidth
                      label="Designation"
                      value={localEmployee.designation || ''}
                      onChange={(e) => handleInputChange("designation", e.target.value)}
                    />
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      {localEmployee.designation}
                    </Typography>
                  )}
                  <Box sx={{ width: "100%" }}>
                    <Grid container spacing={2}>
                      {[
                        { label: "Grade", key: "grade", type: "text" },
                        { label: "Access", key: "access", type: "access" },
                        { label: "Branch", key: "branch", type: "dropdown" },
                        { label: "Department", key: "department", type: "dropdown" },
                      ].map(({ label, key, type }) => (
                        <Grid item xs={6} key={label}>
                          <Typography variant="caption" color="text.secondary">
                            {label}
                          </Typography>
                          {isEditMode ? (
                            type === "access" ? (
                              <>
                                {renderAccessSelect()}
                              </>
                            ) : type === "dropdown" ? (
                              <FormControl fullWidth size="small" margin="dense">
                                <Select
                                  value={localEmployee[key as keyof User] || ''}
                                  onChange={(e) => handleInputChange(key as keyof User, e.target.value)}
                                >
                                  {getUniqueValues(key as keyof User).map((option) => (
                                    <MenuItem key={option} value={option}>
                                      {option}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            ) : (
                              <TextField
                                fullWidth
                                type="text"
                                value={localEmployee[key as keyof User] || ''}
                                onChange={(e) => handleInputChange(key as keyof User, e.target.value)}
                                size="small"
                                margin="dense"
                              />
                            )
                          ) : (
                            <Typography variant="body2" fontWeight="medium">
                              {localEmployee[key as keyof User] || 'N/A'}
                            </Typography>
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ width: '100%', mt: 3 }}>
                  {loading ? (
                    <Typography>Loading projects...</Typography>
                  ) : error ? (
                    <Typography color="error">{error}</Typography>
                  ) : (
                    <FullCalendar
                      plugins={[dayGridPlugin]}
                      initialView="dayGridMonth"
                      height={400}
                      eventDidMount={(info) => {
                        info.el.setAttribute('title', info.event.title);
                      }}
                    />
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  };


  const FilterPopover = () => {
    const getAccessGroups = (values: string[]): string[] => {
      const groups = new Set<string>();

      values.forEach(value => {
        if (value.startsWith('Product Admin')) {
          groups.add('Product Admin');
        } else if (value.startsWith('Zone Manager')) {
          groups.add('Zone Manager');
        } else {
          groups.add(value);
        }
      });

      return Array.from(groups);
    };

    const renderAccessMenuItems = () => {
      const accessValues = getUniqueValues('access');
      const groups = getAccessGroups(accessValues);

      return [
        <MenuItem value="" key="all">All</MenuItem>,
        ...groups.map(group => (
          <MenuItem value={group} key={group}>
            {group}
          </MenuItem>
        ))
      ];
    };

    return (
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { p: 2, minWidth: 250 }
        }}
      >
        <Stack spacing={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Access</InputLabel>
            <Select
              label="Access"
              value={filters.access || ""}
              onChange={(e) => handleFilterChange('access', e.target.value)}
            >
              {renderAccessMenuItems()}
            </Select>
          </FormControl>

          {[
            {
              key: 'branch',
              label: 'Branch',
              options: getUniqueValues('branch')
            },
            {
              key: 'department',
              label: 'Department',
              options: getUniqueValues('department')
            }
          ].map(({ key, label, options }) => (
            <FormControl key={key} size="small" fullWidth>
              <InputLabel>{label}</InputLabel>
              <Select
                label={label}
                value={filters[key as keyof FilterState]}
                onChange={(e) => handleFilterChange(key as keyof FilterState, e.target.value as string)}
              >
                <MenuItem value="">All</MenuItem>
                {options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Stack>
      </Popover>
    );
  };
  if (!authToken) {
    return (
      <Layout>
        <Alert severity="error">Authentication token is missing. Please log in.</Alert>
      </Layout>
    );
  }

  const renderPassport = (passport: Passport | undefined) => {
    if (!passport) return 'N/A';
    return (
      <Stack spacing={1}>
        <p>Passport Number: {passport.passportNumber}</p>
        <p>Issue Date: {formatDateForDisplay(passport.passportIssueDate)}</p>
        <p>Expiry Date: {formatDateForDisplay(passport.passportExpiryDate)}</p>
      </Stack>
    );
  }

  const renderVisa = (visa: Visa[] | undefined) => {
    if (!visa || visa.length === 0) return 'N/A';
    return (
      <Stack spacing={1}>
        {visa.map((vis, idx) => (
          <Chip
            key={idx}
            size="small"
            label={`${vis.visaCountry[0]} (${vis.multipleEntry ? 'M' : 'S'}) - ${formatDateForDisplay(vis.visaExpiryDate)}`}
            sx={{
              fontSize: '0.75rem',
              backgroundColor: alpha(
                vis.applicable ? '#10b981' : '#dc3545',
                0.1
              ),
              color: vis.applicable ? '#10b981' : '#dc3545',
              border: `1px solid ${alpha(
                vis.applicable ? '#10b981' : '#dc3545',
                0.2
              )}`,
              fontWeight: 500,
            }}
          />
        ))}
      </Stack>
    );
  };

  return (
    <Layout>
      <Box sx={{ display: "flex", gap: 3, p: { xs: 2, sm: 3, md: 4 } }}>
        <Paper elevation={0} sx={{
          flexGrow: 1,
          height: "88vh",
          borderRadius: "20px",
          backgroundColor: '#f8f9fa',
          border: `1px solid ${alpha(MAIN_BLUE, 0.1)}`,
          overflow: "hidden",
        }}>
          <Box sx={{
            p: { xs: 2, sm: 3, md: 4 },
            height: "100%",
            overflow: "auto",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: alpha(MAIN_BLUE, 0.2),
              borderRadius: "3px",
            },
          }}>
            <Box sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
              flexWrap: "wrap",
              gap: 2,
            }}>
              <Typography variant="h4" sx={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                color: MAIN_BLUE,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              }}>
                Employees
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                <EntityAuditLogsButton
                  entityType="User"
                  buttonVariant="outlined"
                  buttonSize="small"
                />
                <AddEmployeeModal authToken={authToken} />
                <TextField
                  placeholder="Search by employee name"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  sx={{
                    width: "250px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      backgroundColor: "white",
                      '& fieldset': { borderColor: alpha(MAIN_BLUE, 0.2) },
                      '&:hover fieldset': { borderColor: MAIN_BLUE },
                    },
                  }}
                  InputProps={{
                    endAdornment: searchTerm && (
                      <IconButton size="small" onClick={() => setSearchTerm("")}>
                        <ClearIcon />
                      </IconButton>
                    ),
                  }}
                />
                <Tooltip title="Filter">
                  <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Column Settings">
                  <IconButton onClick={(e) => setColumnAnchorEl(e.currentTarget)}>
                    <ViewColumnIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            <Box sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
              flexWrap: "wrap",
              gap: 2,
            }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Tabs value={value} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                  <Tab label="Personal Details" icon={<PersonalIcon />} iconPosition="start" onClick={() => togglePersonalColumns()} />
                  <Tab label="Employment Details" icon={<EmploymentIcon />} iconPosition="start" onClick={() => toggleEmploymentColumns()} />
                  <Tab label="Travel Details" icon={<TravelIcon />} iconPosition="start" onClick={() => toggleTravelColumns()} />
                </Tabs>
              </Stack>
            </Box>


            {Object.values(filters).some(Boolean) && (
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(filters).map(([key, value]) => value && (
                  <Chip
                    key={key}
                    label={`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`}
                    onDelete={() => handleFilterChange(key as keyof FilterState, "")}
                    size="small"
                  />
                ))}
                <Chip
                  label="Clear All"
                  onClick={clearFilters}
                  size="small"
                  color="primary"
                />
              </Box>
            )}

            <FilterPopover />

            <Popover
              open={Boolean(columnAnchorEl)}
              anchorEl={columnAnchorEl}
              onClose={() => setColumnAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: { p: 2, maxHeight: 400, overflow: 'auto' }
              }}
            >
              <FormGroup>
                {COLUMNS.map((column) => (
                  <FormControlLabel
                    key={column.id}
                    control={
                      <Checkbox
                        checked={visibleColumns[column.id]}
                        onChange={() => {
                          setVisibleColumns(prev => ({
                            ...prev,
                            [column.id]: !prev[column.id]
                          }));
                        }}
                      />
                    }
                    label={column.label}
                  />
                ))}
              </FormGroup>
            </Popover>

            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress sx={{ color: MAIN_BLUE }} />
              </Box>
            ) : error ? (
              <Alert severity="error">{error.message}</Alert>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {COLUMNS.map((column) =>
                          visibleColumns[column.id] && (
                            <TableCell
                              key={column.id}
                              sortDirection={sortConfig.field === column.id ? sortConfig.direction : false}
                            >
                              {column.sortable ? (
                                <TableSortLabel
                                  active={sortConfig.field === column.id}
                                  direction={sortConfig.field === column.id ? sortConfig.direction : 'asc'}
                                  onClick={() => handleSort(column.id as SortConfig['field'])}
                                >
                                  {column.label}
                                </TableSortLabel>
                              ) : (
                                column.label
                              )}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedEmployees.length > 0 ? (
                        paginatedEmployees.map((employee) => (
                          <TableRow
                            key={employee.code}
                            hover
                            onClick={() => setSelectedEmployee(employee)}
                            sx={{ cursor: 'pointer' }}
                          >
                            {visibleColumns.profilePictureURL && (
                              <TableCell>
                                <Avatar
                                  src={employee.profilePictureURL || undefined}
                                  sx={{ width: 40, height: 40 }}
                                >
                                  {!employee.profilePictureURL && employee.name?.charAt(0)}
                                </Avatar>
                              </TableCell>
                            )}
                            {visibleColumns.name && <TableCell>{employee.name || 'N/A'}</TableCell>}
                            {visibleColumns.phoneNumber && <TableCell>{employee.phoneNumber || 'N/A'}</TableCell>}
                            {visibleColumns.alternativePhoneNumber && <TableCell>{employee.alternativePhoneNumber || 'N/A'}</TableCell>}
                            {visibleColumns.grade && <TableCell>{employee.grade || 'N/A'}</TableCell>}
                            {visibleColumns.email && <TableCell>{employee.email || 'N/A'}</TableCell>}
                            {visibleColumns.alternateEmail && <TableCell>{employee.alternateEmail || 'N/A'}</TableCell>}
                            {visibleColumns.code && <TableCell>{employee.code || 'N/A'}</TableCell>}
                            {visibleColumns.access && <TableCell>{employee.access || 'N/A'}</TableCell>}
                            {visibleColumns.branch && <TableCell>{employee.branch || 'N/A'}</TableCell>}
                            {visibleColumns.department && <TableCell>{employee.department || 'N/A'}</TableCell>}
                            {visibleColumns.designation && <TableCell>{employee.designation || 'N/A'}</TableCell>}
                            {visibleColumns.gender && <TableCell>{employee.gender || 'N/A'}</TableCell>}
                            {visibleColumns.birthDate && <TableCell>{formatDateForDisplay(employee.birthDate)}</TableCell>}
                            {visibleColumns.joinDate && <TableCell>{formatDateForDisplay(employee.joinDate)}</TableCell>}
                            {visibleColumns.experience && <TableCell>{employee.experience.years || 'N/A'}</TableCell>}
                            {visibleColumns.curr_location && <TableCell>{employee.curr_location || 'N/A'}</TableCell>}
                            {visibleColumns.passport && (
                              <TableCell>
                                {renderPassport(employee.passport)}
                              </TableCell>
                            )}
                            {visibleColumns.visa && (
                              <TableCell>
                                {renderVisa(employee.visa)}
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={Object.values(visibleColumns).filter(Boolean).length}
                            sx={{
                              textAlign: "center",
                              color: alpha(MAIN_BLUE, 0.7),
                              py: 4,
                            }}
                          >
                            No Employees Found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {sortedEmployees.length > 0 && (
                  <Box
                    mt={3}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={2}
                  >
                    <Typography variant="body2" color={alpha(MAIN_BLUE, 0.7)}>
                      Showing {((page - 1) * ROWS_PER_PAGE) + 1} to {Math.min(page * ROWS_PER_PAGE, sortedEmployees.length)}{" "}
                      of {sortedEmployees.length} entries
                    </Typography>
                    <Pagination
                      count={Math.ceil(sortedEmployees.length / ROWS_PER_PAGE)}
                      page={page}
                      onChange={handleChangePage}
                      shape="rounded"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          borderRadius: "6px",
                          color: MAIN_BLUE,
                          '&.Mui-selected': {
                            backgroundColor: alpha(MAIN_BLUE, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(MAIN_BLUE, 0.2),
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}

            {selectedEmployee && (
              <EmployeeModal
                employee={selectedEmployee}
                onClose={() => setSelectedEmployee(null)}
                onSave={(updatedEmployee) => updateUserMutation.mutate(updatedEmployee)}
              />

            )}
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Employees;