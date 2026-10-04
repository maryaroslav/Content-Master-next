/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'no-circular',
            severity: 'error',
            comment: 'Circular dependencies between modules are not allowed.',
            from: {},
            to: { circular: true },
        },
    ],
    options: {
        doNotFollow: { path: 'node_modules' },
        exclude: { path: '(^|/)(\\.next|dist|node_modules)/' },
        tsPreCompilationDeps: true,
    },
};
