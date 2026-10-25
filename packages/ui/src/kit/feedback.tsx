import MuiAlert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import type { ReactNode } from 'react';
import { Button } from './actions';

export interface AlertProps {
    severity?: 'info' | 'success' | 'warning' | 'error';
    title?: ReactNode;
    /** A button at the end of the alert, e.g. Try again. */
    action?: { label: string; onClick: () => void };
    children: ReactNode;
}

export function Alert({ severity = 'info', title, action, children }: AlertProps) {
    return (
        <MuiAlert
            severity={severity}
            action={action ? <Button variant="secondary" size="small" onClick={action.onClick}>{action.label}</Button> : undefined}
        >
            {title ? <AlertTitle>{title}</AlertTitle> : null}
            {children}
        </MuiAlert>
    );
}

export interface LoadingStateProps {
    /** Read by screen readers; nothing is shown but the spinner. */
    label: string;
    /** inline: a short spinner under a list (loading more). */
    size?: 'block' | 'inline';
}

export function LoadingState({ label, size = 'block' }: LoadingStateProps) {
    return (
        <Box role="status" aria-label={label} sx={{ display: 'flex', justifyContent: 'center', py: size === 'block' ? 8 : 4 }}>
            <CircularProgress size={size === 'block' ? 28 : 24} aria-hidden />
        </Box>
    );
}

export interface ErrorStateProps {
    message: ReactNode;
    retryLabel: string;
    onRetry: () => void;
}

/** A request that failed, with a way to try it again. */
export function ErrorState({ message, retryLabel, onRetry }: ErrorStateProps) {
    return <Alert severity="error" action={{ label: retryLabel, onClick: onRetry }}>{message}</Alert>;
}
