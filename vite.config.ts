import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    https: {},
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false, // development with self-signed certificate
      }
    },
    fs: {
      allow: [".", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), basicSsl(), backendPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

/**
 * Starts the backend server on port 3001 as a separate process in development.
 * This isolates Express from Vite's HTTP/2 server, fixing protocol crashes.
 */
import { spawn } from 'child_process';
function backendPlugin(): Plugin {
  return {
    name: "backend-plugin",
    apply: "serve",
    configureServer() {
      console.log('🚀 Starting Backend Process on port 3001...');

      const backend = spawn('npx', ['tsx', '--watch', 'server/node-build.ts'], {
        env: { ...process.env, PORT: '3001' },
        stdio: 'inherit',
        shell: true
      });

      backend.on('error', (err) => {
        console.error('❌ Failed to start backend:', err);
      });

      // Cleanup on exit
      process.on('exit', () => backend.kill());
      process.on('SIGINT', () => backend.kill());
      process.on('SIGTERM', () => backend.kill());
    },
  };
}

