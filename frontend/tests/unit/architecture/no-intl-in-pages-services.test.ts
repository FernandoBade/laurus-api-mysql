import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

function listSourceFiles(directory: string): readonly string[] {
    const entries = readdirSync(directory, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...listSourceFiles(fullPath));
            continue;
        }

        if (entry.isFile() && (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx"))) {
            files.push(fullPath);
        }
    }

    return files;
}

describe("architecture: no Intl usage in pages/services", () => {
    it("avoids direct Intl and toLocale* usage in restricted layers", () => {
        const targetFiles = [
            ...listSourceFiles(resolve(process.cwd(), "src/pages")),
            ...listSourceFiles(resolve(process.cwd(), "src/services")),
        ];

        targetFiles.forEach((filePath) => {
            const source = readFileSync(filePath, "utf8");
            expect(source).not.toMatch(/\bIntl\./);
            expect(source).not.toMatch(/\.toLocaleString\s*\(/);
            expect(source).not.toMatch(/\.toLocaleDateString\s*\(/);
            expect(source).not.toMatch(/\.toLocaleTimeString\s*\(/);
        });
    });
});
