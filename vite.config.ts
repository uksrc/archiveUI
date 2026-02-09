import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/archive-gui/",
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    port: 27981,
    strictPort: true,
  },
});
