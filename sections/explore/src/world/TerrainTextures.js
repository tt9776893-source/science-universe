import { document } from '../../ctx.js';
import * as THREE from 'three';

/**
 * Generates procedural high-resolution Martian PBR textures:
 * Albedo (ferric regolith), Normal (granular sand & pebbles), and Roughness.
 */
export function createMartianTerrainTextures() {
  const size = 512;
  const albedoCanvas = document.createElement('canvas');
  const normalCanvas = document.createElement('canvas');
  const roughnessCanvas = document.createElement('canvas');
  for (const canvas of [albedoCanvas, normalCanvas, roughnessCanvas]) {
    canvas.width = size;
    canvas.height = size;
  }

  const albedoContext = albedoCanvas.getContext('2d');
  const normalContext = normalCanvas.getContext('2d');
  const roughnessContext = roughnessCanvas.getContext('2d');
  const albedoData = albedoContext.createImageData(size, size);
  const normalData = normalContext.createImageData(size, size);
  const roughnessData = roughnessContext.createImageData(size, size);
  const heightMap = new Float32Array(size * size);

  const hash = (x, y) => {
    let value = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + 1274126177) | 0;
    value = Math.imul(value ^ (value >>> 13), 1274126177);
    return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
  };
  const smoothNoise = (x, y, cells) => {
    const px = (x / size) * cells;
    const py = (y / size) * cells;
    const ix = Math.floor(px);
    const iy = Math.floor(py);
    const fx = px - ix;
    const fy = py - iy;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const wrap = (value) => ((value % cells) + cells) % cells;
    const a = hash(wrap(ix), wrap(iy));
    const b = hash(wrap(ix + 1), wrap(iy));
    const c = hash(wrap(ix), wrap(iy + 1));
    const d = hash(wrap(ix + 1), wrap(iy + 1));
    const top = a + (b - a) * sx;
    const bottom = c + (d - c) * sx;
    return top + (bottom - top) * sy;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = y * size + x;
      const broad = smoothNoise(x, y, 7);
      const grain = smoothNoise(x, y, 28);
      const grit = smoothNoise(x, y, 96);
      heightMap[index] = broad * 0.52 + grain * 0.30 + grit * 0.18;

      const pixel = index * 4;
      const h = heightMap[index];
      const pigment = (h - 0.5) * 22 + (broad - 0.5) * 8;
      albedoData.data[pixel] = THREE.MathUtils.clamp(224 + pigment, 0, 255);
      albedoData.data[pixel + 1] = THREE.MathUtils.clamp(221 + pigment, 0, 255);
      albedoData.data[pixel + 2] = THREE.MathUtils.clamp(216 + pigment, 0, 255);
      albedoData.data[pixel + 3] = 255;

      const roughness = Math.round(THREE.MathUtils.clamp(0.93 - grit * 0.18 - grain * 0.06, 0.68, 0.96) * 255);
      roughnessData.data[pixel] = roughness;
      roughnessData.data[pixel + 1] = roughness;
      roughnessData.data[pixel + 2] = roughness;
      roughnessData.data[pixel + 3] = 255;
    }
  }

  for (let y = 0; y < size; y++) {
    const yPrevious = (y - 1 + size) % size;
    const yNext = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xPrevious = (x - 1 + size) % size;
      const xNext = (x + 1) % size;
      const pixel = (y * size + x) * 4;
      const dx = (heightMap[y * size + xNext] - heightMap[y * size + xPrevious]) * 4.2;
      const dy = (heightMap[yNext * size + x] - heightMap[yPrevious * size + x]) * 4.2;
      const length = Math.hypot(dx, dy, 1);
      normalData.data[pixel] = Math.round((-dx / length * 0.5 + 0.5) * 255);
      normalData.data[pixel + 1] = Math.round((-dy / length * 0.5 + 0.5) * 255);
      normalData.data[pixel + 2] = Math.round((1 / length * 0.5 + 0.5) * 255);
      normalData.data[pixel + 3] = 255;
    }
  }

  albedoContext.putImageData(albedoData, 0, 0);
  normalContext.putImageData(normalData, 0, 0);
  roughnessContext.putImageData(roughnessData, 0, 0);

  // Create Three.js Textures
  const albedoTexture = new THREE.CanvasTexture(albedoCanvas);
  albedoTexture.colorSpace = THREE.SRGBColorSpace;
  albedoTexture.wrapS = THREE.RepeatWrapping;
  albedoTexture.wrapT = THREE.RepeatWrapping;
  albedoTexture.repeat.set(6, 6);

  const normalTexture = new THREE.CanvasTexture(normalCanvas);
  normalTexture.wrapS = THREE.RepeatWrapping;
  normalTexture.wrapT = THREE.RepeatWrapping;
  normalTexture.repeat.set(6, 6);

  const roughnessTexture = new THREE.CanvasTexture(roughnessCanvas);
  roughnessTexture.wrapS = THREE.RepeatWrapping;
  roughnessTexture.wrapT = THREE.RepeatWrapping;
  roughnessTexture.repeat.set(6, 6);

  return { albedoTexture, normalTexture, roughnessTexture };
}

