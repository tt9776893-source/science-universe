import { edgeTable, triTable } from 'three/examples/jsm/objects/MarchingCubes.js';

// Test single cube polygonization with ground at y=0
const isol = 0.0;
// Test cube from x: 0..1, y: -0.5..0.5, z: 0..1
// Ground is at y=0, so bottom 4 corners have y=-0.5 (density > 0, solid)
// top 4 corners have y=0.5 (density < 0, air)

// Corners according to Three.js MarchingCubes:
// 0: [0,0,0], 1: [1,0,0], 2: [0,1,0], 3: [1,1,0], 4: [0,0,1], 5: [1,0,1], 6: [0,1,1], 7: [1,1,1]
// Where:
// bottom y=0: 0, 1, 4, 5 -> solid (d = +0.5)
// top y=1: 2, 3, 6, 7 -> air (d = -0.5)

const densities = {
  0: 0.5,
  1: 0.5,
  2: -0.5,
  3: -0.5,
  4: 0.5,
  5: 0.5,
  6: -0.5,
  7: -0.5
};

let cubeindex = 0;
if (densities[0] < isol) cubeindex |= 1;
if (densities[1] < isol) cubeindex |= 2;
if (densities[2] < isol) cubeindex |= 8;
if (densities[3] < isol) cubeindex |= 4;
if (densities[4] < isol) cubeindex |= 16;
if (densities[5] < isol) cubeindex |= 32;
if (densities[6] < isol) cubeindex |= 128;
if (densities[7] < isol) cubeindex |= 64;

console.log('cubeindex:', cubeindex, 'bits:', edgeTable[cubeindex]);
const triOffset = cubeindex * 16;
const tris = [];
for (let i = 0; triTable[triOffset + i] !== -1; i += 3) {
  tris.push([triTable[triOffset + i], triTable[triOffset + i + 1], triTable[triOffset + i + 2]]);
}
console.log('Generated triangles (edge indices):', tris);
