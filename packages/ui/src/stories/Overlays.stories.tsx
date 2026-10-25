import CloseRounded from '@mui/icons-material/CloseRounded';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import preview from '../../.storybook/preview';
import { SelectField } from '../components/SelectField';
import { TextField } from '../components/TextField';

const meta = preview.meta({ title: 'Overlays' });

function Wizard() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setOpen(true)}>Create community</Button>
            <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="wizard-title" aria-describedby="wizard-desc">
                <IconButton aria-label="Close" size="small" onClick={() => setOpen(false)} sx={{ position: 'absolute', top: 12, right: 12 }}>
                    <CloseRounded fontSize="small" />
                </IconButton>
                <LinearProgress variant="determinate" value={25} aria-label="Step 1 of 4" sx={{ mx: 6, mt: 6, mr: 14, height: 4, borderRadius: 999 }} />
                <Typography variant="overline" color="text.secondary" sx={{ px: 6, pt: 4 }}>Step 1 of 4</Typography>
                <DialogTitle id="wizard-title" sx={{ pt: 0 }}>Choose a name</DialogTitle>
                <DialogContent>
                    <DialogContentText id="wizard-desc">Use words that capture the idea of your community. You can change the name later.</DialogContentText>
                    <TextField label="Community name" defaultValue="Prague Frontend Meetup" maxLength={48} showCount />
                    <SelectField label="Community privacy" options={[{ value: 'public', label: 'Public' }, { value: 'private', label: 'Private' }]} defaultValue="public" />
                </DialogContent>
                <DialogActions>
                    <Button variant="soft" onClick={() => setOpen(false)}>Back</Button>
                    <Button>Continue</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export const DialogStory = meta.story({
    name: 'Dialog',
    render: () => <Wizard />,
    play: async ({ canvas, canvasElement, userEvent }) => {
        const trigger = canvas.getByRole('button', { name: 'Create community' });
        await userEvent.click(trigger);
        const body = canvasElement.ownerDocument.body;
        await waitFor(() => expect(body.querySelector('[role="dialog"]')).not.toBeNull());
        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(body.querySelector('[role="dialog"]')).toBeNull());
        await expect(trigger).toHaveFocus();
    },
});

export const TooltipStory = meta.story({
    name: 'Tooltip',
    render: () => (
        <Tooltip title="Notifications" open placement="right">
            <Button variant="soft">Bell</Button>
        </Tooltip>
    ),
});
