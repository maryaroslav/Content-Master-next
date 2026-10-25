import baseConfig from '@cm/config-eslint/base';

const config = [...baseConfig, { ignores: ['playwright-report/**', 'test-results/**'] }];

export default config;
