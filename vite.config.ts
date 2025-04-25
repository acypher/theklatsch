import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  console.log('Build mode:', mode);
  console.log('Source map configuration:', {
    sourcemapMode: mode === 'production' ? 'production' : 'development',
    sourcemapEnabled: true,
    fullSourcemapDetails: {
      buildSourcemap: true,
      excludeSources: false
    }
  });

  return {
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      sourcemap: true, 
      sourcemapExcludeSources: false, 
      rollupOptions: {
        output: {
          sourcemapBaseUrl: '/',
          sourcemapPathTransform: (relativeSourcePath) => {
            console.log('Transforming source path:', relativeSourcePath);
            return relativeSourcePath;
          }
        }
      }
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
