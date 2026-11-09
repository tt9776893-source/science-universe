import * as THREE from 'three';
import { edgeTable, triTable } from 'three/examples/jsm/objects/MarchingCubes.js';
import { getPlanetWorldConfig } from './PlanetEnvironment.js';
import { createPlanetTerrainTextures } from './TerrainTextures.js';

/**
 * Deterministic pseudo-random Simplex/Perlin-style 3D noise generator
 */
class TerrainNoise {
  constructor(seed = 4289) {
    this.seed = seed;
    this.p = new Uint8Array(512);
    const perm = [
      151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
      8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
      35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,
      134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
      55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,
      18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,
      250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,
      189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,
      20,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,
      228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,
      107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
      23,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
    ];
    for (let i = 0; i < 256; i++) {
      const idx = (perm[i] + this.seed) % 256;
      this.p[i] = perm[idx];
      this.p[256 + i] = perm[idx];
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
  grad3(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
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

  noise3D(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const zf = z - Math.floor(z);
    const u = this.fade(xf);
    const v = this.fade(yf);
    const w = this.fade(zf);

    const a = this.p[X] + Y;
    const aa = this.p[a] + Z;
    const ab = this.p[a + 1] + Z;
    const b = this.p[X + 1] + Y;
    const ba = this.p[b] + Z;
    const bb = this.p[b + 1] + Z;

    const x1 = this.lerp(u, this.grad3(this.p[aa], xf, yf, zf), this.grad3(this.p[ba], xf - 1, yf, zf));
    const x2 = this.lerp(u, this.grad3(this.p[ab], xf, yf - 1, zf), this.grad3(this.p[bb], xf - 1, yf - 1, zf));
    const y1 = this.lerp(v, x1, x2);

    const x3 = this.lerp(u, this.grad3(this.p[aa + 1], xf, yf, zf - 1), this.grad3(this.p[ba + 1], xf - 1, yf, zf - 1));
    const x4 = this.lerp(u, this.grad3(this.p[ab + 1], xf, yf - 1, zf - 1), this.grad3(this.p[bb + 1], xf - 1, yf - 1, zf - 1));
    const y2 = this.lerp(v, x3, x4);

    return this.lerp(w, y1, y2);
  }
}

/**
 * 3D Volumetric Terrain Chunk (Accurate Marching Cubes Implementation)
 * Supports true 3D spatial positioning (cx, cy, cz) down to -144m depth.
 */
export class VolumetricChunk {
  constructor(chunkX, chunkY, chunkZ, manager) {
    this.chunkX = chunkX;
    this.chunkY = chunkY;
    this.chunkZ = chunkZ;
    this.manager = manager;

    this.sizeX = manager.chunkSize;
    this.sizeY = manager.chunkHeight;
    this.sizeZ = manager.chunkSize;

    this.startX = chunkX * this.sizeX;
    this.startY = chunkY * this.sizeY;
    this.startZ = chunkZ * this.sizeZ;

    this.minY = this.startY;
    this.maxY = this.startY + this.sizeY;

    const lodResolution = manager.getChunkResolution(chunkX, chunkZ);
    this.rx = lodResolution;
    this.ry = lodResolution;
    this.rz = lodResolution;

    this.stepX = this.sizeX / (this.rx - 1);
    this.stepY = this.sizeY / (this.ry - 1);
    this.stepZ = this.sizeZ / (this.rz - 1);

    this.voxelCount = this.rx * this.ry * this.rz;
    this.densities = new Float32Array(this.voxelCount);
    this.mesh = null;
    this.debugBoxHelper = null;
    this.isDirty = true;
    this.isHomogeneousAir = false;
    this.isHomogeneousSolid = false;

    this.initDensities();
  }

  setLodResolution(resolution) {
    if (resolution === this.rx && resolution === this.ry && resolution === this.rz) return;
    this.rx = resolution;
    this.ry = resolution;
    this.rz = resolution;
    this.stepX = this.sizeX / (this.rx - 1);
    this.stepY = this.sizeY / (this.ry - 1);
    this.stepZ = this.sizeZ / (this.rz - 1);
    this.voxelCount = this.rx * this.ry * this.rz;
    this.densities = new Float32Array(this.voxelCount);
    this.isHomogeneousAir = false;
    this.isHomogeneousSolid = false;
    this.isDirty = true;
    this.initDensities();
    this.generateMesh();
  }

  getIndex(ix, iy, iz) {
    return ix + this.rx * (iy + this.ry * iz);
  }

  getVoxelWorldPos(ix, iy, iz) {
    return {
      x: this.startX + ix * this.stepX,
      y: this.minY + iy * this.stepY,
      z: this.startZ + iz * this.stepZ
    };
  }

  initDensities() {
    const key = `${this.chunkX},${this.chunkY},${this.chunkZ}`;
    const chunkEdits = this.manager.persistentEdits.get(key) || [];
    const hasEdits = chunkEdits.length > 0;

    // Check corner surface elevations
    const h00 = this.manager.getBaseHeight(this.startX, this.startZ);
    const h10 = this.manager.getBaseHeight(this.startX + this.sizeX, this.startZ);
    const h01 = this.manager.getBaseHeight(this.startX, this.startZ + this.sizeZ);
    const h11 = this.manager.getBaseHeight(this.startX + this.sizeX, this.startZ + this.sizeZ);

    // No solid surface (gas giants, ice giants, Sun): entire chunk is air.
    if (!Number.isFinite(h00) || !Number.isFinite(h10) || !Number.isFinite(h01) || !Number.isFinite(h11)) {
      if (!hasEdits) {
        this.isHomogeneousAir = true;
        this.isDirty = false;
        return;
      }
    }

    const minSurfH = Math.min(h00, h10, h01, h11) - 2.5;
    const maxSurfH = Math.max(h00, h10, h01, h11) + (this.manager.planetId === 'mars' ? 4.0 : 2.5);

    // Fast rejection 1: Chunk is completely above atmosphere
    if (this.minY > maxSurfH && !hasEdits) {
      this.isHomogeneousAir = true;
      this.isDirty = false;
      return;
    }

    // Fast rejection 2: Chunk is deep underground solid bedrock without natural caves or player edits
    if (this.maxY < minSurfH - 6.0 && !hasEdits) {
      const midX = this.startX + this.sizeX * 0.5;
      const midY = this.startY + this.sizeY * 0.5;
      const midZ = this.startZ + this.sizeZ * 0.5;
      const cnMid = this.manager.caveNoise.noise3D(midX * 0.035, midY * 0.035, midZ * 0.035);
      const cn0 = this.manager.caveNoise.noise3D(this.startX * 0.035, this.startY * 0.035, this.startZ * 0.035);
      const cn1 = this.manager.caveNoise.noise3D((this.startX + this.sizeX) * 0.035, (this.startY + this.sizeY) * 0.035, (this.startZ + this.sizeZ) * 0.035);

      if (cnMid < 0.44 && cn0 < 0.44 && cn1 < 0.44) {
        this.isHomogeneousSolid = true;
        this.isDirty = false;
        return;
      }
    }

    this.isHomogeneousAir = false;
    this.isHomogeneousSolid = false;
    this._populateBaseDensities();

    // Apply saved persistent edits for this chunk
    if (hasEdits) {
      for (const edit of chunkEdits) {
        this.applyCarveInternal(edit.x, edit.y, edit.z, edit.radius, edit.op === 'fill');
      }
    }
  }

  _populateBaseDensities() {
    this.isHomogeneousAir = false;
    this.isHomogeneousSolid = false;

    // No solid surface: nothing to populate.
    if (this.manager.planetConfig?.hasSolidSurface === false) return;

    for (let iz = 0; iz < this.rz; iz++) {
      const wz = this.startZ + iz * this.stepZ;
      for (let ix = 0; ix < this.rx; ix++) {
        const wx = this.startX + ix * this.stepX;
        const surfaceHeight = this.manager.getBaseHeight(wx, wz);

        for (let iy = 0; iy < this.ry; iy++) {
          const wy = this.minY + iy * this.stepY;
          // Base density: surfaceHeight - wy (+ is solid rock, - is atmosphere)
          let d = surfaceHeight - wy;

          if (this.manager.planetId === 'mars' && wy >= surfaceHeight - 3.5 && wy <= surfaceHeight + 4.5) {
            d = Math.max(d, this.manager._sampleMarsBoulders(wx, wy, wz));
          } else if (wy >= surfaceHeight - 3.5 && wy <= surfaceHeight + 4.5) {
            const rockId = this.manager.planetId;
            if (rockId === 'moon' || rockId === 'mercury' || rockId === 'venus' || rockId === 'earth') {
              d = Math.max(d, this.manager._sampleSurfaceRocks(wx, wy, wz, rockId));
            }
          }

          // Natural subterranean caves (only below surface - 5.5m)
          if (wy < surfaceHeight - 5.5) {
            const caveN = this.manager.caveNoise.noise3D(wx * 0.035, wy * 0.035, wz * 0.035);
            if (caveN > 0.46) {
              d -= (caveN - 0.46) * 20.0;
            }
          }

          this.densities[this.getIndex(ix, iy, iz)] = d;
        }
      }
    }
  }

  applyCarveInternal(cx, cy, cz, radius, isFill) {
    // Fast AABB-sphere overlap check (with 1-voxel margin)
    const clampX = Math.max(this.startX, Math.min(cx, this.startX + this.sizeX));
    const clampY = Math.max(this.minY, Math.min(cy, this.maxY));
    const clampZ = Math.max(this.startZ, Math.min(cz, this.startZ + this.sizeZ));
    const boxDistSq = (cx - clampX) ** 2 + (cy - clampY) ** 2 + (cz - clampZ) ** 2;
    const maxR = radius + Math.max(this.stepX, this.stepY, this.stepZ);
    if (boxDistSq > maxR * maxR) {
      return 0;
    }

    // If this chunk was previously fast-rejected as homogeneous air/solid, populate true base densities first!
    if (this.isHomogeneousAir || this.isHomogeneousSolid) {
      this._populateBaseDensities();
    }

    const rSq = radius * radius;
    let modifiedVoxels = 0;

    for (let iz = 0; iz < this.rz; iz++) {
      const wz = this.startZ + iz * this.stepZ;
      const dz = wz - cz;
      const dz2 = dz * dz;
      if (dz2 > rSq * 1.8) continue;

      for (let iy = 0; iy < this.ry; iy++) {
        const wy = this.minY + iy * this.stepY;
        const dy = wy - cy;
        const dy2 = dy * dy;
        if (dz2 + dy2 > rSq * 1.8) continue;

        for (let ix = 0; ix < this.rx; ix++) {
          const wx = this.startX + ix * this.stepX;
          const dx = wx - cx;
          const distSq = dx * dx + dy2 + dz2;

          if (distSq < rSq) {
            const dist = Math.sqrt(distSq);
            const idx = this.getIndex(ix, iy, iz);
            if (isFill) {
              const fillDensity = radius - dist;
              if (fillDensity > this.densities[idx]) {
                this.densities[idx] = fillDensity;
                modifiedVoxels++;
              }
            } else {
              const carveDensity = dist - radius;
              if (carveDensity < this.densities[idx]) {
                this.densities[idx] = carveDensity;
                modifiedVoxels++;
              }
            }
          }
        }
      }
    }
    if (modifiedVoxels > 0) {
      this.isDirty = true;
    }
    return modifiedVoxels;
  }

  generateMesh() {
    if (this.isHomogeneousAir || this.isHomogeneousSolid) {
      if (this.mesh) {
        this.manager.scene.remove(this.mesh);
        this.mesh.geometry?.dispose();
        this.mesh = null;
        this.manager._raycastDirty = true;
      }
      this.isDirty = false;
      return null;
    }

    const positions = [];
    const normals = [];
    const uvs = [];
    const colors = [];

    const terrainColors = this.manager.planetConfig.terrain?.colors;
    const colSand = new THREE.Color(terrainColors?.surface || 0xb85d38);
    const colDune = new THREE.Color(terrainColors?.dune || 0xd47346);
    const colStrata = new THREE.Color(terrainColors?.strata || 0x7c4936);
    const colBasalt = new THREE.Color(terrainColors?.basalt || 0x352b27);
    const tempCol = new THREE.Color();

    const vlist = new Array(12);

    for (let iz = 0; iz < this.rz - 1; iz++) {
      const z0 = this.startZ + iz * this.stepZ;
      const z1 = z0 + this.stepZ;

      for (let iy = 0; iy < this.ry - 1; iy++) {
        const y0 = this.minY + iy * this.stepY;
        const y1 = y0 + this.stepY;

        for (let ix = 0; ix < this.rx - 1; ix++) {
          const x0 = this.startX + ix * this.stepX;
          const x1 = x0 + this.stepX;

          // 8 Cube corner densities strictly following Three.js MarchingCubes convention
          const d0 = this.densities[this.getIndex(ix,     iy,     iz    )];
          const d1 = this.densities[this.getIndex(ix + 1, iy,     iz    )];
          const d2 = this.densities[this.getIndex(ix,     iy + 1, iz    )];
          const d3 = this.densities[this.getIndex(ix + 1, iy + 1, iz    )];
          const d4 = this.densities[this.getIndex(ix,     iy,     iz + 1)];
          const d5 = this.densities[this.getIndex(ix + 1, iy,     iz + 1)];
          const d6 = this.densities[this.getIndex(ix,     iy + 1, iz + 1)];
          const d7 = this.densities[this.getIndex(ix + 1, iy + 1, iz + 1)];

          let cubeindex = 0;
          if (d0 < 0) cubeindex |= 1;
          if (d1 < 0) cubeindex |= 2;
          if (d2 < 0) cubeindex |= 8;
          if (d3 < 0) cubeindex |= 4;
          if (d4 < 0) cubeindex |= 16;
          if (d5 < 0) cubeindex |= 32;
          if (d6 < 0) cubeindex |= 128;
          if (d7 < 0) cubeindex |= 64;

          const bits = edgeTable[cubeindex];
          if (bits === 0) continue;

          const p0 = [x0, y0, z0];
          const p1 = [x1, y0, z0];
          const p2 = [x0, y1, z0];
          const p3 = [x1, y1, z0];
          const p4 = [x0, y0, z1];
          const p5 = [x1, y0, z1];
          const p6 = [x0, y1, z1];
          const p7 = [x1, y1, z1];

          // Linear interpolation along edge
          const interpEdge = (pa, pb, da, db) => {
            let mu = 0.5;
            const denom = db - da;
            if (Math.abs(denom) > 1e-6) {
              mu = (0.0 - da) / denom;
              if (mu < 0.0) mu = 0.0;
              else if (mu > 1.0) mu = 1.0;
            }
            return [
              pa[0] + mu * (pb[0] - pa[0]),
              pa[1] + mu * (pb[1] - pa[1]),
              pa[2] + mu * (pb[2] - pa[2])
            ];
          };

          if (bits & 1)    vlist[0]  = interpEdge(p0, p1, d0, d1);
          if (bits & 2)    vlist[1]  = interpEdge(p1, p3, d1, d3);
          if (bits & 4)    vlist[2]  = interpEdge(p2, p3, d2, d3);
          if (bits & 8)    vlist[3]  = interpEdge(p0, p2, d0, d2);
          if (bits & 16)   vlist[4]  = interpEdge(p4, p5, d4, d5);
          if (bits & 32)   vlist[5]  = interpEdge(p5, p7, d5, d7);
          if (bits & 64)   vlist[6]  = interpEdge(p6, p7, d6, d7);
          if (bits & 128)  vlist[7]  = interpEdge(p4, p6, d4, d6);
          if (bits & 256)  vlist[8]  = interpEdge(p0, p4, d0, d4);
          if (bits & 512)  vlist[9]  = interpEdge(p1, p5, d1, d5);
          if (bits & 1024) vlist[10] = interpEdge(p3, p7, d3, d7);
          if (bits & 2048) vlist[11] = interpEdge(p2, p6, d2, d6);

          const triOffset = cubeindex * 16;
          for (let i = 0; triTable[triOffset + i] !== -1; i += 3) {
            let pA = vlist[triTable[triOffset + i]];
            let pB = vlist[triTable[triOffset + i + 1]];
            let pC = vlist[triTable[triOffset + i + 2]];

            if (!pA || !pB || !pC) continue;

            // Compute exact face normal
            const abX = pB[0] - pA[0], abY = pB[1] - pA[1], abZ = pB[2] - pA[2];
            const acX = pC[0] - pA[0], acY = pC[1] - pA[1], acZ = pC[2] - pA[2];
            let fnX = abY * acZ - abZ * acY;
            let fnY = abZ * acX - abX * acZ;
            let fnZ = abX * acY - abY * acX;
            const fnLen = Math.hypot(fnX, fnY, fnZ);
            if (fnLen < 1e-6) continue;
            fnX /= fnLen;
            fnY /= fnLen;
            fnZ /= fnLen;

            // Analytical outward normal into open air cavity
            const normA = this.manager.sampleNormal(pA[0], pA[1], pA[2]);
            let normB = this.manager.sampleNormal(pB[0], pB[1], pB[2]);
            let normC = this.manager.sampleNormal(pC[0], pC[1], pC[2]);

            // Triangle winding verification:
            // Ensure face normal points into the open air cavity where player/lights exist (eliminates black shading!)
            if (fnX * normA.x + fnY * normA.y + fnZ * normA.z < 0) {
              const tmp = pB; pB = pC; pC = tmp;
              const normalTmp = normB; normB = normC; normC = normalTmp;
              fnX = -fnX; fnY = -fnY; fnZ = -fnZ;
            }

            positions.push(pA[0], pA[1], pA[2]);
            positions.push(pB[0], pB[1], pB[2]);
            positions.push(pC[0], pC[1], pC[2]);

            // Triplanar UV mapping: ensures vertical shafts and horizontal tunnels tile crisp rock texture without stretching
            const absNx = Math.abs(fnX);
            const absNy = Math.abs(fnY);
            const absNz = Math.abs(fnZ);

            const pushTriUV = (p) => {
              // Planet-appropriate UV scale so terrain textures tile correctly
              // without visible repetition or stretching on different world scales.
              const uvScale = (() => {
                const pid = this.manager.planetId;
                if (pid === 'mars') return 0.12;
                if (pid === 'moon') return 0.20;
                if (pid === 'mercury') return 0.22;
                if (pid === 'venus') return 0.18;
                if (pid === 'earth') return 0.15;
                return 0.25;
              })();
              if (absNy >= absNx && absNy >= absNz) {
                // Horizontal floor/ceiling
                uvs.push(p[0] * uvScale, p[2] * uvScale);
              } else if (absNx >= absNz) {
                // East/West vertical wall
                uvs.push(p[2] * uvScale, p[1] * uvScale);
              } else {
                // North/South vertical wall
                uvs.push(p[0] * uvScale, p[1] * uvScale);
              }
            };
            pushTriUV(pA);
            pushTriUV(pB);
            pushTriUV(pC);

            // Blend smooth continuous normal with geometric face normal
            normals.push(
              normA.x * 0.75 + fnX * 0.25,
              normA.y * 0.75 + fnY * 0.25,
              normA.z * 0.75 + fnZ * 0.25
            );
            normals.push(
              normB.x * 0.75 + fnX * 0.25,
              normB.y * 0.75 + fnY * 0.25,
              normB.z * 0.75 + fnZ * 0.25
            );
            normals.push(
              normC.x * 0.75 + fnX * 0.25,
              normC.y * 0.75 + fnY * 0.25,
              normC.z * 0.75 + fnZ * 0.25
            );

            // Depth-aware geological colors use smooth vertex normals to avoid faceted color bands.
            const midX = (pA[0] + pB[0] + pC[0]) / 3.0;
            const midY = (pA[1] + pB[1] + pC[1]) / 3.0;
            const midZ = (pA[2] + pB[2] + pC[2]) / 3.0;
            const surfH = this.manager.getBaseHeight(midX, midZ);
            const depth = surfH - midY;

            if (depth > 1.2) {
              const geo = this.manager.getGeologyAt(midX, midY, midZ);
              const pushGeologyColor = (point) => {
                tempCol.copy(geo.color);
                const band = Math.sin(point[1] * 1.8) * 0.04;
                colors.push(
                  THREE.MathUtils.clamp(tempCol.r + band, 0, 1),
                  THREE.MathUtils.clamp(tempCol.g + band * 0.6, 0, 1),
                  THREE.MathUtils.clamp(tempCol.b + band * 0.4, 0, 1)
                );
              };
              pushGeologyColor(pA);
              pushGeologyColor(pB);
              pushGeologyColor(pC);
            } else {
              const pushSurfaceColor = (point, normal) => {
                const slope = 1.0 - Math.max(0.0, normal.y);
                if (slope > 0.40) {
                  tempCol.copy(colStrata).lerp(colBasalt, Math.min(1.0, (slope - 0.40) * 2.0));
                } else {
                  const duneMix = (this.manager.duneNoise.noise2D(point[0] * 0.04, point[2] * 0.04) + 1.0) * 0.5;
                  tempCol.copy(colSand).lerp(colDune, duneMix * 0.5);
                }
                colors.push(tempCol.r, tempCol.g, tempCol.b);
              };
              pushSurfaceColor(pA, normA);
              pushSurfaceColor(pB, normB);
              pushSurfaceColor(pC, normC);
            }
          }
        }
      }
    }

    if (positions.length === 0) {
      if (this.mesh) {
        this.manager.scene.remove(this.mesh);
        this.mesh.geometry?.dispose();
        this.mesh = null;
        this.manager._raycastDirty = true;
      }
      if (this.debugBoxHelper) {
        this.manager.scene.remove(this.debugBoxHelper);
        this.debugBoxHelper = null;
      }
      this.isDirty = false;
      return null;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    const chunkKey = `${this.chunkX},${this.chunkY},${this.chunkZ}`;
    if (!this.mesh) {
      this.mesh = new THREE.Mesh(geometry, this.manager.material);
      this.mesh.name = `VolumetricTerrainChunk_${chunkKey}`;
      this.mesh.castShadow = false; // Terrain receives shadows; disabling terrain shadow casting eliminates ~350 redundant shadow passes
      this.mesh.receiveShadow = true;
      this.mesh.frustumCulled = true;
      this.manager.scene.add(this.mesh);
      this.manager._raycastDirty = true;
    } else {
      this.mesh.geometry.dispose();
      this.mesh.geometry = geometry;
    }

    this.mesh.userData = {
      isTerrain: true,
      chunkX: this.chunkX,
      chunkY: this.chunkY,
      chunkZ: this.chunkZ,
      chunkKey
    };

    this.mesh.updateMatrixWorld(true);
    this.manager.rebuildCount = (this.manager.rebuildCount || 0) + 1;

    if (this.manager.debugChunkBounds) {
      this._updateDebugBox();
    }

    this.isDirty = false;
    return this.mesh;
  }

  _updateDebugBox() {
    if (this.debugBoxHelper) {
      this.manager.scene.remove(this.debugBoxHelper);
    }
    const box = new THREE.Box3(
      new THREE.Vector3(this.startX, this.minY, this.startZ),
      new THREE.Vector3(this.startX + this.sizeX, this.maxY, this.startZ + this.sizeZ)
    );
    this.debugBoxHelper = new THREE.Box3Helper(box, 0x00f0ff);
    this.manager.scene.add(this.debugBoxHelper);
  }

  dispose() {
    if (this.mesh) {
      this.manager.scene.remove(this.mesh);
      this.mesh.geometry?.dispose();
      this.mesh = null;
      this.manager._raycastDirty = true;
    }
    if (this.debugBoxHelper) {
      this.manager.scene.remove(this.debugBoxHelper);
      this.debugBoxHelper = null;
    }
  }
}

/**
 * Master Volumetric Terrain System
 * 3D Chunks down to -144m, Triplanar PBR materials, deep geological strata, and high-FPS culling.
 */
export class VolumetricTerrain {
  constructor(scene, seed = 7391, initialSlotId = null) {
    this.scene = scene;
    this.planetId = 'mars';
    this.planetConfig = getPlanetWorldConfig(this.planetId);
    this.seed = seed;

    // Active save slot scoping ('slot_1' uses legacy MARS_VOXEL_EDITS_V4 to preserve existing user saves)
    this.activeSlotId = initialSlotId || localStorage.getItem('SU_ACTIVE_SAVE_SLOT') || 'slot_1';

    // Procedural noise generators
    this.macroNoise = new TerrainNoise(seed);
    this.ridgeNoise = new TerrainNoise(seed + 101);
    this.canyonNoise = new TerrainNoise(seed + 202);
    this.duneNoise = new TerrainNoise(seed + 303);
    this.caveNoise = new TerrainNoise(seed + 404);

    // 3D Chunk Dimensions (24m x 24m x 24m)
    this.chunkSize = 24;
    this.chunkHeight = 24;
    this.resX = 25; // 1.0m horizontal resolution
    this.resY = 25; // 1.0m vertical resolution
    this.resZ = 25; // 1.0m horizontal resolution
    this.activeRadius = 2; // Horizontal chunk radius (5x5 columns)

    this.chunks = new Map(); // "cx,cy,cz" -> VolumetricChunk
    this.persistentEdits = new Map(); // "cx,cy,cz" -> [ edits ]
    this.allEdits = []; // Flat spatial array for fast continuous normal / density evaluation

    this.rebuildCount = 0;
    this._raycastDirty = true;
    this._raycastMeshesCache = [];
    this._lastUpdateX = Infinity;
    this._lastUpdateY = Infinity;
    this._lastUpdateZ = Infinity;
    this._saveTimer = null;
    this.marsDem = null;
    this.marsDemLoadPromise = this._loadMarsDem();
    this.moonDem = null;
    this.moonDemLoadPromise = null;

    // Preallocated collision raycaster objects (zero per-frame GC allocations)
    this._floorRaycaster = new THREE.Raycaster();
    this._floorRayOrigin = new THREE.Vector3();
    this._floorRayDir = new THREE.Vector3(0, -1, 0);

    this.debugChunkBounds = false;
    this.debugWireframe = false;

    this._initMaterial();
    this._loadEditsFromStorage();
  }

  async _loadMarsDem() {
    if (this.planetId !== 'mars') return null;
    try {
      const basePath = '/assets/terrain/mars/mola-meg016/jezero_crop/';
      const [metadataResponse, heightResponse] = await Promise.all([
        fetch(`${basePath}jezero_256x256_mola.json`),
        fetch(`${basePath}jezero_256x256_mola_i16le.raw`),
      ]);
      if (!metadataResponse.ok || !heightResponse.ok) {
        throw new Error(`NASA MOLA asset load failed (${metadataResponse.status}/${heightResponse.status})`);
      }
      const metadata = await metadataResponse.json();
      const heightBuffer = await heightResponse.arrayBuffer();
      const expectedBytes = metadata.width * metadata.height * 2;
      if (heightBuffer.byteLength !== expectedBytes) {
        throw new Error(`NASA MOLA heightmap size mismatch: ${heightBuffer.byteLength} != ${expectedBytes}`);
      }
      const samples = new Int16Array(metadata.width * metadata.height);
      const heightView = new DataView(heightBuffer);
      for (let i = 0; i < samples.length; i += 1) {
        samples[i] = heightView.getInt16(i * 2, true);
      }
      this.marsDem = {
        ...metadata,
        samples,
      };
      for (const chunk of this.chunks.values()) chunk.dispose();
      this.chunks.clear();
      this.update(new THREE.Vector3(0, 5, 0), true);
      console.info(`[Terrain] Loaded measured Jezero MOLA DEM: ${metadata.width}x${metadata.height}`);
      return this.marsDem;
    } catch (error) {
      console.warn('[Terrain] Measured Jezero DEM unavailable; preserving explicit procedural fallback.', error);
      return null;
    }
  }

  async _loadMoonDem() {
    if (this.planetId !== 'moon') return null;
    if (this.moonDemLoadPromise) return this.moonDemLoadPromise;
    this.moonDemLoadPromise = (async () => {
      try {
        const basePath = '/assets/terrain/moon/lola_118m/apollo16_crop/';
        const [metadataResponse, heightResponse] = await Promise.all([
          fetch(`${basePath}apollo16_512x512_lola.json`),
          fetch(`${basePath}apollo16_512x512_lola_i16le.raw`),
        ]);
        if (!metadataResponse.ok || !heightResponse.ok) return null;
        const metadata = await metadataResponse.json();
        const heightBuffer = await heightResponse.arrayBuffer();
        const expectedBytes = metadata.width * metadata.height * 2;
        if (heightBuffer.byteLength !== expectedBytes) {
          throw new Error(`Moon LOLA heightmap size mismatch: ${heightBuffer.byteLength} != ${expectedBytes}`);
        }
        const samples = new Int16Array(metadata.width * metadata.height);
        const heightView = new DataView(heightBuffer);
        for (let i = 0; i < samples.length; i += 1) {
          samples[i] = heightView.getInt16(i * 2, true);
        }
        this.moonDem = { ...metadata, samples };
        for (const chunk of this.chunks.values()) chunk.dispose();
        this.chunks.clear();
        this.update(new THREE.Vector3(0, 5, 0), true);
        console.info(`[Terrain] Loaded measured Moon LOLA DEM: ${metadata.width}x${metadata.height}`);
        return this.moonDem;
      } catch (error) {
        console.warn('[Terrain] Measured Moon DEM unavailable; preserving explicit procedural fallback.', error);
        return null;
      }
    })();
    return this.moonDemLoadPromise;
  }

  _sampleMoonDem(x, z) {
    if (!this.moonDem) return null;
    const worldCoverage = Number(this.moonDem.worldCoverageMeters) || 240;
    const halfCoverage = worldCoverage * 0.5;
    if (x < -halfCoverage || x > halfCoverage || z < -halfCoverage || z > halfCoverage) return null;
    const u = (x + halfCoverage) / worldCoverage;
    const v = (halfCoverage - z) / worldCoverage;
    const width = this.moonDem.width;
    const height = this.moonDem.height;
    const gx = THREE.MathUtils.clamp(u * (width - 1), 0, width - 1);
    const gy = THREE.MathUtils.clamp(v * (height - 1), 0, height - 1);
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const x1 = Math.min(width - 1, x0 + 1);
    const y1 = Math.min(height - 1, y0 + 1);
    const tx = gx - x0;
    const ty = gy - y0;
    const noData = Number(this.moonDem.noData);
    const sample = (ix, iy) => {
      const value = this.moonDem.samples[iy * width + ix];
      return value === noData ? null : value;
    };
    const values = [[sample(x0, y0), 1 - tx], [sample(x1, y0), tx], [sample(x0, y1), 1 - tx], [sample(x1, y1), tx]]
      .filter(([value]) => value !== null);
    if (values.length === 0) return null;
    const bilinear = (one, two, three, four) => one * (1 - tx) * (1 - ty) + two * tx * (1 - ty) + three * (1 - tx) * ty + four * tx * ty;
    const corners = [
      sample(x0, y0), sample(x1, y0), sample(x0, y1), sample(x1, y1),
    ];
    if (corners.every((value) => value !== null)) return bilinear(...corners);
    const weighted = values.reduce((sum, [value, weight]) => sum + value * weight, 0);
    const weightTotal = values.reduce((sum, [, weight]) => sum + weight, 0);
    return weightTotal > 0 ? weighted / weightTotal : null;
  }

  _sampleMarsDem(x, z) {
    if (!this.marsDem) return null;
    const worldCoverage = Number(this.marsDem.worldCoverageMeters) || 240;
    const halfCoverage = worldCoverage * 0.5;
    if (x < -halfCoverage || x > halfCoverage || z < -halfCoverage || z > halfCoverage) return null;

    const u = (x + halfCoverage) / worldCoverage;
    const v = (halfCoverage - z) / worldCoverage;
    const width = this.marsDem.width;
    const height = this.marsDem.height;
    const gx = THREE.MathUtils.clamp(u * (width - 1), 0, width - 1);
    const gy = THREE.MathUtils.clamp(v * (height - 1), 0, height - 1);
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const x1 = Math.min(width - 1, x0 + 1);
    const y1 = Math.min(height - 1, y0 + 1);
    const tx = gx - x0;
    const ty = gy - y0;
    const noData = Number(this.marsDem.noData);
    const sample = (ix, iy) => {
      const value = this.marsDem.samples[iy * width + ix];
      return value === noData ? null : value;
    };
    const a = sample(x0, y0);
    const b = sample(x1, y0);
    const c = sample(x0, y1);
    const d = sample(x1, y1);
    const bilinearValues = [a, b, c, d].filter((value) => value !== null);
    if (bilinearValues.length === 0) return null;
    const fallback = bilinearValues.reduce((sum, value) => sum + value, 0) / bilinearValues.length;
    const upper = THREE.MathUtils.lerp(a ?? fallback, b ?? fallback, tx);
    const lower = THREE.MathUtils.lerp(c ?? fallback, d ?? fallback, tx);
    const elevationMeters = THREE.MathUtils.lerp(upper, lower, ty);
    const verticalScale = Number(this.marsDem.runtimeScale) || 0.006;
    const verticalReference = Number(this.marsDem.runtimeBaseMeters) || -2103.6;
    return 5.5 + (elevationMeters - verticalReference) * verticalScale;
  }

  // Feathered blend weight (0..1) for the measured MOLA DEM coverage.
  // 1.0 = fully measured DEM; 0.0 = fully procedural fallback.
  // A 40m transition zone prevents the abrupt cliff/step artifact at the DEM boundary.
  _demBlendWeight(x, z) {
    if (!this.marsDem) return 0;
    const worldCoverage = Number(this.marsDem.worldCoverageMeters) || 240;
    const halfCoverage = worldCoverage * 0.5;
    const featherMeters = Number(this.marsDem.featherMeters) || 40;
    const dx = Math.max(0, Math.abs(x) - halfCoverage);
    const dz = Math.max(0, Math.abs(z) - halfCoverage);
    const distOutside = Math.hypot(dx, dz);
    if (distOutside <= 0) return 1.0;
    if (distOutside >= featherMeters) return 0.0;
    const t = 1.0 - distOutside / featherMeters;
    return t * t * (3.0 - 2.0 * t); // smoothstep
  }

  // Measured DEM mean game-space elevation, used to anchor the procedural fallback
  // so the feathered blend between the two stays smooth.
  _marsGameBaseHeight() {
    if (this.marsDem && this.marsDem.gameBaseHeight != null) {
      return Number(this.marsDem.gameBaseHeight);
    }
    return 5.5;
  }

  getStorageKeyForSlot(slotId = this.activeSlotId, planetId = this.planetId) {
    if (planetId === 'mars') {
      if (!slotId || slotId === 'slot_1') return 'MARS_VOXEL_EDITS_V4';
      return `MARS_VOXEL_EDITS_V4_${slotId}`;
    }
    const baseKey = `SCIENCE_UNIVERSE_${String(planetId).toUpperCase()}_VOXEL_EDITS_V1`;
    return !slotId || slotId === 'slot_1' ? baseKey : `${baseKey}_${slotId}`;
  }

  _distributeEditToChunks(edit) {
    const r = (edit.radius || 1.8) + 1.5;
    const minCx = Math.floor((edit.x - r) / this.chunkSize);
    const maxCx = Math.floor((edit.x + r) / this.chunkSize);
    const minCy = Math.floor((edit.y - r) / this.chunkHeight);
    const maxCy = Math.floor((edit.y + r) / this.chunkHeight);
    const minCz = Math.floor((edit.z - r) / this.chunkSize);
    const maxCz = Math.floor((edit.z + r) / this.chunkSize);

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        for (let cz = minCz; cz <= maxCz; cz++) {
          const key = `${cx},${cy},${cz}`;
          let list = this.persistentEdits.get(key);
          if (!list) {
            list = [];
            this.persistentEdits.set(key, list);
          }
          list.push(edit);
        }
      }
    }
  }

  _initMaterial() {
    const { albedoTexture, normalTexture, roughnessTexture } = createPlanetTerrainTextures(this.planetConfig.terrainProfile);

    const previousMaterial = this.material;
    this.material = new THREE.MeshStandardMaterial({
      map: albedoTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(this.planetId === 'mars' ? 0.52 : 0.9, this.planetId === 'mars' ? 0.52 : 0.9),
      roughnessMap: roughnessTexture,
      roughness: 0.94,
      metalness: 0.025,
      vertexColors: true,
      wireframe: this.debugWireframe,
      side: THREE.FrontSide, // FrontSide with correct winding gives maximum performance and clean lighting
      flatShading: false
    });
    previousMaterial?.dispose();
    this._loadMoonMeasuredAlbedo();
  }

  async _loadMoonMeasuredAlbedo() {
    if (this.planetId !== 'moon') return;
    const imagePath = '/assets/terrain/moon/lola_118m/apollo16_crop/apollo16_1024x1024_lroc.webp';
    try {
      const response = await fetch(imagePath, { method: 'HEAD' });
      if (!response.ok) return;
      const texture = await new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(imagePath, resolve, undefined, reject);
      });
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.anisotropy = Math.min(4, this.renderer?.capabilities?.getMaxAnisotropy?.() || 1);
      const previousMap = this.material.map;
      this.material.map = texture;
      this.material.needsUpdate = true;
      if (previousMap && previousMap !== texture) previousMap.dispose();
      console.info('[Terrain] Loaded georeferenced Moon LROC WAC surface imagery.');
    } catch (error) {
      console.info('[Terrain] Moon measured imagery unavailable; keeping explicit procedural albedo fallback.');
    }
  }

