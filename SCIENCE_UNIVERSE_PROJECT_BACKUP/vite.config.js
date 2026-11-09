import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'public',
  server: {
    port: 7777,
    host: '0.0.0.0',
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', 'three/examples/jsm/controls/OrbitControls.js'],
          'spacecraft': ['src/spacecraft/SpaceflightSystem.js', 'src/spacecraft/RocketManager.js'],
          'world-systems': ['src/world/PlanetEnvironment.js', 'src/world/VolumetricTerrain.js'],
          'audio-ui': ['src/audio/ProceduralAudio.js', 'src/ui/UIManager.js']
        }
      }
    }
  }
});
