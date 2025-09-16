import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2021",
  minify: false,
  splitting: false,
  shims: false,
  treeshake: true,
  skipNodeModulesBundle: true,
  outDir: "dist",
});
