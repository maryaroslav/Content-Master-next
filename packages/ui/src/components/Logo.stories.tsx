import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import preview from '../../.storybook/preview';
import { Icon, iconNames } from '../kit/icons';
import { Logo } from './Logo';

const meta = preview.meta({ title: 'Foundations' });

export const LogoStory = meta.story({
    name: 'Logo',
    render: () => (
        <Stack direction="row" spacing={8} sx={{ alignItems: 'center' }}>
            <Logo />
            <Logo showName={false} />
        </Stack>
    ),
});

export const Icons = meta.story({
    render: () => (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 6 }}>
            {iconNames.map((name) => (
                <Stack key={name} spacing={1} sx={{ alignItems: 'center', width: 96 }}>
                    <Icon name={name} />
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>{name}</Typography>
                </Stack>
            ))}
        </Stack>
    ),
});
