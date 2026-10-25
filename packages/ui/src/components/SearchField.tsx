import SearchRounded from '@mui/icons-material/SearchRounded';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput, { type OutlinedInputProps } from '@mui/material/OutlinedInput';
import { useState, type FormEvent } from 'react';

export interface SearchFieldProps extends Omit<OutlinedInputProps, 'onSubmit'> {
    /** Accessible name; defaults to the placeholder. */
    label?: string;
    onSearch?: (query: string) => void;
}

/** The header search: a sunken 48px field in a role="search" form; submitting hands the trimmed query to onSearch. */
export function SearchField({ label, onSearch, placeholder, defaultValue, sx, ...rest }: SearchFieldProps) {
    const [query, setQuery] = useState(String(defaultValue ?? ''));
    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (query.trim()) onSearch?.(query.trim());
    };
    return (
        <Box component="form" role="search" onSubmit={submit} sx={[{ width: '100%' }, ...(Array.isArray(sx) ? sx : [sx])]}>
            <OutlinedInput
                {...rest}
                type="search"
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                inputProps={{ 'aria-label': label ?? placeholder }}
                startAdornment={<InputAdornment position="start"><SearchRounded sx={{ color: 'text.secondary' }} /></InputAdornment>}
                sx={(theme) => ({
                    height: theme.size.controlLg,
                    fontSize: 15,
                    backgroundColor: theme.vars.palette.cm.surfaceSunken,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.vars.palette.cm.border },
                })}
            />
        </Box>
    );
}
