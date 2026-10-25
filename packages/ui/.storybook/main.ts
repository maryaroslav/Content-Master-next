import { defineMain } from '@storybook/react-vite/node';

export default defineMain({
    framework: '@storybook/react-vite',
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    addons: ['@storybook/addon-a11y', '@storybook/addon-vitest'],
});
