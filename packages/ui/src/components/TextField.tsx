import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput, { type OutlinedInputProps } from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useId, useState, type ChangeEvent, type ReactNode, type Ref } from 'react';
import { Icon, type IconName } from '../kit/icons';

export interface TextFieldProps extends Omit<OutlinedInputProps, 'error' | 'size' | 'inputRef' | 'ref' | 'label' | 'sx' | 'style' | 'className' | 'startAdornment' | 'endAdornment' | 'slotProps' | 'slots' | 'inputComponent'> {
    /** An icon at the start of the field, e.g. search. */
    icon?: IconName;
    label?: ReactNode;
    hint?: ReactNode;
    /** The message shown under the field; the field is invalid while it is set. */
    error?: ReactNode;
    size?: 'medium' | 'large';
    maxLength?: number;
    showCount?: boolean;
    /** A 6-digit one-time code: numeric keyboard, autofill from the authenticator, mono digits. */
    code?: boolean;
    /** Goes to the <input>, so react-hook-form's register() works as is. */
    ref?: Ref<HTMLInputElement>;
}

/** MUI's TextField floats the label inside the outline; the design system puts it above, with a hint, an error and a counter. */
export function TextField({ label, hint, error, size = 'medium', maxLength, showCount, code, icon, ref, id, onChange, inputProps, fullWidth = !code, ...rest }: TextFieldProps) {
    const generated = useId();
    const inputId = id ?? generated;
    const [length, setLength] = useState(() => String(rest.value ?? rest.defaultValue ?? '').length);
    const value = rest.value != null ? String(rest.value).length : length;
    const describedBy = error ? `${inputId}-message` : hint ? `${inputId}-message` : undefined;

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setLength(event.target.value.length);
        onChange?.(event);
    };

    return (
        <FormControl error={Boolean(error)} fullWidth={fullWidth}>
            {(label || showCount) && (
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                    {label ? <FormLabel htmlFor={inputId}>{label}</FormLabel> : <span />}
                    {showCount && maxLength ? (
                        <Typography variant="caption" color="text.secondary" aria-live="polite">{`${value}/${maxLength}`}</Typography>
                    ) : null}
                </Stack>
            )}
            <OutlinedInput
                {...rest}
                id={inputId}
                inputRef={ref}
                onChange={handleChange}
                startAdornment={icon ? <InputAdornment position="start"><Icon name={icon} color="muted" /></InputAdornment> : undefined}
                sx={(theme) => ({
                    '& .MuiOutlinedInput-input': {
                        ...(size === 'large' ? { py: '13px' } : null),
                        ...(code ? { fontFamily: theme.typography.code.fontFamily, letterSpacing: '0.2em', width: '10ch' } : null),
                    },
                })}
                inputProps={{
                    maxLength,
                    'aria-describedby': describedBy,
                    ...(code ? { inputMode: 'numeric', autoComplete: 'one-time-code', maxLength: 6 } : null),
                    ...inputProps,
                }}
            />
            {error || hint ? <FormHelperText id={`${inputId}-message`} role={error ? 'alert' : undefined}>{error || hint}</FormHelperText> : null}
        </FormControl>
    );
}
