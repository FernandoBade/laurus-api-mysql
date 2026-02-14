import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new globalThis.URL(".", import.meta.url));

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,

    // ================================
    // Frontend source rules
    // ================================
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
                        "Do not use window.location. Use routes/navigation.ts instead."
                }
            ]
        }
    },

    // ================================
    // Node config files (Tailwind, Vite, etc.)
    // ================================
    {
        files: [
            "*.config.{js,cjs,mjs}",
            "tailwind.config.cjs",
            "frontend/*.config.{js,cjs,mjs}",
            "frontend/tailwind.config.cjs"
        ],
        languageOptions: {
            globals: {
                module: "readonly",
                require: "readonly",
                process: "readonly"
            }
        },
        rules: {
            "@typescript-eslint/no-require-imports": "off"
        }
    },

    {
        ignores: ["**/dist/**", "**/node_modules/**"]
    }
];
