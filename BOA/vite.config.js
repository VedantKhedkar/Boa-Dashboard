export default defineConfig({
  base: '/', // Change from '/admin/' to '/'
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
  },
})