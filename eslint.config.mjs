import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      // eslint-plugin-react-hooks v6 (via eslint-config-next 16) promotes
      // React Compiler rules to errors. The flagged components predate this
      // phase and fixing them would change render/effect behavior — out of
      // scope for the behavior-preserving foundation cleanup. Revisit during
      // the Phase 2/3 restyle, then restore these to 'error'.
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
];

export default eslintConfig;
