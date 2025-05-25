import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert } from '@mui/material';
import SearchableDropdown, { Option } from './searchableDropdown';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { listUsers, GetListUsersResponse } from '../apis/listUsers';
import { User } from '../data-models/users';
import { useLocation } from 'react-router-dom';
import { getProjectById, GetProjectByIdResponse } from '../apis/getProjectbyId';
import { fetchUsersByProjectIds } from '../apis/getProjectUsers';

interface UserDropdownProps {
  value: Option<User> | null;
  onChange: (value: Option<User> | null) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  filterFn?: (users: User[]) => User[];
  enableProjectFilter?: boolean;
  projectId?: string;
  currentUser?: User;
  taskType?: string;
  label?: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  value,
  onChange,
  disabled = false,
  error,
  placeholder,
  filterFn,
  enableProjectFilter = true,
  projectId,
  currentUser,
  taskType,
  label = "Select User",
}) => {
  const { storedValue: authToken } = useLocalStorage<string>('token', '');
  const location = useLocation();
  const [projectDetails, setProjectDetails] = useState<GetProjectByIdResponse['project'] | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);


  const projectUsersQuery = useQuery({
    queryKey: ['projectUsers', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const response = await fetchUsersByProjectIds([projectId], authToken);
      return response;
    },
    enabled: !!projectId && !!authToken,
  });


  const allUsersQuery = useQuery<GetListUsersResponse, Error>({
    queryKey: ['users'],
    queryFn: async () => {
      const resp = await listUsers(authToken);
      return resp;
    },
    enabled: !projectId,
  });

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const state = location.state as { project?: string };
        if (state?.project) {
          const response = await getProjectById({ id: state.project }, authToken);
          setProjectDetails(response.project);
        }
      } catch (error: any) {
        setProjectError(error.message || 'Failed to fetch project details.');
      }
    };

    if (enableProjectFilter && !projectId) {
      fetchProjectDetails();
    }
  }, [location.state, authToken, enableProjectFilter, projectId]);

  const userOptions = useMemo(() => {
    if (projectId && projectUsersQuery.data) {
      let filteredUsers = projectUsersQuery.data;


      if (taskType === "Travel Task") {
        if (currentUser?.access?.includes("Admin")) {
          filteredUsers = filteredUsers.filter(user => user.id === currentUser.id);
        } else {
          filteredUsers = filteredUsers.filter(user => user.access !== "Employee");
        }
      }


      if (filterFn) {
        filteredUsers = filterFn(filteredUsers);
      }


      return filteredUsers.map((user) => ({
        label: user.name || 'Unnamed User',
        value: {
          id: user.id,
          name: user.name,
          access: user.access,
        } as User,
      }));
    }


    if (!allUsersQuery.data?.users) return [];

    const seen = new Map<string, boolean>();
    let filteredUsers = allUsersQuery.data.users;

    if (enableProjectFilter && projectDetails) {
      filteredUsers = filteredUsers.filter((user) => {
        if (user.access === 'Admin') return true;

        const projectRoles = [
          projectDetails.site_incharge,
          projectDetails.marketing_incharge,
          ...(projectDetails.team || []),
        ];

        return projectRoles.includes(user.id);
      });
    }

    if (taskType === "Travel Task") {
      if (currentUser?.access === "Admin" || currentUser?.access === "Product Admin") {

        filteredUsers = filteredUsers.filter(user => user.id === currentUser.id);
      } else {

        filteredUsers = filteredUsers.filter(
          user => user.access === "Admin" || user.access === "Product Admin"
        );
      }
    }


    if (filterFn) {
      filteredUsers = filterFn(filteredUsers);
    }

    return filteredUsers
      .filter((user) => {
        const uniqueKey = user.id;
        if (seen.has(uniqueKey)) return false;
        seen.set(uniqueKey, true);
        return true;
      })
      .map((user) => ({
        label: user.name || 'Unnamed User',
        value: user,
      }));
  }, [
    projectId,
    projectUsersQuery.data,
    allUsersQuery.data,
    filterFn,
    enableProjectFilter,
    projectDetails,
    currentUser,
    taskType,
  ]);

  if (projectId ? projectUsersQuery.error : (allUsersQuery.error || projectError)) {
    return (
      <Alert severity="error">
        {projectId
          ? projectUsersQuery.error?.message
          : (allUsersQuery.error?.message || projectError)}
      </Alert>
    );
  }

  return (
    <SearchableDropdown<User>
      options={userOptions}
      value={value}
      onChange={onChange}
      label={label}
      loading={projectId ? projectUsersQuery.isLoading : allUsersQuery.isLoading}
      disabled={disabled}
      error={error}
      placeholder={placeholder}
      getOptionKey={(option) => option.value.id}
    />
  );
};

export default UserDropdown;