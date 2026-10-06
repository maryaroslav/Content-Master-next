/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'no-circular',
            severity: 'error',
            comment: 'Circular dependencies between modules are not allowed.',
            from: {},
            // Type-only cycles (e.g. models referencing each other's types) don't exist at runtime.
            to: { circular: true, viaOnly: { dependencyTypesNot: ['type-only'] } },
        },
    ],
    options: {
        doNotFollow: { path: 'node_modules' },
        exclude: { path: '(^|/)(\\.next|dist|node_modules)/' },
        tsPreCompilationDeps: true,
    },
};
