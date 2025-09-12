import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Minimal resistance - disable warnings, keep critical errors
      "@typescript-eslint/no-unused-vars": "warn", // Warn only, don't fail
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
      "no-console": "off",
      "react/display-name": "off",
      "import/no-anonymous-default-export": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-function": "off",
      // CRITICAL: Keep these as errors so repair system can catch them
      "react/no-children-prop": "error", // Keep - causes React.Children.only errors
      "react/jsx-key": "error", // Keep - causes hydration issues
      // Add specific patterns repair system looks for
      "no-undef": "error", // Keep - catches missing imports/variables
      // Next.js specific critical rules for SSR/Client Component boundaries
      "@next/next/no-async-client-component": "error", // Critical for Client Components
    }
  }
];

export default eslintConfig;
