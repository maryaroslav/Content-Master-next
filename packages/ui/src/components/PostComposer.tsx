import AddPhotoAlternateRounded from '@mui/icons-material/AddPhotoAlternateRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';

export interface PostComposerLabels {
    text: string;
    placeholder: string;
    addImages: string;
    removeImage: string;
    submit: string;
    /** Shown when a pick would go over maxImages; the pick is then ignored. */
    tooManyImages: string;
}

export interface PostComposerProps {
    avatar?: ReactNode;
    labels: PostComposerLabels;
    maxImages?: number;
    submitting?: boolean;
    /** A validation or server error, shown under the text. */
    error?: ReactNode;
    /** Return true to clear the form, false to keep the text and images (the caller shows why through `error`). */
    onSubmit: (post: { text: string; images: File[] }) => boolean | Promise<boolean>;
}

export function PostComposer({ avatar, labels, maxImages = 5, submitting, error, onSubmit }: PostComposerProps) {
    const [text, setText] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [tooMany, setTooMany] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);
    const messageId = useId();
    const message = tooMany ? labels.tooManyImages : error;

    useEffect(() => {
        const urls = images.map((file) => URL.createObjectURL(file));
        setPreviews(urls);
        return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, [images]);

    const submit = async (event?: FormEvent) => {
        event?.preventDefault();
        if (submitting || (!text.trim() && images.length === 0)) return;
        if (!(await onSubmit({ text: text.trim(), images }))) return;
        setText('');
        setImages([]);
        setTooMany(false);
    };

    return (
        <Card component="form" onSubmit={submit} sx={{ p: 5, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
                {avatar}
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                    <InputBase
                        multiline
                        minRows={2}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void submit();
                        }}
                        placeholder={labels.placeholder}
                        error={Boolean(message)}
                        inputProps={{ 'aria-label': labels.text, 'aria-invalid': Boolean(message), 'aria-describedby': message ? messageId : undefined }}
                        sx={(t) => ({ px: 3, py: 2, borderRadius: t.radius.md, bgcolor: 'cm.surfaceSunken' })}
                    />
                    {message ? <FormHelperText id={messageId} error role="alert">{message}</FormHelperText> : null}
                </Stack>
            </Stack>
            {previews.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 2 }}>
                    {previews.map((url, i) => (
                        <Box key={url} sx={{ position: 'relative' }}>
                            <Box component="img" src={url} alt="" sx={(t) => ({ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: t.radius.md, display: 'block' })} />
                            <IconButton
                                size="small"
                                aria-label={labels.removeImage}
                                onClick={() => {
                                    setTooMany(false);
                                    setImages((all) => all.filter((_, j) => j !== i));
                                }}
                                sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' } }}
                            >
                                <CloseRounded fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            ) : null}
            <Stack direction="row" sx={{ alignItems: 'center' }}>
                <IconButton size="small" aria-label={labels.addImages} onClick={() => fileInput.current?.click()} disabled={images.length >= maxImages}>
                    <AddPhotoAlternateRounded fontSize="small" />
                </IconButton>
                <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    data-testid="post-images"
                    onChange={(e) => {
                        const picked = Array.from(e.target.files ?? []);
                        e.target.value = '';
                        if (images.length + picked.length > maxImages) {
                            setTooMany(true);
                            return;
                        }
                        setTooMany(false);
                        setImages((all) => [...all, ...picked]);
                    }}
                />
                <Button type="submit" size="small" loading={submitting} sx={{ ml: 'auto' }}>{labels.submit}</Button>
            </Stack>
        </Card>
    );
}