  _loadEditsFromStorage() {
    this.persistentEdits.clear();
    this.allEdits = [];
    try {
      const storageKey = this.getStorageKeyForSlot(this.activeSlotId);
      const raw = localStorage.getItem(storageKey) ||
        (this.activeSlotId === 'slot_1' ? localStorage.getItem('MARS_VOXEL_EDITS_V3') : null);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          this.allEdits = data;
        } else if (typeof data === 'object' && data !== null) {
          for (const list of Object.values(data)) {
            if (Array.isArray(list)) {
              this.allEdits.push(...list);
            }
          }
        }
        for (const edit of this.allEdits) {
          this._distributeEditToChunks(edit);
        }
        console.log(`[VolumetricTerrain] Loaded ${this.allEdits.length} persistent volumetric edits (${storageKey})`);
      }
    } catch (e) {
      console.warn('[VolumetricTerrain] Failed to load edits from storage:', e);
    }
  }

  saveEditsToStorage(immediate = false) {
    if (immediate) {
      this.flushEditsToStorage();
      return;
    }
    if (this._saveTimer) return;
    this._saveTimer = setTimeout(() => {
      this._saveTimer = null;
      this.flushEditsToStorage();
    }, 350);
  }

  flushEditsToStorage() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
    try {
      const storageKey = this.getStorageKeyForSlot(this.activeSlotId);
      localStorage.setItem(storageKey, JSON.stringify(this.allEdits));
    } catch (e) {
      console.warn('[VolumetricTerrain] Failed to save edits:', e);
    }
  }

  setSaveSlot(slotId, clearSlotEdits = false) {
    this.flushEditsToStorage();
    this.activeSlotId = slotId || 'slot_1';
    if (clearSlotEdits) {
      const targetKey = this.getStorageKeyForSlot(this.activeSlotId);
      localStorage.setItem(targetKey, '[]');
    }
    this._loadEditsFromStorage();
    this._lastUpdateX = Infinity;
    for (const chunk of this.chunks.values()) {
      chunk.initDensities();
      chunk.generateMesh();
    }
    this._raycastDirty = true;
  }

  reloadForActiveSlot() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
    this._loadEditsFromStorage();
    this._lastUpdateX = Infinity;
    for (const chunk of this.chunks.values()) {
      chunk.initDensities();
      chunk.generateMesh();
    }
    this._raycastDirty = true;
  }

  resetAllEdits(slotOnly = true) {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
    this.persistentEdits.clear();
    this.allEdits = [];
    const targetKey = this.getStorageKeyForSlot(this.activeSlotId);
    localStorage.setItem(targetKey, '[]');
    if (!slotOnly && this.activeSlotId === 'slot_1') {
      localStorage.removeItem('MARS_VOXEL_EDITS_V3');
      localStorage.removeItem('MARS_VOXEL_EDITS_V2');
    }
    for (const chunk of this.chunks.values()) {
      chunk.initDensities();
      chunk.generateMesh();
    }
    this._raycastDirty = true;
    console.log(`[VolumetricTerrain] Terrain edits reset for ${targetKey}`);
  }

  toggleWireframe(enabled) {
    this.debugWireframe = (enabled !== undefined) ? enabled : !this.debugWireframe;
    this.material.wireframe = this.debugWireframe;
    return this.debugWireframe;
  }

  toggleChunkBounds(enabled) {
    this.debugChunkBounds = (enabled !== undefined) ? enabled : !this.debugChunkBounds;
    for (const chunk of this.chunks.values()) {
      if (this.debugChunkBounds) {
        chunk._updateDebugBox();
      } else if (chunk.debugBoxHelper) {
        this.scene.remove(chunk.debugBoxHelper);
        chunk.debugBoxHelper = null;
      }
    }
    return this.debugChunkBounds;
  }

  setPlanet(planetId) {
    const config = getPlanetWorldConfig(planetId);
    if (!config) return false;
    if (this.planetId === config.planetId) return true;

    this.flushEditsToStorage();
    for (const chunk of this.chunks.values()) chunk.dispose();
    this.chunks.clear();

    this.planetId = config.planetId;
    this.planetConfig = config;
    this.seed = config.seed || 7391;
    this.macroNoise = new TerrainNoise(this.seed);
    this.ridgeNoise = new TerrainNoise(this.seed + 101);
    this.canyonNoise = new TerrainNoise(this.seed + 202);
    this.duneNoise = new TerrainNoise(this.seed + 303);
    this.caveNoise = new TerrainNoise(this.seed + 404);

    this._initMaterial();
    this._loadEditsFromStorage();
    this._lastUpdateX = Infinity;
    this._raycastDirty = true;
    if (planetId === 'mars' && !this.marsDem) this.marsDemLoadPromise = this._loadMarsDem();
    if (planetId === 'moon' && !this.moonDem) void this._loadMoonDem();
    return true;
  }

  getBaseHeight(x, z) {
    // Gas giants, ice giants, and the Sun have no solid surface — return
    // POSITIVE_INFINITY so callers can detect "no walkable ground".
    // Only return Infinity when hasSolidSurface is explicitly false;
    // undefined means assume solid surface (backward compatible).
    if (this.planetConfig?.hasSolidSurface === false) {
      return Number.POSITIVE_INFINITY;
    }
    if (this.planetId === 'mars') {
      const measuredHeight = this._sampleMarsDem(x, z);
      const blend = this._demBlendWeight(x, z);
      const proceduralHeight = this._getProceduralMarsHeight(x, z);
      if (measuredHeight !== null && blend >= 1.0) return measuredHeight;
      if (measuredHeight === null || blend <= 0.0) return proceduralHeight;
      return THREE.MathUtils.lerp(proceduralHeight, measuredHeight, blend);
    }
    if (this.planetConfig.terrainProfile === 'lunar') {
      const measuredHeight = this._sampleMoonDem(x, z);
      if (measuredHeight !== null) {
        const verticalScale = Number(this.moonDem.runtimeScale) || 0.006;
        const verticalReference = Number(this.moonDem.runtimeBaseMeters) || 0;
        const gameBaseHeight = Number(this.moonDem.gameBaseHeight) || 5.5;
        return gameBaseHeight + (measuredHeight - verticalReference) * verticalScale;
      }
      const terrain = this.planetConfig.terrain;
      const broadRelief = this.macroNoise.noise2D(x * 0.008, z * 0.008) * terrain.relief;
      // Smoother highland ridges: 1 - Math.abs() gives rounded crests instead of sharp V-creases
      const ridgeRaw = this.ridgeNoise.noise2D(x * 0.027, z * 0.027);
      const highlands = (1.0 - Math.abs(ridgeRaw)) * (1.0 - Math.abs(ridgeRaw)) * terrain.highlandRelief;
      // Secondary detail noise at higher frequency for fine surface texture
      const detailRelief = this.ridgeNoise.noise2D(x * 0.09, z * 0.09) * 1.2;
      let craterHeight = 0;
      for (const crater of terrain.craters) {
        const distance = Math.hypot(x - crater.x, z - crater.z);
        const normalizedDistance = distance / crater.radius;
        if (normalizedDistance < 1.0) {
          const bowl = 1 - normalizedDistance * normalizedDistance;
          craterHeight -= crater.depth * bowl * bowl;
        } else if (normalizedDistance < 1.28) {
          const rimPhase = (normalizedDistance - 1.0) / 0.28;
          craterHeight += crater.depth * 0.16 * Math.sin(rimPhase * Math.PI);
        }
      }
      return terrain.baseHeight + broadRelief + highlands + detailRelief + craterHeight;
    }

    if (this.planetConfig.terrainProfile === 'mercurian') {
      const terrain = this.planetConfig.terrain;
      const broadRelief = this.macroNoise.noise2D(x * 0.007, z * 0.007) * terrain.relief;
      // Wrinkle-ridge style: smoother ridge crests instead of Math.abs() sharp creases
      const ridgeRaw = this.ridgeNoise.noise2D(x * 0.023, z * 0.023);
      const highlands = (1.0 - Math.abs(ridgeRaw)) * (1.0 - Math.abs(ridgeRaw)) * terrain.highlandRelief;
      // Secondary scarp/wrinkle detail at higher frequency
      const scarpDetail = this.duneNoise.noise2D(x * 0.055, z * 0.055) * 2.0;
      let craterHeight = 0;
      for (const crater of terrain.craters) {
        const distance = Math.hypot(x - crater.x, z - crater.z);
        const normalizedDistance = distance / crater.radius;
        if (normalizedDistance < 1) {
          const bowl = 1 - normalizedDistance * normalizedDistance;
          craterHeight -= crater.depth * bowl * bowl;
        } else if (normalizedDistance < 1.25) {
          craterHeight += crater.depth * 0.14 * Math.sin(((normalizedDistance - 1) / 0.25) * Math.PI);
        }
      }
      return terrain.baseHeight + broadRelief + highlands + scarpDetail + craterHeight;
    }

    if (this.planetConfig.terrainProfile === 'earthlike') {
      const terrain = this.planetConfig.terrain;
      const rolling = this.macroNoise.noise2D(x * 0.0045, z * 0.0045) * terrain.rollingRelief;
      const ridgeSignal = Math.max(0, 1 - Math.abs(this.ridgeNoise.noise2D(x * 0.009, z * 0.009)));
      const mountains = ridgeSignal * ridgeSignal * terrain.mountainRelief;
      const riverCenterZ = -24 + Math.sin(x * 0.012) * 18;
      const riverDistance = Math.abs(z - riverCenterZ);
      const riverChannel = Math.exp(-((riverDistance / 11) ** 2)) * terrain.riverDepth;
      const deltaDistanceSq = (x - 92) ** 2 + (z + 64) ** 2;
      const deltaBasin = Math.exp(-deltaDistanceSq / 1800) * terrain.riverDepth * 0.55;
      const localHills = this.duneNoise.noise2D(x * 0.025, z * 0.025) * 2.2;
      // Secondary erosion detail for fine surface texture
      const erosionDetail = this.canyonNoise.noise2D(x * 0.07, z * 0.07) * 1.0;
      return terrain.baseHeight + rolling + mountains + localHills - riverChannel - deltaBasin + erosionDetail;
    }

    if (this.planetConfig.terrainProfile === 'venusian') {
      const terrain = this.planetConfig.terrain;
      const rolling = this.macroNoise.noise2D(x * 0.005, z * 0.005) * terrain.rollingRelief;
      // Smoother lava-ridge crests: squared falloff instead of Math.abs() sharp creases
      const ridgeRaw = this.ridgeNoise.noise2D(x * 0.018, z * 0.018);
      const lavaRidges = (1.0 - Math.abs(ridgeRaw)) * (1.0 - Math.abs(ridgeRaw)) * terrain.lavaRidgeRelief;
      // Tessera-style folded terrain detail at higher frequency
      const tesseraDetail = this.canyonNoise.noise2D(x * 0.04, z * 0.04) * 1.6;
      let volcanoRelief = 0;
      for (const volcano of terrain.volcanoes) {
        const distance = Math.hypot(x - volcano.x, z - volcano.z);
        const normalizedDistance = Math.max(0, 1 - distance / volcano.radius);
        volcanoRelief += normalizedDistance * normalizedDistance * volcano.height;
      }
      return terrain.baseHeight + rolling + lavaRidges + tesseraDetail + volcanoRelief;
    }

    return this._getProceduralMarsHeight(x, z);
  }

  _getProceduralMarsHeight(x, z) {
    const baseHeight = this._marsGameBaseHeight();
    const broadRelief = this.macroNoise.noise2D(x * 0.0024, z * 0.0024) * 11.0;
    const localRelief = this.macroNoise.noise2D(x * 0.006, z * 0.006) * 5.2;
    const nMacro = broadRelief + localRelief;
    const nDune = (Math.sin(x * 0.028 + Math.cos(z * 0.022) * 1.4) * 0.5 + 0.5) *
                  (this.duneNoise.noise2D(x * 0.014, z * 0.014) * 1.8 + 1.35);

    // Broad, winding canyon floor with an eroded rim and subdued sediment terraces.
    const canyonAxis = -42 + Math.sin(z * 0.004) * 14 + this.canyonNoise.noise2D(z * 0.008, 13.7) * 6;
    const canyonDistance = Math.abs(x - canyonAxis);
    const canyonFloor = -18 * Math.exp(-((canyonDistance / 22) ** 4));
    const canyonRim = 9 * Math.exp(-(((canyonDistance - 32) / 10) ** 2));
    const terraceBand = Math.sin(canyonDistance * 0.34 + this.ridgeNoise.noise2D(z * 0.012, 8.3) * 1.8) *
      1.3 * Math.exp(-Math.abs(canyonDistance - 31) / 54);

    // Rocky Canyon Cliffs & Escarpment (West: X from -16 to -65)
    let cliffH = 0;
    if (x < -16) {
      const t = Math.min(1.0, (-16 - x) / 28.0);
      const smoothCliff = t * t * (3.0 - 2.0 * t);
      const cliffDetail = this.ridgeNoise.noise2D(x * 0.018, z * 0.018) * 3.2;
      const strata = Math.sin((x + this.canyonNoise.noise2D(z * 0.012, 4.2) * 3) * 0.42) * 1.15;
      cliffH = smoothCliff * (18.0 + cliffDetail + strata);
    }

    // Jezero Impact Crater (East: centered around X = 32, Z = -10, radius = 24m)
    const distToCrater = Math.hypot(x - 32, z - (-10));
    let craterH = 0;
    if (distToCrater < 30.0) {
      const normDist = distToCrater / 30.0;
      if (normDist < 0.72) {
        const bowl = Math.cos((normDist / 0.72) * (Math.PI / 2));
        craterH = -bowl * 5.5;
      } else {
        const rimPhase = (normDist - 0.72) / 0.28;
        const rim = Math.sin(rimPhase * Math.PI);
        craterH = rim * 2.0;
      }
    }

    // Landing Site & Base Terrace smoothing around (-12, 12)
    const distToBase = Math.hypot(x - (-12), z - 12);
    const baseWeight = Math.max(0.0, Math.min(1.0, (14.0 - distToBase) / 10.0));
    const warpX = this.canyonNoise.noise2D(x * 0.011 + 17.4, z * 0.011 - 29.1) * 6.5;
    const warpZ = this.canyonNoise.noise2D(x * 0.011 - 41.8, z * 0.011 + 8.6) * 6.5;
    const weatheredX = x + warpX;
    const weatheredZ = z + warpZ;
    const weathering = this.duneNoise.noise2D(weatheredX * 0.045, weatheredZ * 0.045) * 1.15 +
      this.canyonNoise.noise2D(weatheredX * 0.095, weatheredZ * 0.095) * 0.34;
    const fracturedRidge = Math.max(
      0,
      0.54 - Math.abs(this.ridgeNoise.noise2D(weatheredX * 0.023, weatheredZ * 0.023))
    ) * 3.0;
    const talusApron = Math.exp(-Math.abs(canyonDistance - 25) / 13) *
      Math.max(0, this.duneNoise.noise2D(weatheredX * 0.032, weatheredZ * 0.032)) * 2.1;
    const rawHeight = baseHeight + nMacro + nDune + cliffH + canyonFloor + canyonRim + terraceBand + craterH +
      weathering + fracturedRidge + talusApron;
    const terraceHeight = baseHeight - 0.5;
    const habitatTerrace = THREE.MathUtils.lerp(rawHeight, terraceHeight, baseWeight * 0.88);
    const spawnDistance = Math.hypot(x, z + 13);
    const spawnBlendT = THREE.MathUtils.clamp((18 - spawnDistance) / 11, 0, 1);
    const spawnBlend = spawnBlendT * spawnBlendT * (3 - 2 * spawnBlendT);
    return THREE.MathUtils.lerp(habitatTerrace, baseHeight, spawnBlend);
  }

  getHeightAt(x, z) {
    return this.getBaseHeight(x, z);
  }

  getNormalAt(x, z, step = 0.5) {
    const hL = this.getBaseHeight(x - step, z);
    const hR = this.getBaseHeight(x + step, z);
    const hD = this.getBaseHeight(x, z - step);
    const hU = this.getBaseHeight(x, z + step);
    const normal = new THREE.Vector3(hL - hR, 2.0 * step, hD - hU);
    return normal.normalize();
  }

  sampleDensity(x, y, z) {
    // Collision and mesh normals must use the same sampled field as Marching Cubes.
    // Re-evaluating the analytic spheres here creates invisible walls/floors where
    // their exact surface differs from the voxel-interpolated rendered surface.
    const chunk = this.chunks.get(`${Math.floor(x / this.chunkSize)},${Math.floor(y / this.chunkHeight)},${Math.floor(z / this.chunkSize)}`);
    if (chunk && !chunk.isHomogeneousAir && !chunk.isHomogeneousSolid) {
      const gx = (x - chunk.startX) / chunk.stepX;
      const gy = (y - chunk.minY) / chunk.stepY;
      const gz = (z - chunk.startZ) / chunk.stepZ;
      const ix = Math.min(chunk.rx - 2, Math.max(0, Math.floor(gx)));
      const iy = Math.min(chunk.ry - 2, Math.max(0, Math.floor(gy)));
      const iz = Math.min(chunk.rz - 2, Math.max(0, Math.floor(gz)));
      const tx = gx - ix, ty = gy - iy, tz = gz - iz;
      const d = chunk.densities;
      const i = chunk.getIndex(ix, iy, iz);
      const row = chunk.rx, plane = row * chunk.ry;
      const a = d[i] * (1 - tx) + d[i + 1] * tx;
      const b = d[i + row] * (1 - tx) + d[i + row + 1] * tx;
      const c = d[i + plane] * (1 - tx) + d[i + plane + 1] * tx;
      const e = d[i + plane + row] * (1 - tx) + d[i + plane + row + 1] * tx;
      return (a * (1 - ty) + b * ty) * (1 - tz) + (c * (1 - ty) + e * ty) * tz;
    }

    const surfaceHeight = this.getBaseHeight(x, z);
    let d = surfaceHeight - y;

    if (this.planetId === 'mars' && y >= surfaceHeight - 3.5 && y <= surfaceHeight + 4.5) {
      d = Math.max(d, this._sampleMarsBoulders(x, y, z));
    } else if (y >= surfaceHeight - 3.5 && y <= surfaceHeight + 4.5) {
      const rockId = this.planetId;
      if (rockId === 'moon' || rockId === 'mercury' || rockId === 'venus' || rockId === 'earth') {
        d = Math.max(d, this._sampleSurfaceRocks(x, y, z, rockId));
      }
    }

    // Natural caves below surface - 5.5m
    if (y < surfaceHeight - 5.5) {
      const caveN = this.caveNoise.noise3D(x * 0.035, y * 0.035, z * 0.035);
      if (caveN > 0.46) {
        d -= (caveN - 0.46) * 20.0;
      }
    }

    // Spatial lookup of persistent edits for the 3D chunk containing (x, y, z)
    const cx = Math.floor(x / this.chunkSize);
    const cy = Math.floor(y / this.chunkHeight);
    const cz = Math.floor(z / this.chunkSize);
    const localEdits = this.persistentEdits.get(`${cx},${cy},${cz}`);
    if (localEdits) {
      for (let i = 0; i < localEdits.length; i++) {
        const edit = localEdits[i];
        const dx = x - edit.x;
        const dy = y - edit.y;
        const dz = z - edit.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        const maxR = edit.radius;
        if (distSq < maxR * maxR) {
          const dist = Math.sqrt(distSq);
          if (edit.op === 'fill') {
            d = Math.max(d, edit.radius - dist);
          } else {
            d = Math.min(d, dist - edit.radius);
          }
        }
      }
    }

    return d;
  }

  _sampleMarsBoulders(x, y, z) {
    const spacing = 18;
    const cellX = Math.floor(x / spacing);
    const cellZ = Math.floor(z / spacing);
    let density = -Infinity;

    for (let offsetX = -1; offsetX <= 1; offsetX++) {
      for (let offsetZ = -1; offsetZ <= 1; offsetZ++) {
        const gridX = cellX + offsetX;
        const gridZ = cellZ + offsetZ;
        let hash = (Math.imul(gridX, 374761393) ^ Math.imul(gridZ, 668265263) ^ Math.imul(this.seed, 2246822519)) >>> 0;
        hash = Math.imul(hash ^ (hash >>> 13), 1274126177) >>> 0;
        const coverage = hash % 100;
        if (coverage < 37) continue;

        const random = (salt) => {
          let value = (hash ^ Math.imul(salt, 0x45d9f3b)) >>> 0;
          value = Math.imul(value ^ (value >>> 16), 0x45d9f3b) >>> 0;
          value = Math.imul(value ^ (value >>> 16), 0x45d9f3b) >>> 0;
          return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
        };
        const centerX = (gridX + 0.2 + random(11) * 0.6) * spacing;
        const centerZ = (gridZ + 0.2 + random(19) * 0.6) * spacing;
        if (centerX * centerX + (centerZ + 13) ** 2 < 100) continue;
        if ((centerX + 12) ** 2 + (centerZ - 12) ** 2 < 400) continue;
        const radius = 0.72 + random(23) * 1.48;
        const centerY = this.getBaseHeight(centerX, centerZ) + radius * 0.38;
        const dx = x - centerX;
        const dy = y - centerY;
        const dz = z - centerZ;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const roughRadius = radius + this.ridgeNoise.noise3D(dx * 0.72, dy * 0.72, dz * 0.72) * radius * 0.12;
        density = Math.max(density, roughRadius - distance);
      }
    }

    return density;
  }

  // Planet-appropriate surface rock / boulder sampling for non-Mars rocky worlds.
  // Uses deterministic hash placement with planet-specific coverage, size, and spacing.
  _sampleSurfaceRocks(x, y, z, planetId) {
    const rockParams = {
      moon:  { spacing: 14, coverage: 28, radiusMin: 0.5, radiusMax: 1.2, heightOffset: 0.35 },
      mercury: { spacing: 16, coverage: 22, radiusMin: 0.4, radiusMax: 1.0, heightOffset: 0.3 },
      venus:   { spacing: 20, coverage: 18, radiusMin: 0.6, radiusMax: 1.5, heightOffset: 0.4 },
      earth:   { spacing: 24, coverage: 15, radiusMin: 0.5, radiusMax: 1.3, heightOffset: 0.4 }
    };
    const p = rockParams[planetId];
    if (!p) return -Infinity;

    const spacing = p.spacing;
    const cellX = Math.floor(x / spacing);
    const cellZ = Math.floor(z / spacing);
    let density = -Infinity;

    for (let offsetX = -1; offsetX <= 1; offsetX++) {
      for (let offsetZ = -1; offsetZ <= 1; offsetZ++) {
        const gridX = cellX + offsetX;
        const gridZ = cellZ + offsetZ;
        let hash = (Math.imul(gridX, 374761393) ^ Math.imul(gridZ, 668265263) ^ Math.imul(this.seed, 2246822519)) >>> 0;
        hash = Math.imul(hash ^ (hash >>> 13), 1274126177) >>> 0;
        const coverage = hash % 100;
        if (coverage < p.coverage) continue;

        const random = (salt) => {
          let value = (hash ^ Math.imul(salt, 0x45d9f3b)) >>> 0;
          value = Math.imul(value ^ (value >>> 16), 0x45d9f3b) >>> 0;
          value = Math.imul(value ^ (value >>> 16), 0x45d9f3b) >>> 0;
          return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
        };
        const centerX = (gridX + 0.2 + random(11) * 0.6) * spacing;
        const centerZ = (gridZ + 0.2 + random(19) * 0.6) * spacing;
        const radius = p.radiusMin + random(23) * (p.radiusMax - p.radiusMin);
        const centerY = this.getBaseHeight(centerX, centerZ) + radius * p.heightOffset;
        const dx = x - centerX;
        const dy = y - centerY;
        const dz = z - centerZ;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const roughRadius = radius + this.ridgeNoise.noise3D(dx * 0.72, dy * 0.72, dz * 0.72) * radius * 0.12;
        density = Math.max(density, roughRadius - distance);
      }
    }

    return density;
  }

  sampleNormal(x, y, z, eps = 0.25) {
    const dx = this.sampleDensity(x + eps, y, z) - this.sampleDensity(x - eps, y, z);
    const dy = this.sampleDensity(x, y + eps, z) - this.sampleDensity(x, y - eps, z);
    const dz = this.sampleDensity(x, y, z + eps) - this.sampleDensity(x, y, z - eps);

    const len = Math.hypot(dx, dy, dz);
    if (len < 1e-5) {
      return { x: 0, y: 1, z: 0 };
    }
    // Density decreases outwards into air, so outward normal into air cavity is -gradient
    return { x: -dx / len, y: -dy / len, z: -dz / len };
  }

  getWalkableFloor(x, y, z, searchDist = 18.0) {
    const cx = Math.floor(x / this.chunkSize);
    const cy = Math.floor(y / this.chunkHeight);
    const cz = Math.floor(z / this.chunkSize);

    // Collect candidate meshes in immediate neighborhood
    const candidateMeshes = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const key = `${cx + dx},${cy + dy},${cz + dz}`;
          const chunk = this.chunks.get(key);
          if (chunk && chunk.mesh && chunk.mesh.geometry) {
            candidateMeshes.push(chunk.mesh);
          }
        }
      }
    }

    const surfChunk = this.chunks.get(`${cx},0,${cz}`);
    if (surfChunk && surfChunk.mesh && !candidateMeshes.includes(surfChunk.mesh)) {
      candidateMeshes.push(surfChunk.mesh);
    }

    if (candidateMeshes.length > 0) {
      // Cast down from above the query point so we find the nearest solid floor below
      this._floorRayOrigin.set(x, y + 0.45, z);
      this._floorRaycaster.set(this._floorRayOrigin, this._floorRayDir);
      this._floorRaycaster.far = searchDist + 6.0;

      const hits = this._floorRaycaster.intersectObjects(candidateMeshes, false);
      if (hits.length > 0) {
        // Sort hits by distance (nearest first) and return the first hit at or below the query point
        hits.sort((a, b) => a.distance - b.distance);
        for (const hit of hits) {
          const hitY = hit.point.y;
          if (hitY <= y + 0.45) {
            // The rendered triangles are authoritative floors. Testing an analytic
            // boundary here rejected valid voxel surfaces and fell back below them.
            if (hit.face && hit.face.normal.y > 0.05) {
              return hitY;
            }
          }
        }
      }
    }

    // Density-based fallback: scan downward to find solid floor below excavated holes.
    // Solid bedrock chunks (isHomogeneousSolid) skip mesh generation for performance,
    // so mesh raycasting above can find no candidate geometry below the player.
    // sampleDensity() combines getBaseHeight() with persistent edits and works for
    // any world position regardless of whether the chunk is loaded, so a downward
    // density scan reliably finds the bottom of an excavated hole or the natural
    // bedrock surface without creating an invisible floor at the old terrain height.
    const stepSize = 0.5;
    const maxSteps = Math.ceil(searchDist / stepSize);
    let prevD = this.sampleDensity(x, y, z);
    for (let i = 1; i <= maxSteps; i++) {
      const testY = y - i * stepSize;
      const d = this.sampleDensity(x, testY, z);
      if (prevD < 0 && d >= 0) {
        // Air-to-solid boundary found; interpolate for sub-step accuracy
        const t = prevD / (prevD - d + 1e-6);
        return y - (i - 1 + t) * stepSize;
      }
      prevD = d;
    }

    // Deep underground or inside an open vertical shaft: no solid floor below.
    return -Infinity;
  }

  // Saaper floor query for physics bodies (rover, dropped items): prefers the
  // measured terrain mesh, but never falls through to a teleporting offset.
  getFloorHeightForBody(x, y, z, searchDist = 18.0) {
    const floorY = this.getWalkableFloor(x, y, z, searchDist);
    if (!Number.isFinite(floorY)) return this.getBaseHeight(x, z);
    // Reject the old teleporting fallback (y - searchDist) if it sits far below surface
    const surfaceH = this.getBaseHeight(x, z);
    if (floorY < surfaceH - searchDist - 0.5) return surfaceH;
    return floorY;
  }

  getGeologyAt(x, y, z) {
    const surfaceH = this.getBaseHeight(x, z);
    const depth = surfaceH - y;

    if (this.planetConfig.terrainProfile === 'lunar') {
      if (depth < 2.5) {
        return { layer: 'LUNAR_REGOLITH', item: 'lunar_regolith', name_mn: 'Сарны реголит', desc_mn: 'Сарны гадаргын бутлагдсан базальтлаг тоос, чулуулгийн хольц', color: new THREE.Color(0x85878a), hardness: 1.5 };
      }
      if (depth < 18) {
        return { layer: 'LUNAR_BRECCIA', item: 'basalt', name_mn: 'Цохилтын брекчи', desc_mn: 'Солирын мөргөлдөөнөөр үүссэн чулуулгийн хэлтэрхий', color: new THREE.Color(0x64676a), hardness: 4.0 };
      }
      return { layer: 'LUNAR_BASALT', item: 'basalt', name_mn: 'Сарны базальт', desc_mn: 'Эртний галт уулын лаавын хатуурсан суурь чулуулаг', color: new THREE.Color(0x3e4145), hardness: 6.0 };
    }

    if (this.planetConfig.terrainProfile === 'mercurian') {
      if (depth < 3) return { layer: 'MERCURIAN_REGOLITH', item: 'mercury_regolith', name_mn: 'Будын реголит', desc_mn: 'Нарны салхи, цохилтын нөлөөгөөр бутарсан хуурай гадаргын хөрс', color: new THREE.Color(0x8c8274), hardness: 1.8 };
      if (depth < 20) return { layer: 'IMPACT_BRECCIA', item: 'basalt', name_mn: 'Цохилтын брекчи', desc_mn: 'Олон үеийн солирын мөргөлдөөнөөр үүссэн чулуулгийн хольц', color: new THREE.Color(0x5d5a56), hardness: 4.5 };
      return { layer: 'MERCURIAN_BEDROCK', item: 'rare_metals', name_mn: 'Металллаг суурь чулуулаг', desc_mn: 'Төмөр, никель агуулсан нягт чулуулгийн бүс', color: new THREE.Color(0x37383c), hardness: 7.0 };
    }

    if (this.planetConfig.terrainProfile === 'earthlike') {
      if (depth < 2.5) {
        return { layer: 'TERRESTRIAL_SOIL', item: 'terrestrial_soil', name_mn: 'Дэлхийн өнгөн хөрс', desc_mn: 'Органик бодис, эрдэс агуулсан гадаргын хөрс', color: new THREE.Color(0x526b42), hardness: 1.2 };
      }
      if (depth < 12) {
        return { layer: 'RIVER_SEDIMENT', item: 'river_sediment', name_mn: 'Голын тунамал', desc_mn: 'Усны урсгалаар зөөгдөж хуримтлагдсан давхарга', color: new THREE.Color(0x82775e), hardness: 2.8 };
      }
      return { layer: 'CONTINENTAL_BEDROCK', item: 'granite', name_mn: 'Эх газрын суурь чулуулаг', desc_mn: 'Эх газрын царцдасын хатуу силикат чулуулаг', color: new THREE.Color(0x555e58), hardness: 6.2 };
    }

    if (this.planetConfig.terrainProfile === 'venusian') {
      if (depth < 3) return { layer: 'VOLCANIC_ASH', item: 'volcanic_ash', name_mn: 'Галт уулын үнс', desc_mn: 'Халуун галт уулын бүсэд тунасан эрдэс үнс', color: new THREE.Color(0xa77546), hardness: 1.9 };
      if (depth < 20) return { layer: 'LAVA_FLOW', item: 'basalt', name_mn: 'Хатуурсан лаав', desc_mn: 'Базальтлаг лаавын урсгалын давхарга', color: new THREE.Color(0x514035), hardness: 5.8 };
      return { layer: 'VOLCANIC_BEDROCK', item: 'sulfur', name_mn: 'Галт уулын эрдэс', desc_mn: 'Хүхэрлэг нэгдэл бүхий галт уулын чулуулгийн бүс', color: new THREE.Color(0x65513c), hardness: 5.0 };
    }

    const veinN = this.ridgeNoise.noise3D(x * 0.055 + 12.3, y * 0.075, z * 0.055 + 45.7);
    const iceN = this.duneNoise.noise3D(x * 0.045 + 50.1, y * 0.045, z * 0.045 + 88.2);
    const fractureN = this.canyonNoise.noise3D(x * 0.065, y * 0.065, z * 0.065);

    // Layer 1: Surface Regolith (0m to 2.5m)
    if (depth < 2.5) {
      return {
        layer: 'REGOLITH',
        item: 'martian_regolith',
        name_mn: 'Ангарагийн хөрс (Реголит)',
        desc_mn: 'Сул шороо, нарийн ширхэгт гадаргын улаан тоосонцор',
        color: new THREE.Color(0xa66c4e),
        hardness: 1.5
      };
    }

    // Layer 2: Subsurface Permafrost Ice Lenses (2.5m to 8.0m)
    if (depth < 8.0) {
      if (iceN > 0.40) {
        return {
          layer: 'PERMAFROST_ICE',
          item: 'ice_chunk',
          name_mn: 'Гүний мөс (H₂O)',
          desc_mn: 'Цан хүүрэгт гүний мөс, усны үндсэн нөөц',
          color: new THREE.Color(0x90e4f5),
          hardness: 2.5
        };
      }
      return {
        layer: 'COMPACTED_REGOLITH',
        item: 'martian_regolith',
        name_mn: 'Нягтарсан хөрс',
        desc_mn: 'Шахагдсан өтгөн Ангарагийн суурь шороо',
        color: new THREE.Color(0x8a5538),
        hardness: 2.2
      };
    }

    // Layer 3: Sedimentary Strata & Sandstone (8.0m to 25.0m)
    if (depth < 25.0) {
      if (veinN > 0.44) {
        return {
          layer: 'HEMATITE_DEPOSIT',
          item: 'iron_ore',
          name_mn: 'Гематит (Төмрийн хүдэр Fe₂O₃)',
          desc_mn: 'Төмрийн исэлт баялаг хүрэн улаан эрдэс',
          color: new THREE.Color(0x7e3428),
          hardness: 5.0
        };
      }
      return {
        layer: 'SEDIMENTARY_STRATA',
        item: 'sedimentary_rock',
        name_mn: 'Тунамал элсэн чулуу',
        desc_mn: 'Эртний голын дельтагийн давхаргат тогтоц',
        color: new THREE.Color(0x6e4a36),
        hardness: 3.5
      };
    }

    // Layer 4: Mineral Vein Zone (25.0m to 60.0m)
    if (depth < 60.0) {
      if (veinN > 0.52) {
        return {
          layer: 'COPPER_VEIN',
          item: 'copper_ore',
          name_mn: 'Халкопирит (Зэсийн хүдэр CuFeS₂)',
          desc_mn: 'Цахилгаан дамжуулагч хэлхээний металл',
          color: new THREE.Color(0xc6783c),
          hardness: 4.8
        };
      }
      if (veinN < -0.52) {
        return {
          layer: 'SULFUR_VEIN',
          item: 'sulfur',
          name_mn: 'Хүхрийн талст (S₈)',
          desc_mn: 'Химийн батерей, урвалын эх үүсвэр',
          color: new THREE.Color(0xded030),
          hardness: 2.2
        };
      }
      return {
        layer: 'FRACTURED_BEDROCK',
        item: 'basalt',
        name_mn: 'Хагарсан базальт чулуулаг',
        desc_mn: 'Тектоник хүчээр хагарсан гүний чулуулаг',
        color: new THREE.Color(0x423832),
        hardness: 5.2
      };
    }

    // Layer 5: Deep Basaltic Bedrock & Quartz (60.0m to 100.0m)
    if (depth < 100.0) {
      if (fractureN > 0.52) {
        return {
          layer: 'QUARTZ_VEIN',
          item: 'quartz_crystal',
          name_mn: 'Кварцын талст (SiO₂)',
          desc_mn: 'Оптик болон микро-схем үйлдвэрлэлийн эрдэс',
          color: new THREE.Color(0xdff2fc),
          hardness: 7.0
        };
      }
      return {
        layer: 'BASALT_BEDROCK',
        item: 'basalt',
        name_mn: 'Базальт (Галт уулын суурь чулуулаг)',
        desc_mn: 'Өндөр нягттай хатуу галт уулын суурь',
        color: new THREE.Color(0x28221e),
        hardness: 6.5
      };
    }

    // Layer 6: Deep Plutonic Mantle Bedrock (100.0m+ depth)
    return {
      layer: 'DEEP_PLUTONIC_BEDROCK',
      item: 'basalt',
      name_mn: 'Гүний плутоник суурь чулуу',
      desc_mn: 'Ангарагийн царцдасын гүний өндөр даралтат тогтоц',
      color: new THREE.Color(0x1a1614),
      hardness: 8.0
    };
  }

  carveSphere(hitPoint, radius = 1.8, isFill = false) {
    if (![hitPoint?.x, hitPoint?.y, hitPoint?.z, radius].every(Number.isFinite) || radius <= 0) {
      return { success: false, modifiedChunks: 0, modifiedVoxels: 0, yieldCount: 0 };
    }
    // Apply exactly the record that will be replayed after save/load.
    hitPoint = {
      x: Math.round(hitPoint.x * 100) / 100,
      y: Math.round(hitPoint.y * 100) / 100,
      z: Math.round(hitPoint.z * 100) / 100
    };
    radius = Math.max(0.1, Math.round(radius * 10) / 10);
    const margin = 1.5;
    const minX = hitPoint.x - radius - margin;
    const maxX = hitPoint.x + radius + margin;
    const minY = hitPoint.y - radius - margin;
    const maxY = hitPoint.y + radius + margin;
    const minZ = hitPoint.z - radius - margin;
    const maxZ = hitPoint.z + radius + margin;

    const minCx = Math.floor(minX / this.chunkSize);
    const maxCx = Math.floor(maxX / this.chunkSize);
    const minCy = Math.floor(minY / this.chunkHeight);
    const maxCy = Math.floor(maxY / this.chunkHeight);
    const minCz = Math.floor(minZ / this.chunkSize);
    const maxCz = Math.floor(maxZ / this.chunkSize);

    let modifiedCount = 0;
    let totalModifiedVoxels = 0;
    const modifiedChunkKeys = [];

    const editRecord = {
      x: Math.round(hitPoint.x * 100) / 100,
      y: Math.round(hitPoint.y * 100) / 100,
      z: Math.round(hitPoint.z * 100) / 100,
      radius: Math.round(radius * 10) / 10,
      op: isFill ? 'fill' : 'carve',
      timestamp: Date.now()
    };

    this.allEdits.push(editRecord);
    // Never evict edits: loaded meshes, collision, streaming and saves must
    // describe the same history. Silent eviction used to resurrect old terrain.

    // Use the same spatial index for live digs and save replay.
    this._distributeEditToChunks(editRecord);

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        for (let cz = minCz; cz <= maxCz; cz++) {
          const key = `${cx},${cy},${cz}`;
          let chunk = this.chunks.get(key);
          if (!chunk) {
            // Note: initDensities() already applies persistentEdits (including editRecord)!
            chunk = new VolumetricChunk(cx, cy, cz, this);
            this.chunks.set(key, chunk);
            chunk.generateMesh();
            modifiedCount++;
            modifiedChunkKeys.push(key);
          } else {
            const changedVoxels = chunk.applyCarveInternal(hitPoint.x, hitPoint.y, hitPoint.z, radius, isFill);
            if (changedVoxels > 0) {
              totalModifiedVoxels += changedVoxels;
              chunk.generateMesh();
              modifiedCount++;
              modifiedChunkKeys.push(key);
            }
          }
        }
      }
    }

    this.saveEditsToStorage();
    if (typeof this.onTerrainModified === 'function') {
      this.onTerrainModified();
    }

    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    const yieldCount = Math.max(1, Math.round(volume * 0.35));
    const geo = this.getGeologyAt(hitPoint.x, hitPoint.y, hitPoint.z);

    return {
      success: modifiedCount > 0 || totalModifiedVoxels > 0,
      modifiedChunks: modifiedCount,
      modifiedChunkKeys,
      modifiedVoxels: totalModifiedVoxels,
      volumeMined: volume,
      yieldItem: geo.item,
      yieldCount: yieldCount,
      layer: geo.layer,
      name_mn: geo.name_mn,
      desc_mn: geo.desc_mn
    };
  }

  update(playerPos, force = false) {
    if (!force) {
      const dxMove = playerPos.x - this._lastUpdateX;
      const dyMove = playerPos.y - this._lastUpdateY;
      const dzMove = playerPos.z - this._lastUpdateZ;
      if (dxMove * dxMove + dyMove * dyMove + dzMove * dzMove < 9.0) {
        return; // Player moved < 3.0m; active chunk bubble unchanged
      }
    }
    this._lastUpdateX = playerPos.x;
    this._lastUpdateY = playerPos.y;
    this._lastUpdateZ = playerPos.z;

    const cx = Math.floor(playerPos.x / this.chunkSize);
    const cy = Math.floor(playerPos.y / this.chunkHeight);
    const cz = Math.floor(playerPos.z / this.chunkSize);

    const neededKeys = new Set();
    const R = this.activeRadius; // Horizontal chunk radius

    // Stream vertical layers around player (down to -144m = cy: -6)
    const minCy = Math.max(-6, Math.min(cy - 1, -1));
    const maxCy = Math.max(1, Math.min(2, cy + 1));

    for (let dx = -R; dx <= R; dx++) {
      for (let dz = -R; dz <= R; dz++) {
        const curCx = cx + dx;
        const curCz = cz + dz;

        for (let curCy = minCy; curCy <= maxCy; curCy++) {
          const key = `${curCx},${curCy},${curCz}`;
          neededKeys.add(key);

          let chunk = this.chunks.get(key);
          if (!chunk) {
            chunk = new VolumetricChunk(curCx, curCy, curCz, this);
            this.chunks.set(key, chunk);
            chunk.generateMesh();
          }
        }
      }
    }

    // Unload distant chunks outside active bubble
    for (const [key, chunk] of this.chunks.entries()) {
      if (!neededKeys.has(key)) {
        chunk.dispose();
        this.chunks.delete(key);
      }
    }
  }

  getChunkResolution(chunkX, chunkZ) {
    const centerX = (chunkX + 0.5) * this.chunkSize;
    const centerZ = (chunkZ + 0.5) * this.chunkSize;
    const distance = Math.hypot(
      centerX - this._lastUpdateX,
      centerZ - this._lastUpdateZ,
    );
    if (distance <= this.chunkSize * 1.5) return 25;
    if (distance <= this.chunkSize * 3.25) return 17;
    return 13;
  }

  getRaycastMeshes() {
    if (this._raycastDirty) {
      this._raycastMeshesCache.length = 0;
      for (const chunk of this.chunks.values()) {
        if (chunk.mesh) this._raycastMeshesCache.push(chunk.mesh);
      }
      this._raycastDirty = false;
    }
    return this._raycastMeshesCache;
  }
}
