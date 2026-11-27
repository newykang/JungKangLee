import { defineConfig } from "vite";
export default defineConfig({
  esbuild: { jsx: "automatic" },
  base: "./",
  resolve: { dedupe: ["react", "react-dom", "lucide-react"] },
  server: { fs: { allow: [".."] } },
});
