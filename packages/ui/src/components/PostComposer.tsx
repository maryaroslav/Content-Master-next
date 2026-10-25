import AddPhotoAlternateRounded from '@mui/icons-material/AddPhotoAlternateRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';

export interface PostComposerLabels {
    text: string;
    placeholder: string;
    addImages: string;
    removeImage: string;
    submit: string;
}

export interface PostComposerProps {
    avatar?: ReactNode;
    labels: PostComposerLabels;
    maxImages?: number;
    submitting?: boolean;
    /** Resolve to clear the form; reject to keep the text and images for another try. */
    onSubmit: (post: { text: string; images: File[] }) => Promise<unknown>;
}

export function PostComposer({ avatar, labels, maxImages = 5, submitting, onSubmit }: PostComposerProps) {
    const [text, setText] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const urls = images.map((file) => URL.createObjectURL(file));
        setPreviews(urls);
        return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, [images]);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!text.trim() && images.length === 0) return;
        try {
            await onSubmit({ text: text.trim(), images });
            setText('');
            setImages([]);
        } catch {
            // The caller shows the error; the draft stays.
        }
    };

    return (
        <Card component="form" onSubmit={submit} sx={{ p: 5, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
                {avatar}
                <InputBase
                    multiline
                    minRows={2}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={labels.placeholder}
                    inputProps={{ 'aria-label': labels.text }}
                    sx={(t) => ({ flex: 1, px: 3, py: 2, borderRadius: t.radius.md, bgcolor: 'cm.surfaceSunken' })}
                />
            </Stack>
            {previews.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 2 }}>
                    {previews.map((url, i) => (
                        <Box key={url} sx={{ position: 'relative' }}>
                            <Box component="img" src={url} alt="" sx={(t) => ({ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: t.radius.md, display: 'block' })} />
                            <IconButton
                                size="small"
                                aria-label={labels.removeImage}
                                onClick={() => setImages((all) => all.filter((_, j) => j !== i))}
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
                    onChange={(e) => {
                        const picked = Array.from(e.target.files ?? []);
                        setImages((all) => [...all, ...picked].slice(0, maxImages));
                        e.target.value = '';
                    }}
                />
                <Button type="submit" size="small" loading={submitting} sx={{ ml: 'auto' }}>{labels.submit}</Button>
            </Stack>
        </Card>
    );
}
