import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // 👇 Em dev: '/', Em prod: '/value-to-cost/'
  base: mode === "production" ? "/value-to-cost/" : "/",
  server: {
    host: true,              // aceita localhost/127.0.0.1
    port: 5173,              // porta padrão do Vite
    open: "/",               // abre o navegador na home
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));