import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class AssetRegistry {
  constructor() {
    this.loader = new GLTFLoader();
    this.cache = new Map();
    this.resourceMetadata = new Map();
    this.toolMetadata = new Map();
    this.loadedCount = 0;
    this.totalToLoad = 0;
    this.basePath = '/assets';
  }

  async detectBasePath() {
    const portNum = parseInt(window.location.port, 10);
    const isLiveServer = (portNum >= 5500 && portNum <= 5599) || window.location.pathname.includes('/public/');
    const candidates = isLiveServer
      ? ['/public/assets', './public/assets', '/assets', './assets']
      : ['/assets', './assets', '/public/assets', './public/assets'];

    for (const p of candidates) {
      try {
        const res = await fetch(`${p}/data/resources.json`);
        if (res.ok) {
          this.basePath = p;
          console.log(`[AssetRegistry] Successfully resolved asset base path: ${p}`);
          return p;
        }
      } catch (e) {}
    }
    this.basePath = isLiveServer ? '/public/assets' : '/assets';
    return this.basePath;
  }

  async init(onProgress) {
    await this.detectBasePath();

    // 1. Fetch metadata
    try {
      const res = await fetch(`${this.basePath}/data/resources.json`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.resources || Object.values(data));
        for (const r of list) {
          if (r.file) this.resourceMetadata.set(r.file, r);
          if (r.id) this.resourceMetadata.set(r.id, r);
          if (r.inventory_id) this.resourceMetadata.set(r.inventory_id, r);
        }
      }
    } catch (e) {
      console.warn('[AssetRegistry] Failed to load resources.json:', e);
    }

    // Preload all 12 Interactive Tools + Essential World & Building Models
    const essentialModels = [
      // All 12 Tools
      { cat: 'tools', file: 'SU_Mining_Laser_MK1.glb' },
      { cat: 'tools', file: 'SU_Rock_Hammer.glb' },
      { cat: 'tools', file: 'SU_Thermal_Drill.glb' },
      { cat: 'tools', file: 'SU_Terrain_Manipulator.glb' },
      { cat: 'tools', file: 'SU_Sample_Collector.glb' },
      { cat: 'tools', file: 'SU_Geological_Scanner.glb' },
      { cat: 'tools', file: 'SU_Multispectral_Scanner.glb' },
      { cat: 'tools', file: 'SU_GPR_Radar.glb' },
      { cat: 'tools', file: 'SU_Construction_Tool.glb' },
      { cat: 'tools', file: 'SU_Welding_Tool.glb' },
      { cat: 'tools', file: 'SU_Repair_Tool.glb' },
      { cat: 'tools', file: 'SU_Portable_Analyzer.glb' },

      // Character & Hands
      { cat: 'character', file: 'SU_Suit_FirstPerson_Hands.glb' },

      // Vehicles (Explorer Rover)
      { cat: 'vehicles', file: 'SU_Vehicle_Explorer_Rover.glb' },

      // Modular Buildings (Pack 02)
      { cat: 'buildings', file: 'SU_Base_B_Scientific_Research_Center.glb' },
      { cat: 'buildings', file: 'SU_Base_Hab_Living.glb' },
      { cat: 'buildings', file: 'SU_Base_Hab_Research.glb' },
      { cat: 'buildings', file: 'SU_Base_Airlock.glb' },
      { cat: 'buildings', file: 'SU_Base_Door_Sliding.glb' },
      { cat: 'buildings', file: 'SU_Base_Corridor_Straight.glb' },
      { cat: 'buildings', file: 'SU_Base_Foundation.glb' },

      // Research Laboratory Workstations (Pack 04)
      { cat: 'laboratory', file: 'SU_Lab_Analysis_Computer.glb' },
      { cat: 'laboratory', file: 'SU_Lab_Spectrometer.glb' },
      { cat: 'laboratory', file: 'SU_Lab_Sample_Storage.glb' },
      { cat: 'laboratory', file: 'SU_Lab_Bioreactor.glb' },

      // Key Geological Resources & Crystals (Pack 01)
      { cat: 'resources', file: 'SU_Crystal_Quartz.glb' },
      { cat: 'resources', file: 'SU_Crystal_Sulfur.glb' },
      { cat: 'resources', file: 'SU_Ice_CrystalCluster.glb' },
      { cat: 'resources', file: 'SU_Mineral_Hematite.glb' },
      { cat: 'resources', file: 'SU_Mineral_Quartz.glb' },
      { cat: 'resources', file: 'SU_Deposit_CopperOre.glb' },
      { cat: 'resources', file: 'SU_Ice_WaterDeposit.glb' },
      { cat: 'resources', file: 'SU_Mineral_Sulfur.glb' },
      { cat: 'resources', file: 'SU_Rock_Basalt.glb' },
      { cat: 'resources', file: 'SU_Rock_Granite.glb' },
      { cat: 'resources', file: 'SU_Rock_LargeBoulder.glb' },
      { cat: 'resources', file: 'SU_Rock_SmallStone.glb' },
      { cat: 'resources', file: 'SU_Rock_Sandstone.glb' },
      { cat: 'resources', file: 'SU_Geo_ImpactEjecta.glb' },
      { cat: 'resources', file: 'SU_Meteorite_IronNickel.glb' },

      // Exterior Base Infrastructure (Pack 08)
      { cat: 'energy', file: 'SU_Infra_Solar_Power_Plant.glb' },
      { cat: 'energy', file: 'SU_Infra_Compact_Nuclear_Reactor.glb' },
      { cat: 'energy', file: 'SU_Infra_Base_Control_Center.glb' },

      // Rockets & Spacecraft
      { cat: 'spacecraft', file: 'SU_Part_Cockpit.glb' },
      { cat: 'rockets', file: 'vulcan_centaur_rocket.glb' },
      { cat: 'rockets', file: 'electron_-_rocket_lab.glb' },
      { cat: 'vehicles', file: 'SU_Ship_Planetary_Lander.glb' },

      // Planetary & Celestial Bodies
      { cat: 'spaceflight', file: 'solar_system.glb' },
      { cat: 'spaceflight', file: 'sun.glb' },
      { cat: 'spaceflight', file: 'neptune.glb' },
      { cat: 'spaceflight', file: 'moon.glb' },
      { cat: 'spaceflight', file: 'ton_618_black_hole.glb' }
    ];

    this.totalToLoad = essentialModels.length;

    const promises = essentialModels.map(item => {
      const url = `${this.basePath}/models/${item.cat}/${item.file}`;
      return this.loadGLBWithTimeout(url, 10000)
        .then(gltf => {
          if (gltf) {
            if (gltf.scene) {
              gltf.scene.traverse((child) => {
                if (child.isMesh && child.material) {
                  const mats = Array.isArray(child.material) ? child.material : [child.material];
                  for (const m of mats) {
                    if (m && m.transmission > 0) {
                      m.transmission = 0;
                      m.transparent = true;
                      if (m.opacity > 0.85) m.opacity = 0.62;
                    }
                  }
                }
              });
            }
            this.cache.set(item.file, gltf);
            this.cache.set(`${item.cat}/${item.file}`, gltf);
          }
          this.loadedCount++;
          if (onProgress) onProgress(this.loadedCount, this.totalToLoad, item.file);
        })
        .catch(err => {
          console.warn(`[AssetRegistry] Model warning for ${item.file}:`, err);
          this.loadedCount++;
          if (onProgress) onProgress(this.loadedCount, this.totalToLoad, item.file);
        });
    });

    await Promise.all(promises);
  }

  loadGLBWithTimeout(url, ms = 10000) {
    return new Promise((resolve) => {
      let done = false;
      const timer = setTimeout(() => {
        if (!done) {
          done = true;
          console.warn(`[AssetRegistry] Timeout loading ${url}`);
          resolve(null);
        }
      }, ms);

      this.loader.load(
        url,
        (gltf) => {
          if (!done) {
            done = true;
            clearTimeout(timer);
            resolve(gltf);
          }
        },
        undefined,
        (err) => {
          if (!done) {
            done = true;
            clearTimeout(timer);
            console.warn(`[AssetRegistry] Failed to load ${url}:`, err);
            resolve(null);
          }
        }
      );
    });
  }

  getClonedModel(filenameOrPath) {
    const gltf = this.cache.get(filenameOrPath);
    if (!gltf || !gltf.scene) return null;
    const cloned = gltf.scene.clone(true);
    
    cloned.traverse(child => {
      if (child.isMesh) {
        child.castShadow = false; // Controlled selectively by systems to prevent shadow draw call explosion
        child.receiveShadow = true;
      }
    });

    return cloned;
  }

  async loadModelOnDemand(cat, file) {
    const key = `${cat}/${file}`;
    if (this.cache.has(key)) return this.getClonedModel(key);
    try {
      const gltf = await this.loadGLBWithTimeout(`${this.basePath}/models/${cat}/${file}`, 8000);
      if (gltf) {
        this.cache.set(key, gltf);
        this.cache.set(file, gltf);
        return this.getClonedModel(key);
      }
      return null;
    } catch (e) {
      console.warn(`[AssetRegistry] Could not load ${key}:`, e);
      return null;
    }
  }

  getResourceMeta(fileOrId) {
    return this.resourceMetadata.get(fileOrId) || null;
  }
}

export const assetRegistry = new AssetRegistry();
