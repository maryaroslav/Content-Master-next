import { definePreview } from '@storybook/react-vite';
import addonA11y from '@storybook/addon-a11y';
import { useColorScheme } from '@mui/material/styles';
import { useEffect, type ReactNode } from 'react';
import { UiProvider } from '../src/UiProvider';
import './preview.css';

function SchemeSync({ mode, children }: { mode: 'light' | 'dark'; children: ReactNode }) {
    const { setMode } = useColorScheme();
    useEffect(() => setMode(mode), [mode, setMode]);
    return children;
}

export default definePreview({
    addons: [addonA11y()],
    globalTypes: {
        theme: {
            description: 'Colour scheme',
            toolbar: {
                title: 'Theme',
                icon: 'mirror',
                items: [
                    { value: 'light', title: 'Light' },
                    { value: 'dark', title: 'Dark' },
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: { theme: 'light' },
    decorators: [
        (Story, { globals }) => (
            <UiProvider>
                <SchemeSync mode={globals.theme}>
                    <Story />
                </SchemeSync>
            </UiProvider>
        ),
    ],
    parameters: {
        // Violations fail the story's test instead of only showing in the panel.
        a11y: { test: 'error' },
        layout: 'padded',
    },
});
