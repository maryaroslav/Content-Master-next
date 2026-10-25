import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useId, type ReactNode } from 'react';
import { Button, IconButton } from './actions';
import { Alert } from './feedback';

export interface ConfirmDialogProps {
    open: boolean;
    title: string;
    text: ReactNode;
    confirmLabel: string;
    cancelLabel: string;
    /** For deletions and other irreversible actions: the confirm button is red. */
    danger?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export function ConfirmDialog({ open, title, text, confirmLabel, cancelLabel, danger, loading, onConfirm, onClose }: ConfirmDialogProps) {
    const id = useId();
    return (
        <Dialog open={open} onClose={onClose} aria-labelledby={`${id}-title`} aria-describedby={`${id}-text`}>
            <DialogTitle id={`${id}-title`}>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id={`${id}-text`}>{text}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="secondary" onClick={onClose}>{cancelLabel}</Button>
                <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
            </DialogActions>
        </Dialog>
    );
}

export interface WizardDialogProps {
    open: boolean;
    onClose: () => void;
    /** After the closing animation: reset the steps and the form here. */
    onExited?: () => void;
    closeLabel: string;
    title: string;
    description?: ReactNode;
    /** Progress for the counted steps, e.g. { current: 1, total: 4, label: 'Step 1 of 4' }; leave out on an intro step. */
    progress?: { current: number; total: number; label: string };
    /** A form or server error for the whole step. */
    error?: ReactNode;
    /** Without actions the step moves on by itself (e.g. picking a card). */
    back?: { label: string; onClick: () => void };
    next?: { label: string; onClick: () => void; loading?: boolean };
    children: ReactNode;
}

/** A dialog that walks through steps: progress, the step's title and text, its fields, Back and Continue. */
export function WizardDialog({ open, onClose, onExited, closeLabel, title, description, progress, error, back, next, children }: WizardDialogProps) {
    const id = useId();
    const hasActions = Boolean(back || next);
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby={`${id}-title`}
            aria-describedby={description ? `${id}-text` : undefined}
            slotProps={{ paper: { sx: { maxWidth: 520 } }, transition: { onExited } }}
        >
            <Stack sx={{ position: 'absolute', top: 12, right: 12 }}>
                <IconButton icon="close" label={closeLabel} size="small" onClick={onClose} />
            </Stack>
            {progress ? (
                <Stack spacing={4} sx={{ px: 6, pt: 6, pr: 16 }}>
                    <LinearProgress
                        variant="determinate"
                        value={(progress.current / progress.total) * 100}
                        aria-hidden
                        sx={(theme) => ({ height: 4, borderRadius: theme.radius.full, bgcolor: 'cm.surfaceSunken' })}
                    />
                    <Typography variant="overline" color="text.secondary">{progress.label}</Typography>
                </Stack>
            ) : null}
            <DialogContent sx={{ pt: progress ? 1 : 6, pb: hasActions ? 0 : 6 }}>
                <Stack spacing={1} sx={{ pr: 8 }}>
                    <Typography id={`${id}-title`} variant="h2">{title}</Typography>
                    {description ? <Typography id={`${id}-text`} variant="body2" color="text.secondary">{description}</Typography> : null}
                </Stack>
                {children}
                {error ? <Alert severity="error">{error}</Alert> : null}
            </DialogContent>
            {hasActions ? (
                <DialogActions>
                    {back ? <Button variant="secondary" onClick={back.onClick}>{back.label}</Button> : null}
                    {next ? <Button onClick={next.onClick} loading={next.loading}>{next.label}</Button> : null}
                </DialogActions>
            ) : null}
        </Dialog>
    );
}
