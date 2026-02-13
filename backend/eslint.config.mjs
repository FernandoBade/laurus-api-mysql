import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new globalThis.URL(".", import.meta.url));

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,

    {
        files: ["src/**/*.ts", "tests/**/*.ts"],
        languageOptions: {
            parserOptions: {
                project: ["./tsconfig.json", "./tsconfig.test.json"],
                tsconfigRootDir: __dirname
            }
        },
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "error"
        }
    },
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            "tests/**",
            "jest.config.js",
            "drizzle.config.ts"
        ]
    }
];
