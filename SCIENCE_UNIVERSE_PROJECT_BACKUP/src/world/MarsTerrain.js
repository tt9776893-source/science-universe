import * as THREE from 'three';

/**
 * Procedural Deterministic Perlin-Style Noise implementation
 */
class PseudoNoise {
  constructor(seed = 4289) {
    this.seed = seed;
    this.p = new Uint8Array(512);
    this.permutation = [
      151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
      8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
      35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,
      134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
      55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,
      18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,
      250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,
      189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,
      172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,
      228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,
      107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
      138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
    ];
    for (let i = 0; i < 256; i++) {
      const idx = (this.permutation[i] + this.seed) % 256;
      this.p[i] = this.permutation[idx];
      this.p[256 + i] = this.permutation[idx];
    }
  }

  fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(t, a, b) { return a + t * (b - a); }
  grad(hash, x, y) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = this.fade(xf);
    const v = this.fade(yf);

    const aa = this.p[this.p[X] + Y];
    const ab = this.p[this.p[X] + Y + 1];
    const ba = this.p[this.p[X + 1] + Y];
    const bb = this.p[this.p[X + 1] + Y + 1];

    const x1 = this.lerp(u, this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf));
    const x2 = this.lerp(u, this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1));
    return this.lerp(v, x1, x2);
  }
}

export class MarsTerrain {
  constructor(scene, seed = 7391) {
    this.scene = scene;
    this.seed = seed;
    this.noise = new PseudoNoise(seed);
    this.craterNoise = new PseudoNoise(seed + 999);
    this.detailNoise = new PseudoNoise(seed + 4321);

    // Chunk settings
    this.chunkSize = 64; // meters per chunk
    this.chunkResolution = 32; // segments per chunk edge
    this.activeRadius = 3; // 7x7 chunks around player = 448m wide explorable zone
    this.chunks = new Map();

    this._initMaterial();
  }

  _initMaterial() {
    // Custom shader material for realistic Mars terrain
    // Dunes on flat ground (warm red oxide), dark basalt rock on slopes
    this.material = new THREE.MeshStandardMaterial({
      roughness: 0.88,
      metalness: 0.12,
      vertexColors: true
    });
  }

  /**
   * Deterministic Mars surface elevation at any continuous (x, z)
   */
  getHeightAt(x, z) {
    // 1. Continental macro terrain (rolling valleys & ridge lines)
    const n1 = this.noise.noise2D(x * 0.003, z * 0.003);
    const macroElevation = n1 * 26.0;

    // 2. Mountain ridges & canyon walls
    const n2 = Math.abs(this.noise.noise2D(x * 0.008 + 12.3, z * 0.008 + 45.6));
    const ridgeElevation = Math.pow(n2, 1.8) * 22.0;

    // 3. Rolling regolith dunes
    const n3 = this.noise.noise2D(x * 0.025, z * 0.025);
    const duneElevation = n3 * 3.8;

    // 4. Craters (impact depressions with raised rims)
    const cx = x * 0.005;
    const cz = z * 0.005;
    const cn = this.craterNoise.noise2D(cx, cz);
    let craterOffset = 0;
    if (cn > 0.55) {
      const craterFactor = (cn - 0.55) / 0.45;
      craterOffset = -Math.sin(craterFactor * Math.PI) * 12.0 + (craterFactor > 0.8 ? 2.5 : 0);
    }

    // 5. Micro rock roughness
    const n4 = this.detailNoise.noise2D(x * 0.09, z * 0.09);
    const microDetail = n4 * 0.6;

    return macroElevation + ridgeElevation + duneElevation + craterOffset + microDetail;
  }

  getNormalAt(x, z, step = 0.5) {
    const hL = this.getHeightAt(x - step, z);
    const hR = this.getHeightAt(x + step, z);
    const hD = this.getHeightAt(x, z - step);
    const hU = this.getHeightAt(x, z + step);

    const normal = new THREE.Vector3(hL - hR, 2.0 * step, hD - hU);
    return normal.normalize();
  }

  createChunk(chunkX, chunkZ) {
    const key = `${chunkX},${chunkZ}`;
    if (this.chunks.has(key)) return this.chunks.get(key);

    const res = this.chunkResolution;
    const size = this.chunkSize;
    const geometry = new THREE.PlaneGeometry(size, size, res, res);
    geometry.rotateX(-Math.PI / 2); // Orient horizontal (XZ plane)

    const positions = geometry.attributes.position.array;
    const colors = new Float32Array(positions.length);

    const startX = chunkX * size;
    const startZ = chunkZ * size;

    const baseRed = new THREE.Color(0xb7542d); // Mars regolith
    const darkRock = new THREE.Color(0x52362b); // Basalt cliff
    const duneGold = new THREE.Color(0xd47547); // Wind-blown sand
    const tempColor = new THREE.Color();

    for (let i = 0; i < positions.length / 3; i++) {
      const localX = positions[i * 3];
      const localZ = positions[i * 3 + 2];
      const worldX = startX + localX;
      const worldZ = startZ + localZ;

      const h = this.getHeightAt(worldX, worldZ);
      positions[i * 3 + 1] = h;

      // Calculate slope to tint steep cliffs darker rock
      const normal = this.getNormalAt(worldX, worldZ);
      const slope = 1.0 - normal.y; // 0 on flat, 1 on vertical wall

      if (slope > 0.35) {
        tempColor.copy(baseRed).lerp(darkRock, Math.min(1.0, (slope - 0.35) * 2.5));
      } else {
        const duneNoise = (this.detailNoise.noise2D(worldX * 0.04, worldZ * 0.04) + 1) * 0.5;
        tempColor.copy(baseRed).lerp(duneGold, duneNoise * 0.6);
      }

      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.position.set(startX, 0, startZ);
    mesh.receiveShadow = true;
    mesh.castShadow = false;

    this.scene.add(mesh);
    this.chunks.set(key, { mesh, chunkX, chunkZ });

    return { mesh, chunkX, chunkZ };
  }

  update(playerPos) {
    const currentChunkX = Math.round(playerPos.x / this.chunkSize);
    const currentChunkZ = Math.round(playerPos.z / this.chunkSize);

    const neededKeys = new Set();

    // Stream chunks around player
    for (let dx = -this.activeRadius; dx <= this.activeRadius; dx++) {
      for (let dz = -this.activeRadius; dz <= this.activeRadius; dz++) {
        const cx = currentChunkX + dx;
        const cz = currentChunkZ + dz;
        const key = `${cx},${cz}`;
        neededKeys.add(key);

        if (!this.chunks.has(key)) {
          this.createChunk(cx, cz);
        }
      }
    }

    // Unload distant chunks to preserve memory
    for (const [key, chunk] of this.chunks.entries()) {
      if (!neededKeys.has(key)) {
        this.scene.remove(chunk.mesh);
        chunk.mesh.geometry.dispose();
        this.chunks.delete(key);
      }
    }
  }
}
