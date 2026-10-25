import AttachFileRounded from '@mui/icons-material/AttachFileRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import { useRef, useState, type FormEvent } from 'react';

export interface ComposerLabels {
    message: string;
    placeholder: string;
    attach: string;
    send: string;
}

export interface ComposerProps {
    labels: ComposerLabels;
    /** Called with the trimmed text; the field clears right away (sending is optimistic). */
    onSend: (text: string) => void;
    /** Without it there is no attach button. */
    onAttach?: (file: File) => void;
    disabled?: boolean;
}

export function Composer({ labels, onSend, onAttach, disabled }: ComposerProps) {
    const [text, setText] = useState('');
    const fileInput = useRef<HTMLInputElement>(null);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const message = text.trim();
        if (!message) return;
        onSend(message);
        setText('');
    };

    return (
        <Box
            component="form"
            onSubmit={submit}
            sx={(t) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                border: `1px solid ${t.vars.palette.cm.border}`,
                borderRadius: t.radius.lg,
                bgcolor: 'background.paper',
                '&:focus-within': { borderColor: 'cm.accent', boxShadow: `0 0 0 1px ${t.vars.palette.cm.accent}` },
            })}
        >
            {onAttach ? (
                <>
                    <IconButton size="small" aria-label={labels.attach} onClick={() => fileInput.current?.click()} disabled={disabled}>
                        <AttachFileRounded fontSize="small" />
                    </IconButton>
                    <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onAttach(file);
                            e.target.value = '';
                        }}
                    />
                </>
            ) : null}
            <InputBase
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={labels.placeholder}
                inputProps={{ 'aria-label': labels.message }}
                disabled={disabled}
                sx={{ flex: 1, px: 1 }}
            />
            <Button type="submit" color="primary" size="small" disabled={disabled}>{labels.send}</Button>
        </Box>
    );
}
