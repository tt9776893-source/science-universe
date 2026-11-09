import * as THREE from 'three';
import { MARS_GRAVITY, PLANET_GRAVITY } from '../core/Constants.js';

/**
 * Planetary Physics Engine calibrated for per-planet gravity.
 * Handles dynamic falling bodies, loose ore drops, terrain collision, and stability checks.
 */
export class PhysicsManager {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;
    this.gravity = terrain.planetConfig?.gravityMps2 || MARS_GRAVITY;
    this.bodies = []; // Active rigidbodies
  }

  setPlanetGravity(planetId) {
    const g = PLANET_GRAVITY[planetId] || MARS_GRAVITY;
    if (this.gravity === g) return;
    this.gravity = g;
    // Wake any resting bodies so they settle under the new gravity
    for (const b of this.bodies) {
      if (b.isResting) b.isResting = false;
    }
  }

  _restitutionForGravity(g) {
    // Higher gravity surfaces are more rigid -> lower bounce.
    // Venus/Earth: hard rock, low bounce. Moon/Mercury: regolith, moderate bounce.
    if (g >= 8.0) return 0.22;
    if (g >= 3.0) return 0.28;
    return 0.35; // low-gravity bodies (Moon)
  }

  /**
   * Spawns a physical collectible / dropped item that falls under local gravity
   */
  spawnPhysicsDrop(itemId, position, initialVelocity = null, mesh = null) {
    if (!mesh) {
      // Default mineral drop geometry
      const geo = new THREE.DodecahedronGeometry(0.25, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: itemId.includes('ice') ? 0x90e0ef : (itemId.includes('iron') ? 0x8b3a2b : 0x5a4d41),
        roughness: 0.7,
        metalness: 0.2
      });
      mesh = new THREE.Mesh(geo, mat);
    }

    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const restitution = this._restitutionForGravity(this.gravity);

    const body = {
      id: `drop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      itemId: itemId,
      mesh: mesh,
      position: mesh.position,
      velocity: (initialVelocity && initialVelocity.isVector3)
        ? initialVelocity
        : (initialVelocity
          ? new THREE.Vector3(initialVelocity.x || 0, initialVelocity.y || 0, initialVelocity.z || 0)
          : new THREE.Vector3(
            (Math.random() - 0.5) * 1.5,
            Math.random() * 2.0 + 1.0,
            (Math.random() - 0.5) * 1.5
          )),
      mass: 2.5, // kg
      radius: 0.25,
      restitution: restitution,
      friction: 0.82,
      isResting: false,
      lifetime: 300 // 5 minutes persistence
    };

    this.bodies.push(body);
    return body;
  }

  /**
   * Checks stability of any placed objects or loose drops when terrain is carved
   */
  onTerrainCarved(hitPoint, radius) {
    const rSq = (radius + 1.5) * (radius + 1.5);
    for (const body of this.bodies) {
      const distSq = body.position.distanceToSquared(hitPoint);
      if (distSq < rSq) {
        // Wake up resting body to fall into newly carved hole
        body.isResting = false;
        body.velocity.y -= 0.5;
      }
    }
  }

  update(delta) {
    for (let i = this.bodies.length - 1; i >= 0; i--) {
      const b = this.bodies[i];
      b.lifetime -= delta;
      if (b.lifetime <= 0) {
        this.scene.remove(b.mesh);
        b.mesh.geometry?.dispose();
        this.bodies.splice(i, 1);
        continue;
      }

      if (b.isResting) continue;

      // 1. Apply Martian gravity
      b.velocity.y -= this.gravity * delta;

      // 2. Air drag (thin Martian CO2 atmosphere: very low drag)
      b.velocity.x *= (1.0 - 0.04 * delta);
      b.velocity.z *= (1.0 - 0.04 * delta);

      // 3. Integrate position
      b.position.x += b.velocity.x * delta;
      b.position.y += b.velocity.y * delta;
      b.position.z += b.velocity.z * delta;

      // 4. Ground collision with terrain
      const floorY = this.terrain.getFloorHeightForBody(b.position.x, b.position.y, b.position.z);
      const contactY = floorY + b.radius;

      if (b.position.y <= contactY) {
        b.position.y = contactY;

        // Bounce response
        if (Math.abs(b.velocity.y) > 0.4) {
          b.velocity.y = -b.velocity.y * b.restitution;
          b.velocity.x *= b.friction;
          b.velocity.z *= b.friction;
        } else {
          b.velocity.set(0, 0, 0);
          b.isResting = true;
        }

        // Slope sliding check
        const normal = this.terrain.getNormalAt(b.position.x, b.position.z);
        if (normal.y < 0.85) {
          // Slide down steep slopes
          b.isResting = false;
          b.velocity.x += normal.x * this.gravity * delta * 0.8;
          b.velocity.z += normal.z * this.gravity * delta * 0.8;
        }
      }

      // Sync mesh
      b.mesh.position.copy(b.position);
      if (!b.isResting) {
        b.mesh.rotation.x += b.velocity.z * delta * 2.0;
        b.mesh.rotation.z -= b.velocity.x * delta * 2.0;
      }
    }
  }

  clearDrops() {
    for (const b of this.bodies) {
      if (b.mesh) {
        this.scene.remove(b.mesh);
        b.mesh.geometry?.dispose();
      }
    }
    this.bodies.length = 0;
  }

  getNearbyDrops(playerPos, pickupRadius = 2.4) {
    const found = [];
    for (let i = this.bodies.length - 1; i >= 0; i--) {
      const b = this.bodies[i];
      if (b.position.distanceTo(playerPos) <= pickupRadius) {
        found.push(b);
        this.scene.remove(b.mesh);
        b.mesh.geometry?.dispose();
        this.bodies.splice(i, 1);
      }
    }
    return found;
  }
}
