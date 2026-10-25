import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectProps } from '@mui/material/Select';
import { useId, type ReactNode } from 'react';

export interface SelectFieldProps extends Omit<SelectProps<string>, 'error' | 'label' | 'children' | 'sx' | 'style' | 'className'> {
    label: ReactNode;
    options: { value: string; label: ReactNode }[];
    hint?: ReactNode;
    error?: ReactNode;
}

/** A select with the label above it, like TextField. Values stay the API's English values; labels are translated. */
export function SelectField({ label, options, hint, error, id, fullWidth = true, ...rest }: SelectFieldProps) {
    const generated = useId();
    const selectId = id ?? generated;
    return (
        <FormControl error={Boolean(error)} fullWidth={fullWidth}>
            <FormLabel id={`${selectId}-label`} sx={{ mb: 1 }}>{label}</FormLabel>
            <Select {...rest} id={selectId} labelId={`${selectId}-label`} aria-describedby={error || hint ? `${selectId}-message` : undefined}>
                {options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
            {error || hint ? <FormHelperText id={`${selectId}-message`}>{error || hint}</FormHelperText> : null}
        </FormControl>
    );
}
