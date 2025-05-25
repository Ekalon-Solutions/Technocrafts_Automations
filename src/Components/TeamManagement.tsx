import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  alpha
} from '@mui/material';
import { User } from '../data-models/users';
import UserDropdown from './userDropdown';

interface FilteredUserDropdownProps {
  value: { label: string; value: User } | null;
  onChange: (value: { label: string; value: User } | null) => void;
  accessFilter?: string;
  error?: string;
  placeholder?: string;
  initialValue?: User;
}

const FilteredUserDropdown: React.FC<FilteredUserDropdownProps> = ({
  value,
  onChange,
  accessFilter,
  error,
  placeholder,
  initialValue
}) => {
  const defaultValue = initialValue ? {
    label: initialValue.name || '',
    value: initialValue
  } : null;

  return (
    <UserDropdown
      value={value || defaultValue}
      onChange={onChange}
      disabled={false}
      error={error}
      placeholder={placeholder}
      filterFn={(users) => users.filter(user =>
        user.access?.includes(accessFilter || '')
      )}
    />
  );
};

interface TeamManagementSectionProps {
  title: string;
  members: any[];
  accessFilter: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onSelect: (index: number) => (selectedOption: { label: string; value: User } | null) => void;
  employeeData?: { users: User[] };
  errors?: Record<string, string>;
}

const TeamManagement: React.FC<TeamManagementSectionProps> = ({
  title,
  members,
  accessFilter,
  onAdd,
  onRemove,
  onSelect,
  employeeData,
  errors
}) => {
  const mainBlue = "#1a2b4b";
  const [selectedMembers, setSelectedMembers] = useState<Array<{ label: string; value: User } | null>>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && members?.length > 0) {
      const convertedMembers = members.map(member => {
        if (member && member.name) {
          return {
            label: member.name,
            value: {
              ...member,
              id: member._id
            }
          };
        }
        return null;
      });

      setSelectedMembers(convertedMembers);
      setInitialized(true);

      convertedMembers.forEach((member, index) => {
        if (member) {
          onSelect(index)(member);
        }
      });
    }
  }, [members, initialized, onSelect]);

  const handleMemberSelect = (index: number) => (selectedOption: { label: string; value: User } | null) => {
    const newSelectedMembers = [...selectedMembers];
    newSelectedMembers[index] = selectedOption;
    setSelectedMembers(newSelectedMembers);
    onSelect(index)(selectedOption);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, color: mainBlue, fontWeight: 600 }}>
          {title}
        </Typography>
        {members.map((member, index) => (
          <Grid container spacing={2} key={`${title}-${index}-${member?._id || index}`} sx={{ mb: 2 }}>
            <Grid item xs={12} md={9}>
              <FilteredUserDropdown
                value={selectedMembers[index]}
                onChange={handleMemberSelect(index)}
                accessFilter={accessFilter}
                placeholder={selectedMembers[index]?.label || `Select ${title} ${index + 1}`}
                error={errors?.[`${title.toLowerCase().replace(' ', '_')}_${index}`]}
                initialValue={member}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                onClick={() => {
                  const newSelectedMembers = [...selectedMembers];
                  newSelectedMembers.splice(index, 1);
                  setSelectedMembers(newSelectedMembers);
                  onRemove(index);
                }}
                fullWidth
                sx={{ height: '100%' }}
              >
                Remove
              </Button>
            </Grid>
          </Grid>
        ))}

        <Button
          variant="contained"
          onClick={() => {
            setSelectedMembers([...selectedMembers, null]);
            onAdd();
          }}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: '10px',
            backgroundColor: mainBlue,
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: alpha(mainBlue, 0.9),
            },
          }}
        >
          Add {title}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TeamManagement;