import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const frontendRoot = fileURLToPath(new URL(".", import.meta.url));
const sharedRoot = path.resolve(frontendRoot, "../shared");

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(frontendRoot, "src"),
            "@shared": sharedRoot,
        },
    },
    test: {
        globals: true,
        environment: "node",
        include: ["tests/unit/**/*.test.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            include: ["src/utils/intl/**/*.ts", "src/state/userPreferences.store.ts"],
            exclude: [
                "src/config/**",
                "src/bootstrap/**",
                "src/main.tsx",
                "src/App.tsx",
                "src/routes/**",
                "src/styles/**",
                "src/types/**",
                "src/**/__generated__/**",
                "src/**/test-helpers/**",
            ],
            thresholds: {
                branches: 80,
                functions: 80,
                lines: 80,
                statements: 80,
            },
        },
    },
});
