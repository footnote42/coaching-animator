import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
    globalIgnores(["**/node_modules", "**/.next", "**/dist", "public/gif-worker/"]),
    {
        extends: [...nextCoreWebVitals, ...nextTypescript],

        rules: {
            "@typescript-eslint/no-unused-vars": ["warn", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],

            "react-hooks/exhaustive-deps": "warn",

            // New in eslint-plugin-react-hooks 7 (bundled by eslint-config-next 16). These flag
            // existing, working patterns (26 hits), so they are off here rather than refactoring
            // component code inside a framework upgrade. Re-enable with a dedicated clean-up.
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/immutability": "off",
            "react-hooks/refs": "off",
            "@next/next/no-img-element": "warn",

            "no-restricted-imports": ["error", {
                patterns: [{
                    group: ["../../*"],
                    message: "Use the @/ path alias for imports across features.",
                }],
            }],
        },
    },
]);