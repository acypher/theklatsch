import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log('Build mode:', mode);
  console.log('Source map enabled:', mode === 'production' ? true : true);
  console.log('Sourcemap configuration:', {
    sourcemapMode: mode === 'production' ? 'production' : 'development',
    sourcemapEnabled: true
  });

  return {
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      sourcemap: true, // Explicitly enable source maps for both development and production
      sourcemapExcludeSources: false, // Ensure sources are not excluded
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
