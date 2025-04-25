
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      sourcemap: true, // Always generate complete source maps
      rollupOptions: {
        // Basic output configuration
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          }
        }
      }
    },
    plugins: [
      react({
        devtools: true,
        // Enable full source maps for React components
        tsDecorators: true,
      }),
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
