import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new globalThis.URL(".", import.meta.url));

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,

    {
        files: ["src/**/*.{ts,tsx}", "frontend/src/**/*.{ts,tsx}"],
        languageOptions: {
            parserOptions: {
                project: ["./tsconfig.app.json"],
                tsconfigRootDir: __dirname,
            },
        },
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "error",
            "no-restricted-properties": [
                "error",
                {
                    object: "window",
                    property: "location",
                    message:
                        "Do not use window.location. Use routes/navigation.ts instead.",
                },
            ],
        },
    },

    {
        files: ["src/pages/**/*.{ts,tsx}", "src/services/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-syntax": [
                "error",
                {
                    selector: "MemberExpression[object.name='Intl']",
                    message:
                        "Do not use Intl directly in pages/services. Use src/utils/intl instead.",
                },
                {
                    selector: "CallExpression[callee.property.name='toLocaleString']",
                    message:
                        "Do not use toLocaleString directly in pages/services. Use src/utils/intl instead.",
                },
                {
                    selector: "CallExpression[callee.property.name='toLocaleDateString']",
                    message:
                        "Do not use toLocaleDateString directly in pages/services. Use src/utils/intl instead.",
                },
                {
                    selector: "CallExpression[callee.property.name='toLocaleTimeString']",
                    message:
                        "Do not use toLocaleTimeString directly in pages/services. Use src/utils/intl instead.",
                },
            ],
        },
    },

    {
        files: [
            "*.config.{js,cjs,mjs}",
            "tailwind.config.cjs",
            "frontend/*.config.{js,cjs,mjs}",
            "frontend/tailwind.config.cjs",
        ],
        languageOptions: {
            globals: {
                module: "readonly",
                require: "readonly",
                process: "readonly",
            },
        },
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },

    {
        ignores: ["**/dist/**", "**/node_modules/**"],
    },
];
