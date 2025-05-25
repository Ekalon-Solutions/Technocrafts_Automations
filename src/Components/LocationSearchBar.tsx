import React, { useState, useRef, useEffect } from 'react';
import {
    FormControl,
    MenuItem,
    CircularProgress,
    TextField,
    Box,
    InputAdornment,
    IconButton,
    Tooltip
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { Loader } from '@googlemaps/js-api-loader';

interface LocationSearchBarProps {
    label?: string;
    value?: string;
    onChange?: (value: string, country?: string, state?: string) => void;
    error?: boolean;
    helperText?: string;
    required?: boolean;
}

const LocationSearchBar: React.FC<LocationSearchBarProps> = ({
    label = 'Location',
    value = '',
    onChange,
    error,
    helperText,
    required = false
}) => {
    const [query, setQuery] = useState(value);
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value !== query) {
            setQuery(value);
        }
    }, [value]);

    useEffect(() => {
        const initGooglePlaces = async () => {
            const loader = new Loader({
                apiKey: import.meta.env.VITE_GOOGLE_PLACES_API,
                version: 'weekly',
                libraries: ['places']
            });

            try {
                await loader.load();
                autocompleteService.current = new google.maps.places.AutocompleteService();
                placesService.current = new google.maps.places.PlacesService(document.createElement('div'));
            } catch (error) {
                console.error('Error loading Google Places API', error);
            }
        };

        initGooglePlaces();

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    const fetchPredictions = (inputValue: string) => {
        if (!autocompleteService.current) return;

        setLoading(true);
        autocompleteService.current.getPlacePredictions(
            { input: inputValue },
            (predictions, status) => {
                setLoading(false);
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    setPredictions(predictions || []);
                    setOpen(true);
                } else {
                    setPredictions([]);
                }
            }
        );
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setQuery(inputValue);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            if (inputValue.length > 2) {
                fetchPredictions(inputValue);
            } else {
                setPredictions([]);
                setOpen(false);
            }
        }, 300);
    };

    const handlePlaceSelect = (placeId: string) => {
        if (!placesService.current) return;

        placesService.current.getDetails(
            {
                placeId: placeId,
                fields: ['formatted_address', 'address_components']
            },
            (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                    const fullAddress = place.formatted_address || '';
                    setQuery(fullAddress);

                    let country = '';
                    let state = '';

                    if (place.address_components) {
                        for (const component of place.address_components) {
                            if (component.types.includes('country')) {
                                country = component.long_name;
                            }
                            if (component.types.includes('administrative_area_level_1')) {
                                state = component.long_name;
                            }
                        }
                    }

                    onChange?.(fullAddress, country, state);
                    setOpen(false);
                    setPredictions([]);
                }
            }
        );
    };

    const handleClear = () => {
        setQuery('');
        setPredictions([]);
        setOpen(false);
        onChange?.('', '', '');
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            <FormControl fullWidth error={error} variant="outlined">
                <TextField
                    fullWidth
                    label={label}
                    value={query}
                    onChange={handleInputChange}
                    variant="outlined"
                    onFocus={() => {
                        if (predictions.length > 0) {
                            setOpen(true);
                        }
                    }}
                    error={error}
                    helperText={helperText}
                    required={required}
                    InputLabelProps={{ shrink: !!query || undefined }}
                    InputProps={{
                        endAdornment: query ? (
                            <InputAdornment position="end">
                                <Tooltip title="Clear">
                                    <IconButton
                                        edge="end"
                                        onClick={handleClear}
                                        size="small"
                                        aria-label="clear address"
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </InputAdornment>
                        ) : null
                    }}
                />
                {open && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 'calc(100% + 2px)',
                            left: 0,
                            right: 0,
                            zIndex: 1300,
                            maxHeight: '250px',
                            overflowY: 'auto',
                            border: '1px solid rgba(0, 0, 0, 0.23)',
                            borderRadius: '4px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            backgroundColor: 'white'
                        }}
                    >
                        {loading && (
                            <MenuItem
                                disabled
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: '12px'
                                }}
                            >
                                <CircularProgress size={24} />
                            </MenuItem>
                        )}

                        {!loading && predictions.length === 0 && (
                            <MenuItem
                                disabled
                                sx={{
                                    color: 'rgba(0, 0, 0, 0.54)',
                                    padding: '12px 16px'
                                }}
                            >
                                No locations found
                            </MenuItem>
                        )}

                        {predictions.map((prediction) => (
                            <MenuItem
                                key={prediction.place_id}
                                onClick={() => handlePlaceSelect(prediction.place_id)}
                                sx={{
                                    padding: '12px 16px',
                                    transition: 'background-color 0.2s',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                            >
                                {prediction.description}
                            </MenuItem>
                        ))}
                    </Box>
                )}
            </FormControl>
        </div>
    );
};

export default LocationSearchBar;