
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log('Build mode:', mode);
  console.log('Source map enabled:', mode === 'production' ? true : true);

  return {
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      sourcemap: true, // Enable source maps for both development and production
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
