import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    target: "node18",
    platform: "node",
    dts: true,
    sourcemap: true,
    clean: true,
    bundle: true,
    treeshake: true,
    minify: false,
    external: [
        "dotenv",
        "fs",
        "path",
        "@elizaos/adapter-sqlite",
        "@elizaos/adapter-sqljs",
        "@elizaos/adapter-supabase",
        "@elizaos/adapter-pglite",
        "bignumber.js",
        "pino",
        "pino-pretty"
    ],
    esbuildOptions(options) {
        options.conditions = ["@elizaos/source"];
        options.outExtension = { ".js": ".js" };
    }
});