const planetTextureCache = new Map();
const planetTexturePalettes = {
  lunar: { base: [104, 106, 110], high: [154, 154, 150], low: [54, 58, 64], roughness: 0.94 },
  earth: { base: [74, 103, 61], high: [133, 129, 97], low: [45, 70, 53], roughness: 0.82 },
  mercury: { base: [118, 108, 94], high: [167, 155, 137], low: [58, 55, 53], roughness: 0.91 },
  venus: { base: [174, 123, 61], high: [218, 173, 91], low: [92, 63, 42], roughness: 0.86 }
};

export function createPlanetTerrainTextures(profile) {
  if (planetTextureCache.has(profile)) return planetTextureCache.get(profile);
  if (profile === 'mars') {
    const textures = createMartianTerrainTextures();
    planetTextureCache.set(profile, textures);
    return textures;
  }

  const palette = planetTexturePalettes[profile] || planetTexturePalettes.lunar;
  const size = 512;
  const albedo = document.createElement('canvas');
  const normal = document.createElement('canvas');
  const roughness = document.createElement('canvas');
  for (const canvas of [albedo, normal, roughness]) {
    canvas.width = size;
    canvas.height = size;
  }

  const albedoContext = albedo.getContext('2d');
  const normalContext = normal.getContext('2d');
  const roughnessContext = roughness.getContext('2d');
  const albedoData = albedoContext.createImageData(size, size);
  const normalData = normalContext.createImageData(size, size);
  const roughnessData = roughnessContext.createImageData(size, size);
  const heightMap = new Float32Array(size * size);

  const hash = (x, y) => {
    let value = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + 1274126177) | 0;
    value = Math.imul(value ^ (value >>> 13), 1274126177);
    return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
  };
  const smoothNoise = (x, y, cells) => {
    const px = (x / size) * cells;
    const py = (y / size) * cells;
    const ix = Math.floor(px);
    const iy = Math.floor(py);
    const fx = px - ix;
    const fy = py - iy;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const wrap = (value) => ((value % cells) + cells) % cells;
    const a = hash(wrap(ix), wrap(iy));
    const b = hash(wrap(ix + 1), wrap(iy));
    const c = hash(wrap(ix), wrap(iy + 1));
    const d = hash(wrap(ix + 1), wrap(iy + 1));
    const top = a + (b - a) * sx;
    const bottom = c + (d - c) * sx;
    return top + (bottom - top) * sy;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = y * size + x;
      const broad = smoothNoise(x, y, 6);
      const grain = smoothNoise(x, y, 24);
      const grit = smoothNoise(x, y, 80);
      heightMap[index] = broad * 0.5 + grain * 0.3 + grit * 0.2;

      const pixel = index * 4;
      const h = heightMap[index];
      const shade = Math.max(0, Math.min(1, 0.5 + h));
      const color = shade > 0.6 ? palette.high : (shade < 0.35 ? palette.low : palette.base);
      const variation = (h - 0.5) * 36;
      albedoData.data[pixel] = Math.max(0, Math.min(255, color[0] + variation));
      albedoData.data[pixel + 1] = Math.max(0, Math.min(255, color[1] + variation));
      albedoData.data[pixel + 2] = Math.max(0, Math.min(255, color[2] + variation));
      albedoData.data[pixel + 3] = 255;

      const roughness = Math.round(THREE.MathUtils.clamp(palette.roughness - grit * 0.12 - grain * 0.05, 0.72, 0.96) * 255);
      roughnessData.data[pixel] = roughness;
      roughnessData.data[pixel + 1] = roughness;
      roughnessData.data[pixel + 2] = roughness;
      roughnessData.data[pixel + 3] = 255;
    }
  }

  for (let y = 0; y < size; y++) {
    const yPrevious = (y - 1 + size) % size;
    const yNext = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xPrevious = (x - 1 + size) % size;
      const xNext = (x + 1) % size;
      const pixel = (y * size + x) * 4;
      const dx = (heightMap[y * size + xNext] - heightMap[y * size + xPrevious]) * 4.2;
      const dy = (heightMap[yNext * size + x] - heightMap[yPrevious * size + x]) * 4.2;
      const length = Math.hypot(dx, dy, 1);
      normalData.data[pixel] = Math.round((-dx / length * 0.5 + 0.5) * 255);
      normalData.data[pixel + 1] = Math.round((-dy / length * 0.5 + 0.5) * 255);
      normalData.data[pixel + 2] = Math.round((1 / length * 0.5 + 0.5) * 255);
      normalData.data[pixel + 3] = 255;
    }
  }

  albedoContext.putImageData(albedoData, 0, 0);
  normalContext.putImageData(normalData, 0, 0);
  roughnessContext.putImageData(roughnessData, 0, 0);

  const textures = [albedo, normal, roughness].map((canvas) => {
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    return texture;
  });
  textures[0].colorSpace = THREE.SRGBColorSpace;
  const result = { albedoTexture: textures[0], normalTexture: textures[1], roughnessTexture: textures[2] };
  planetTextureCache.set(profile, result);
  return result;
}
