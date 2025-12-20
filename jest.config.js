/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    clearMocks: true,

    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.test.json',
            },
        ],
    },

    collectCoverageFrom: [
        'src/**/*.{ts,js}',
        '!src/**/index.ts',
        '!src/server.ts',
        '!src/repositories/**',
        '!src/routes/**',
        '!src/db/**',
        '!src/utils/database/migrations/**',
        '!src/utils/database/sync/**',
        '!src/dev/**',
    ],

    coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/tests/'],

    coverageThreshold: {
        global: {
            statements: 40,
            branches: 30,
            functions: 40,
            lines: 40,
        },
    },
};
