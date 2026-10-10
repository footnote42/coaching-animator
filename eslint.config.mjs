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

            "react-hooks/set-state-in-effect": "error",
            "react-hooks/immutability": "error",
            "react-hooks/refs": "error",
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
