import { useState } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  CircularProgress,
  Typography
} from '@mui/material';

export interface Option<T> {
  label: string;
  value: T;
}

export interface SearchableDropdownProps<T> {
  options: Option<T>[];
  value: Option<T> | null;
  onChange: (value: Option<T> | null) => void;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  getOptionKey?: (option: Option<T>) => string;
}

function SearchableDropdown<T>({
  options,
  value,
  onChange,
  label,
  loading = false,
  disabled = false,
  error,
  placeholder,
  getOptionKey = (option) => option.label,
}: SearchableDropdownProps<T>) {
  const [inputValue, setInputValue] = useState('');

  return (
    <Autocomplete<Option<T>, false>
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_, newValue) => setInputValue(newValue)}
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) =>
        getOptionKey(option) === getOptionKey(value)
      }
      loading={loading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={getOptionKey(option)}>
          <Typography>{option.label}</Typography>
        </Box>
      )}
    />
  );
}

export default SearchableDropdown;