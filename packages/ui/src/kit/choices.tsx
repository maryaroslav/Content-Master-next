import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useId, useMemo, useRef, type ReactNode } from 'react';
import { Icon } from './icons';

export interface ChoiceCardProps {
    /** A decorative picture: an <img> or next/image element. */
    image?: ReactNode;
    title: string;
    text?: string;
    onClick: () => void;
}

/** A large option the person picks by clicking the whole card. */
export function ChoiceCard({ image, title, text, onClick }: ChoiceCardProps) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={(theme) => ({
                display: 'flex',
                justifyContent: 'flex-start',
                gap: 4,
                p: 3,
                textAlign: 'left',
                borderRadius: theme.radius.lg,
                border: `1px solid ${theme.vars.palette.cm.border}`,
                '&:hover': { bgcolor: 'cm.surfaceHover' },
                '& img': { flex: 'none' },
            })}
        >
            {image}
            <Stack spacing={1}>
                <Typography variant="subtitle1">{title}</Typography>
                {text ? <Typography variant="body2" color="text.secondary">{text}</Typography> : null}
            </Stack>
        </ButtonBase>
    );
}

export interface RadioListGroup {
    /** Shown above the group; leave out for the first, unnamed group. */
    label?: string;
    options: { value: string; label: string }[];
}

export interface RadioListProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    groups: RadioListGroup[];
    error?: ReactNode;
    /** Long lists scroll inside instead of growing the page. */
    scroll?: boolean;
}

export function RadioList({ label, value, onChange, groups, error, scroll }: RadioListProps) {
    const errorId = useId();
    return (
        <FormControl error={Boolean(error)}>
            <RadioGroup aria-label={label} aria-describedby={error ? errorId : undefined} value={value} onChange={(e) => onChange(e.target.value)}>
                <Box sx={scroll ? { maxHeight: 280, overflowY: 'auto' } : undefined}>
                    {groups.map((group, i) => (
                        <Box key={group.label ?? i} role="group" aria-label={group.label}>
                            {group.label ? <Typography variant="overline" color="text.secondary" component="p" sx={{ mt: 3 }}>{group.label}</Typography> : null}
                            {group.options.map((option) => (
                                <FormControlLabel key={option.value} value={option.value} control={<Radio size="small" />} label={option.label} sx={{ display: 'flex' }} />
                            ))}
                        </Box>
                    ))}
                </Box>
            </RadioGroup>
            {error ? <FormHelperText id={errorId} role="alert">{error}</FormHelperText> : null}
        </FormControl>
    );
}

export interface ImagePickerProps {
    value: File | null;
    onChange: (file: File | null) => void;
    addLabel: string;
    changeLabel: string;
    previewAlt: string;
    /** For end-to-end tests that set the file directly. */
    testId?: string;
}

/** A square to click for one image, showing its preview once chosen. */
export function ImagePicker({ value, onChange, addLabel, changeLabel, previewAlt, testId }: ImagePickerProps) {
    const input = useRef<HTMLInputElement>(null);
    const preview = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);
    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
    return (
        <>
            <ButtonBase
                onClick={() => input.current?.click()}
                aria-label={preview ? changeLabel : addLabel}
                sx={(theme) => ({
                    alignSelf: 'center',
                    width: 160,
                    height: 160,
                    flexDirection: 'column',
                    gap: 2,
                    overflow: 'hidden',
                    borderRadius: theme.radius.xl,
                    border: preview ? 'none' : `2px dashed ${theme.vars.palette.cm.borderControl}`,
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'cm.surfaceHover' },
                })}
            >
                {preview ? (
                    <Box component="img" src={preview} alt={previewAlt} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <>
                        <Icon name="addImage" size="large" />
                        <Typography variant="body2" component="span">{addLabel}</Typography>
                    </>
                )}
            </ButtonBase>
            <input ref={input} type="file" accept="image/*" hidden data-testid={testId} onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
        </>
    );
}
