import { BUILDING_MODULES, ENERGY_CONFIG, MARS_SOL_CONFIG } from '../core/Constants.js';

/**
 * PLANET BASE 2.1 — INDUSTRIAL ENERGY ACCOUNTING & ELECTROLYSIS MASS BALANCE
 *
 * Implements proximity-based local power networks:
 *   SOLAR PANEL (build_solar_power, 35 kW peak)
 *   -> BATTERY (build_battery_bank, 100 kWh capacity)
 *   -> RESEARCH STATION (build_research_station, 0 kW idle, 15 kWh per analysis)
 *   -> OXYGEN GENERATOR (build_oxygen_gen, 15 kW continuous while electrolyzing H₂O feedstock)
 *   -> INDUSTRIAL ORE CRUSHER (build_ore_crusher, batch mode: 1.0 kWh = 20 kW x 180 s / 3600 per batch, 0 kW idle)
 *
 * Physical & Simulation Energy Rules:
 * 1. Power is measured in kW (кВт) and stored energy in kWh (кВт·ц).
 * 2. Correct physical conversion: 1 kWh = 1 kW sustained for 3600 seconds:
 *      energyDeltaKWh = powerKW * elapsedSeconds * timeScale / 3600
 * 3. Industrial Ore Crusher (Issue A fix):
 *    - Operates strictly in atomic batch-processing mode (4 martian_regolith -> 1 iron_ore).
 *    - Rated power = 20 kW over 180 simulated seconds => TOTAL batch energy = 1.0 kWh.
 *    - Draws 0 kW continuous power in update() so batches are never double-charged.
 * 4. Oxygen Generator (Issue B fix):
 *    - Uses Water Electrolysis (2 H₂O -> 2 H₂ + O₂) with auxiliary Sabatier CO₂ reduction.
 *    - Theoretical stoichiometry: 1.125 kg H₂O per 1.0 kg O₂.
 *    - Game feedstock: 1 ice_chunk = 1.25 kg raw permafrost ice * 0.90 purification efficiency = 1.125 kg purified H₂O.
 *    - 1.125 kg H₂O + 5.0 kWh (15 kW for 1200 simulated s) -> 1.0 kg O₂ = 1 o2_canister.
 *    - Stops automatically when power or ice_chunk/water feedstock is unavailable, consuming energy and water
 *      strictly for actual oxygen output.
 * 5. Pause Guard:
 *    - Does not generate oxygen, consume feedstock, or drain/charge energy while `game.isPaused` is true.
 */
export class PowerNetworkSystem {
  constructor(game) {
    this.game = game;
    this.linkRadius = ENERGY_CONFIG.networkLinkRadius;
    this.analysisEnergyCost = ENERGY_CONFIG.researchAnalysisEnergyCost;
    this.oxygenGeneratorPowerKW = ENERGY_CONFIG.oxygenGeneratorPowerKW || 15;
    this.oxygenFeedstockItemId = ENERGY_CONFIG.oxygenFeedstockItemId || 'ice_chunk';
    this.iceChunkRawMassKg = ENERGY_CONFIG.iceChunkRawMassKg || 1.25;
    this.icePurificationEfficiency = ENERGY_CONFIG.icePurificationEfficiency || 0.90;
    this.purifiedWaterPerIceChunkKg = ENERGY_CONFIG.purifiedWaterPerIceChunkKg || 1.125;
    this.waterMassPerKgOxygen = ENERGY_CONFIG.waterMassPerKgOxygen || 1.125;
    this.oxygenMassPerCanisterKg = ENERGY_CONFIG.oxygenMassPerCanisterKg || 1.0;
    this.oxygenProductionKgPerKWh = ENERGY_CONFIG.oxygenProductionKgPerKWh || 0.2;
    this.oxygenCanisterEnergyKWh = ENERGY_CONFIG.oxygenCanisterEnergyKWh || 5.0;
    this.oreCrusherPowerKW = ENERGY_CONFIG.oreCrusherPowerKW || 20;
    this.oreCrusherBatchDurationSimulatedSeconds = ENERGY_CONFIG.oreCrusherBatchDurationSimulatedSeconds || 180;
    this.oreCrusherBatchEnergyKWh = ENERGY_CONFIG.oreCrusherBatchEnergyKWh || 1.0;
    this.maxSimulationStepSeconds = ENERGY_CONFIG.maxSimulationStepSeconds;
    this.secondsPerHour = ENERGY_CONFIG.secondsPerHour || 3600;

    // Optional explicit override; when null, derived from MarsSky.dayDurationSeconds
    this.timeScaleOverride = null;

    this.networks = [];
    this.buildingToNetworkMap = new Map();
    this.solarFactor = 0;

    // Aggregated summary for the active/focused local network
    this.powerGeneration = 0; // kW
    this.powerConsumption = 0; // kW
    this.batteryCapacity = 0; // kWh
    this.storedEnergy = 0; // kWh
    this.supplyAvailable = false;
    this.networkStatus = 'OFFLINE';
    this.totalAnalysesPowered = 0;
    this.lastAnalysisTimestamp = 0;
    this.lastAnalysisEnergyKWh = 0;
    this.totalOxygenKgProduced = 0;
    this.totalOxygenCanistersProduced = 0;
    this.totalIceChunksConsumed = 0;
    this.totalCrusherBatchesPowered = 0;
    this._isProcessingCrusherBatch = false;
  }

  /**
   * Returns the active simulation time acceleration factor (simulated seconds per real gameplay second),
   * reusing MarsSky.dayDurationSeconds and MARS_SOL_CONFIG.realSolSeconds.
   */
  getSimulationTimeScale() {
    if (Number.isFinite(this.timeScaleOverride) && this.timeScaleOverride > 0) {
      return this.timeScaleOverride;
    }
    const dayDuration = Number(this.game?.sky?.dayDurationSeconds) || MARS_SOL_CONFIG.gameplaySolSeconds || 720;
    const realSol = Number(MARS_SOL_CONFIG.realSolSeconds) || 88775.244;
    return dayDuration > 0 ? (realSol / dayDuration) : 1.0;
  }

  _resolveModuleDef(b) {
    if (!b) return null;
    if (b.moduleId) {
      const byId = BUILDING_MODULES.find(m => m && m.id === b.moduleId);
      if (byId) return byId;
    }
    if (Number.isInteger(b.moduleIndex) && BUILDING_MODULES[b.moduleIndex]) {
      return BUILDING_MODULES[b.moduleIndex];
    }
    return b.mesh?.userData?.moduleDef || null;
  }

  _getBuildingCoords(b) {
    if (!b) return { x: 0, y: 0, z: 0 };
    if (b.mesh?.position) {
      return {
        x: Number(b.mesh.position.x) || 0,
        y: Number.isFinite(b.y) ? Number(b.y) : (Number(b.mesh.position.y) || 0),
        z: Number(b.mesh.position.z) || 0
      };
    }
    return {
      x: Number(b.x) || 0,
      y: Number(b.y) || 0,
      z: Number(b.z) || 0
    };
  }

  _distanceBetweenBuildings(a, b) {
    const pa = this._getBuildingCoords(a);
    const pb = this._getBuildingCoords(b);
    return Math.hypot(pa.x - pb.x, pa.y - pb.y, pa.z - pb.z);
  }

  _computeSolarFactor() {
    const sky = this.game?.sky;
    if (sky && typeof sky.getSolarFactor === 'function') {
      const f = Number(sky.getSolarFactor());
      return Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : 0;
    }
    const tod = Number(sky?.timeOfDay);
    if (!Number.isFinite(tod)) return 0;
    const sunAngle = tod * Math.PI * 2 - Math.PI / 2;
    const sunY = Math.sin(sunAngle);
    const raw = Math.max(0, Math.min(1, (sunY + 0.12) / 0.42));
    return sky?.isStormActive ? raw * 0.35 : raw;
  }

  /**
   * Recomputes connected components and instantaneous power rates (kW) and stored energy (kWh).
   */
  rebuildNetworks() {
    const placed = this.game?.buildingSystem?.placedBuildings || [];
    this.solarFactor = this._computeSolarFactor();
    this.networks = [];
    this.buildingToNetworkMap.clear();

    const n = placed.length;
    if (n === 0) {
      this._syncPrimarySummary(null);
      return this.networks;
    }

    const visited = new Array(n).fill(false);
    let netIndex = 0;

    for (let i = 0; i < n; i++) {
      if (visited[i] || !placed[i]) continue;
      const queue = [i];
      visited[i] = true;
      const componentIndices = [];

      while (queue.length > 0) {
        const curr = queue.shift();
        componentIndices.push(curr);
        const bCurr = placed[curr];
        for (let j = 0; j < n; j++) {
          if (visited[j] || !placed[j]) continue;
          const dist = this._distanceBetweenBuildings(bCurr, placed[j]);
          if (dist <= this.linkRadius) {
            visited[j] = true;
            queue.push(j);
          }
        }
      }

      const net = this._buildComponentNetwork(`net_${++netIndex}`, componentIndices.map(idx => placed[idx]));
      this.networks.push(net);
      for (const b of net.buildings) {
        if (b.id) this.buildingToNetworkMap.set(b.id, net);
        this.buildingToNetworkMap.set(b, net);
      }
    }

    this._syncPrimarySummary();
    return this.networks;
  }

  _buildComponentNetwork(networkId, buildings) {
    const solarPanels = [];
    const batteries = [];
    const researchStations = [];
    const oxygenGenerators = [];
    const oreCrushers = [];
    const consumers = [];

    let peakSolarCapacity = 0; // kW
    let powerGeneration = 0; // kW
    let activePowerConsumption = 0; // kW
    let batteryCapacity = 0; // kWh
    let storedEnergy = 0; // kWh
    let operatingOxygenCount = 0;
    let operatingCrusherCount = 0;
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;

    for (const b of buildings) {
      const modDef = this._resolveModuleDef(b);
      const coords = this._getBuildingCoords(b);
      sumX += coords.x;
      sumY += coords.y;
      sumZ += coords.z;

      if (!modDef) continue;

      if (modDef.powerOutput && modDef.powerOutput > 0) {
        solarPanels.push(b);
        peakSolarCapacity += modDef.powerOutput;
        powerGeneration += modDef.powerOutput * this.solarFactor;
      }

      if (modDef.batteryCapacity && modDef.batteryCapacity > 0) {
        const cap = Number(modDef.batteryCapacity) || 0;
        const currentStored = Math.max(0, Math.min(cap, Number(b.storedEnergy) || 0));
        b.storedEnergy = currentStored;
        batteries.push(b);
        batteryCapacity += cap;
        storedEnergy += currentStored;
      }

      if (modDef.id === 'build_research_station') {
        researchStations.push(b);
        const idleLoad = Number(ENERGY_CONFIG.researchStationIdleLoad) || 0;
        if (idleLoad > 0) {
          consumers.push({ building: b, moduleId: modDef.id, load: idleLoad, isOperating: true });
          activePowerConsumption += idleLoad;
        }
      } else if (modDef.id === 'build_oxygen_gen') {
        if (b.isOperating === undefined) b.isOperating = false;
        if (b.oxygenGenerated === undefined) b.oxygenGenerated = 0;
        if (b.oxygenCanisterProgress === undefined) b.oxygenCanisterProgress = 0;
        if (b.oxygenCanistersStored === undefined) b.oxygenCanistersStored = 0;
        if (b.waterFeedstockKg === undefined) b.waterFeedstockKg = 0;
        if (b.iceChunksConsumed === undefined) b.iceChunksConsumed = 0;
        oxygenGenerators.push(b);
        const drawKW = b.isOperating ? this.oxygenGeneratorPowerKW : 0;
        if (b.isOperating) {
          operatingOxygenCount += 1;
          consumers.push({ building: b, moduleId: modDef.id, load: drawKW, isOperating: true });
          activePowerConsumption += drawKW;
        }
      } else if (modDef.id === 'build_ore_crusher') {
        // Issue A Fix: Ore Crusher operates strictly in batch-processing mode (1.0 kWh per batch = 20 kW * 180 s / 3600).
        // It never draws continuous power in update() so batches are never double-charged.
        b.isOperating = false;
        if (b.crusherBatchesCompleted === undefined) b.crusherBatchesCompleted = 0;
        oreCrushers.push(b);
      }
    }

    powerGeneration = Math.round(powerGeneration * 1e6) / 1e6;
    activePowerConsumption = Math.round(activePowerConsumption * 1e6) / 1e6;
    storedEnergy = Math.round(storedEnergy * 1e6) / 1e6;
    batteryCapacity = Math.round(batteryCapacity * 1e6) / 1e6;

    const hasSolar = solarPanels.length > 0;
    const hasBattery = batteries.length > 0;
    const hasResearchStation = researchStations.length > 0;
    const hasOxygenGenerator = oxygenGenerators.length > 0;
    const hasOreCrusher = oreCrushers.length > 0;
    const isPowerConnected = hasSolar && hasBattery;
    const hasAnyEnergyNode = hasSolar || hasBattery;
    const canAnalyze = hasBattery && (storedEnergy + 1e-9 >= this.analysisEnergyCost);
    const canCrushBatch = hasBattery && (storedEnergy + 1e-9 >= this.oreCrusherBatchEnergyKWh);
    const supplyAvailable = hasAnyEnergyNode && (
      (hasBattery && storedEnergy > 1e-6) ||
      (hasSolar && powerGeneration > 0)
    );

    let networkStatus = 'OFFLINE';
    let statusMn = 'Офлайн (Эрчим хүчгүй)';
    if (!hasAnyEnergyNode) {
      networkStatus = 'DISCONNECTED';
      statusMn = 'Эрчим хүчний сүлжээнд холбогдоогүй';
    } else if (!hasBattery) {
      if (powerGeneration > 0 && powerGeneration + 1e-9 >= activePowerConsumption) {
        networkStatus = 'SOLAR_ONLY';
        statusMn = 'Нарны шууд тэжээл (Батерейгүй)';
      } else {
        networkStatus = 'NO_BATTERY';
        statusMn = 'Батерей холбогдоогүй';
      }
    } else if (canAnalyze || (activePowerConsumption > 0 && (powerGeneration >= activePowerConsumption || storedEnergy > 0))) {
      networkStatus = 'ONLINE';
      statusMn = powerGeneration >= activePowerConsumption && powerGeneration > 0
        ? 'Онлайн (Цэнэглэж байна)'
        : 'Онлайн (Батерейн нөөцтэй)';
    } else if (powerGeneration > 0) {
      networkStatus = 'CHARGING';
      statusMn = 'Батерей цэнэглэж байна (Хүлээгдэж буй)';
    } else if (storedEnergy > 0) {
      networkStatus = 'LOW_ENERGY';
      statusMn = 'Батерейн цэнэг бага';
    } else {
      networkStatus = 'LOW_ENERGY';
      statusMn = 'Эрчим хүч хүрэлцэхгүй (Шөнө / Цэнэг дууссан)';
    }

    const count = Math.max(1, buildings.length);
    return {
      id: networkId,
      buildings,
      solarPanels,
      batteries,
      researchStations,
      oxygenGenerators,
      oreCrushers,
      consumers,
      solarCount: solarPanels.length,
      batteryCount: batteries.length,
      stationCount: researchStations.length,
      oxygenGeneratorCount: oxygenGenerators.length,
      operatingOxygenCount,
      oreCrusherCount: oreCrushers.length,
      operatingCrusherCount,
      peakSolarCapacity,
      solarFactor: this.solarFactor,
      powerGeneration,
      powerConsumption: activePowerConsumption,
      netPower: Math.round((powerGeneration - activePowerConsumption) * 1e6) / 1e6,
      batteryCapacity,
      storedEnergy,
      analysisEnergyCost: this.analysisEnergyCost,
      oreCrusherBatchEnergyKWh: this.oreCrusherBatchEnergyKWh,
      hasSolar,
      hasBattery,
      hasResearchStation,
      hasOxygenGenerator,
      hasOreCrusher,
      hasAnyEnergyNode,
      isPowerConnected,
      supplyAvailable,
      canAnalyze,
      canCrushBatch,
      networkStatus,
      statusMn,
      center: { x: sumX / count, y: sumY / count, z: sumZ / count }
    };
  }

  /**
   * Advances battery charging/discharging and operating machine production using:
   *   energyDeltaKWh = powerKW * elapsedSeconds * timeScale / 3600
   *
   * Deterministic insufficient-power rule:
   * - If a network's operating consumers require `requiredConsumerKWh > availableEnergyKWh`
   *   (`solarEnergyKWh + net.storedEnergy`), operating consumers in that network cannot sustain
   *   their power draw for this step: they automatically stop (`isOperating = false`,
   *   `lastStopReason = 'insufficient_power'`) without producing output and without driving
   *   battery energy below 0 kWh. Any solar energy generated in the step still charges batteries.
   *
   * @param {number} delta - Elapsed time in seconds.
   * @param {object} [options]
   * @param {boolean} [options.simulatedSeconds=false] - When true, `delta` is already in simulated seconds
   *   (`timeScale = 1`, `clampDelta = false` by default).
   * @param {number} [options.timeScale] - Explicit timeScale multiplier. Defaults to `1.0` when
   *   `simulatedSeconds` is true, or `this.getSimulationTimeScale()` during real-time frame updates.
   * @param {boolean} [options.clampDelta] - Whether to clamp `delta` to `maxSimulationStepSeconds` (0.5s).
   *   Defaults to `!options.simulatedSeconds` so browser tab pause/resume cannot generate runaway energy.
   */
  update(delta, options = {}) {
    // Issue B #11 Fix: Do not generate oxygen, consume input, or drain/charge energy while the game is paused.
    if (this.game?.isPaused && !options?.ignorePause) {
      this.rebuildNetworks();
      return { paused: true, simulatedSeconds: 0 };
    }

    const rawDelta = Number(delta);
    if (!Number.isFinite(rawDelta) || rawDelta <= 0) {
      this.rebuildNetworks();
      return { paused: false, simulatedSeconds: 0 };
    }

    const isSimulatedSeconds = Boolean(options && options.simulatedSeconds);
    const shouldClamp = (options && options.clampDelta !== undefined)
      ? Boolean(options.clampDelta)
      : !isSimulatedSeconds;

    const deltaSeconds = shouldClamp
      ? Math.max(0, Math.min(rawDelta, this.maxSimulationStepSeconds))
      : Math.max(0, rawDelta);

    const timeScale = (options && Number.isFinite(options.timeScale) && options.timeScale >= 0)
      ? Number(options.timeScale)
      : (isSimulatedSeconds ? 1.0 : this.getSimulationTimeScale());

    const elapsedSimulatedSeconds = deltaSeconds * timeScale;

    this.rebuildNetworks();
    if (elapsedSimulatedSeconds <= 0 || this.networks.length === 0) {
      return { paused: false, simulatedSeconds: 0 };
    }

    for (const net of this.networks) {
      const solarEnergyKWh = net.hasSolar
        ? (net.powerGeneration * elapsedSimulatedSeconds) / this.secondsPerHour
        : 0;

      // First stop any Oxygen Generator that has zero remaining chamber water AND zero ice_chunk in inventory
      for (const o2Gen of net.oxygenGenerators) {
        if (!o2Gen.isOperating) continue;
        if (!this.hasOxygenFeedstock(o2Gen)) {
          o2Gen.isOperating = false;
          o2Gen.lastStopReason = 'no_feedstock';
        }
      }

      const activeO2Gens = net.oxygenGenerators.filter(b => b.isOperating);
      const activeConsumerPowerKW = activeO2Gens.length * this.oxygenGeneratorPowerKW;
      const requiredConsumerKWh = (activeConsumerPowerKW * elapsedSimulatedSeconds) / this.secondsPerHour;
      const availableEnergyKWh = net.hasAnyEnergyNode
        ? (solarEnergyKWh + net.storedEnergy)
        : 0;

      // Case 1: Active Oxygen Generators exist, check if network can sustain their draw for this step
      if (requiredConsumerKWh > 1e-12) {
        if (!net.hasAnyEnergyNode || availableEnergyKWh + 1e-9 < requiredConsumerKWh) {
          // Insufficient electrical power: deterministically stop operating consumers without consuming feedstock or negative battery
          for (const b of activeO2Gens) {
            b.isOperating = false;
            b.lastStopReason = 'insufficient_power';
          }
          if (solarEnergyKWh > 1e-12 && net.batteries.length > 0) {
            this._chargeNetworkBatteries(net, solarEnergyKWh);
          }
          continue;
        }

        // Sufficient electrical power: advance each operating Oxygen Generator up to its available H₂O feedstock
        let actualTotalConsumerKWh = 0;
        const fullGenEnergyKWh = (this.oxygenGeneratorPowerKW * elapsedSimulatedSeconds) / this.secondsPerHour;
        const inv = this.game?.inventory;

        for (const o2Gen of activeO2Gens) {
          const wantO2Kg = fullGenEnergyKWh * this.oxygenProductionKgPerKWh;
          const wantWaterKg = wantO2Kg * this.waterMassPerKgOxygen;
          let availWaterKg = Math.max(0, Number(o2Gen.waterFeedstockKg) || 0);

          // Pull required ice_chunk items from inventory only as needed for actual electrolysis output
          if (availWaterKg + 1e-9 < wantWaterKg && inv && typeof inv.getItemCount === 'function') {
            const deficitWaterKg = wantWaterKg - availWaterKg;
            const chunksNeeded = Math.ceil((deficitWaterKg - 1e-9) / this.purifiedWaterPerIceChunkKg);
            const haveChunks = inv.getItemCount(this.oxygenFeedstockItemId);
            const chunksToPull = Math.max(0, Math.min(chunksNeeded, haveChunks));
            if (chunksToPull > 0 && typeof inv.removeItem === 'function') {
              const removed = inv.removeItem(this.oxygenFeedstockItemId, chunksToPull);
              if (removed > 0) {
                availWaterKg += removed * this.purifiedWaterPerIceChunkKg;
                o2Gen.iceChunksConsumed = Math.max(0, Math.floor(Number(o2Gen.iceChunksConsumed) || 0)) + removed;
                this.totalIceChunksConsumed += removed;
              }
            }
          }

          if (availWaterKg <= 1e-12) {
            o2Gen.isOperating = false;
            o2Gen.lastStopReason = 'no_feedstock';
            continue;
          }

          const actualWaterUsedKg = Math.min(wantWaterKg, availWaterKg);
          const actualO2ProducedKg = actualWaterUsedKg / this.waterMassPerKgOxygen;
          const actualEnergyUsedKWh = actualO2ProducedKg / this.oxygenProductionKgPerKWh;

          actualTotalConsumerKWh += actualEnergyUsedKWh;

          const remWaterKg = Math.max(0, availWaterKg - actualWaterUsedKg);
          o2Gen.waterFeedstockKg = remWaterKg < 1e-9 ? 0 : Math.round(remWaterKg * 1e6) / 1e6;

          o2Gen.oxygenGenerated = Math.round(((Number(o2Gen.oxygenGenerated) || 0) + actualO2ProducedKg) * 1e6) / 1e6;
          this.totalOxygenKgProduced = Math.round((this.totalOxygenKgProduced + actualO2ProducedKg) * 1e6) / 1e6;

          const progressDelta = actualO2ProducedKg / this.oxygenMassPerCanisterKg;
          const totalProgress = (Number(o2Gen.oxygenCanisterProgress) || 0) + progressDelta;
          const completedCanisters = Math.floor(totalProgress + 1e-9);
          if (completedCanisters > 0) {
            const remProgress = Math.max(0, totalProgress - completedCanisters);
            o2Gen.oxygenCanisterProgress = remProgress < 1e-9 ? 0 : Math.min(1, Math.round(remProgress * 1e6) / 1e6);
            o2Gen.oxygenCanistersStored = Math.max(0, Math.floor(Number(o2Gen.oxygenCanistersStored) || 0)) + completedCanisters;
            this.totalOxygenCanistersProduced += completedCanisters;
          } else {
            o2Gen.oxygenCanisterProgress = Math.max(0, Math.min(1, Math.round(totalProgress * 1e6) / 1e6));
          }

          // If feedstock was exhausted during or at the end of this step, stop cleanly
          if (actualWaterUsedKg + 1e-9 < wantWaterKg || !this.hasOxygenFeedstock(o2Gen)) {
            o2Gen.isOperating = false;
            o2Gen.lastStopReason = 'no_feedstock';
          } else {
            o2Gen.lastStopReason = null;
          }
        }

        // Apply net energy delta (solar generation minus actual energy consumed by electrolysis)
        const netEnergyDeltaKWh = solarEnergyKWh - actualTotalConsumerKWh;
        if (netEnergyDeltaKWh > 1e-12 && net.batteries.length > 0) {
          this._chargeNetworkBatteries(net, netEnergyDeltaKWh);
        } else if (netEnergyDeltaKWh < -1e-12 && net.batteries.length > 0) {
          this._drainNetworkBatteries(net, -netEnergyDeltaKWh);
        }
      } else if (solarEnergyKWh > 1e-12 && net.batteries.length > 0) {
        // Case 2: No active consumers, charge batteries from solar generation
        this._chargeNetworkBatteries(net, solarEnergyKWh);
      }
    }

    // Recompute snapshots after battery & consumer state update so telemetry is exact
    this.rebuildNetworks();
    return { paused: false, simulatedSeconds: elapsedSimulatedSeconds };
  }

  _chargeNetworkBatteries(net, energyToStoreKWh) {
    let remainingToStore = Math.max(0, Number(energyToStoreKWh) || 0);
    for (const bat of net.batteries) {
      if (remainingToStore <= 0) break;
      const modDef = this._resolveModuleDef(bat);
      const cap = Number(modDef?.batteryCapacity) || ENERGY_CONFIG.batteryCapacity;
      const current = Math.max(0, Math.min(cap, Number(bat.storedEnergy) || 0));
      const room = Math.max(0, cap - current);
      if (room > 0) {
        const added = Math.min(room, remainingToStore);
        bat.storedEnergy = Math.min(cap, Math.round((current + added) * 1e6) / 1e6);
        remainingToStore -= added;
      }
    }
  }

  _drainNetworkBatteries(net, energyToDrainKWh) {
    let remainingToDrain = Math.max(0, Number(energyToDrainKWh) || 0);
    for (const bat of net.batteries) {
      if (remainingToDrain <= 0) break;
      const modDef = this._resolveModuleDef(bat);
      const cap = Number(modDef?.batteryCapacity) || ENERGY_CONFIG.batteryCapacity;
      const current = Math.max(0, Math.min(cap, Number(bat.storedEnergy) || 0));
      if (current > 0) {
        const drained = Math.min(current, remainingToDrain);
        const nextVal = Math.max(0, current - drained);
        bat.storedEnergy = nextVal < 1e-9 ? 0 : Math.round(nextVal * 1e6) / 1e6;
        remainingToDrain -= drained;
      }
    }
  }

  /**
   * Deterministic helper: advances the power network by an exact number of simulated seconds
   * using `energyDeltaKWh = powerKW * simulatedSeconds / 3600` without frame-delta clamping.
   */
  stepSimulatedSeconds(simulatedSeconds) {
    return this.update(simulatedSeconds, {
      simulatedSeconds: true,
      timeScale: 1.0,
      clampDelta: false
    });
  }

  getNetworkForBuilding(buildingOrId) {
    this.rebuildNetworks();
    if (!buildingOrId) return null;
    if (typeof buildingOrId === 'string') {
      return this.buildingToNetworkMap.get(buildingOrId) || null;
    }
    if (buildingOrId.id && this.buildingToNetworkMap.has(buildingOrId.id)) {
      return this.buildingToNetworkMap.get(buildingOrId.id);
    }
    return this.buildingToNetworkMap.get(buildingOrId) || null;
  }

  /**
   * Returns the power status for a specific Research Station (or the active/nearest network).
   */
  getStationPowerStatus(stationBuilding = null) {
    this.rebuildNetworks();
    const targetStation = stationBuilding ||
      this.game?.ui?.activeResearchStation ||
      this.game?.ui?.findNearestResearchStation?.(this.linkRadius)?.building ||
      null;

    if (targetStation) {
      const net = this.getNetworkForBuilding(targetStation);
      if (net) return net;
    }

    return this.getPrimaryNetworkStatus();
  }

  getPrimaryNetworkStatus(referencePos = null) {
    this.rebuildNetworks();
    if (this.networks.length === 0) {
      return {
        id: null,
        buildings: [],
        solarPanels: [],
        batteries: [],
        researchStations: [],
        oxygenGenerators: [],
        oreCrushers: [],
        consumers: [],
        solarCount: 0,
        batteryCount: 0,
        stationCount: 0,
        oxygenGeneratorCount: 0,
        operatingOxygenCount: 0,
        oreCrusherCount: 0,
        operatingCrusherCount: 0,
        peakSolarCapacity: 0,
        solarFactor: this.solarFactor,
        powerGeneration: 0,
        powerConsumption: 0,
        netPower: 0,
        batteryCapacity: 0,
        storedEnergy: 0,
        analysisEnergyCost: this.analysisEnergyCost,
        oreCrusherBatchEnergyKWh: this.oreCrusherBatchEnergyKWh,
        hasSolar: false,
        hasBattery: false,
        hasResearchStation: false,
        hasOxygenGenerator: false,
        hasOreCrusher: false,
        hasAnyEnergyNode: false,
        isPowerConnected: false,
        supplyAvailable: false,
        canAnalyze: false,
        canCrushBatch: false,
        networkStatus: 'OFFLINE',
        statusMn: 'Сүлжээ байхгүй'
      };
    }

    return this._selectPrimaryNetwork(referencePos) || this.networks[0];
  }

  _syncPrimarySummary(explicitNet = undefined) {
    const net = explicitNet !== undefined ? explicitNet : (this.networks.length > 0 ? this._selectPrimaryNetwork() : null);
    if (!net) {
      this.powerGeneration = 0;
      this.powerConsumption = 0;
      this.batteryCapacity = 0;
      this.storedEnergy = 0;
      this.supplyAvailable = false;
      this.networkStatus = 'OFFLINE';
      return;
    }
    this.powerGeneration = net.powerGeneration;
    this.powerConsumption = net.powerConsumption;
    this.batteryCapacity = net.batteryCapacity;
    this.storedEnergy = net.storedEnergy;
    this.supplyAvailable = net.supplyAvailable;
    this.networkStatus = net.networkStatus;
  }

  _selectPrimaryNetwork(referencePos = null) {
    if (this.networks.length === 0) return null;
    const activeBuilding =
      this.game?.ui?.activeResearchStation ||
      this.game?.ui?.activeOxygenGenerator ||
      this.game?.ui?.activeOreCrusher ||
      null;
    if (activeBuilding) {
      const activeNet = this.buildingToNetworkMap.get(activeBuilding.id) || this.buildingToNetworkMap.get(activeBuilding);
      if (activeNet) return activeNet;
    }
    const pos = referencePos || this.game?.player?.position;
    if (pos) {
      let bestNet = null;
      let bestScore = -Infinity;
      for (const net of this.networks) {
        const dist = Math.hypot((Number(pos.x) || 0) - net.center.x, (Number(pos.z) || 0) - net.center.z);
        const hasConsumer = net.hasResearchStation || net.hasOxygenGenerator || net.hasOreCrusher;
        const relevanceBonus = (hasConsumer ? 50 : 0) + (net.hasAnyEnergyNode ? 40 : 0);
        const score = relevanceBonus - dist;
        if (score > bestScore) {
          bestScore = score;
          bestNet = net;
        }
      }
      if (bestNet) return bestNet;
    }
    return this.networks[0];
  }

  /**
   * Checks whether an Oxygen Generator currently has purified water in its internal electrolysis chamber
   * OR at least 1 `ice_chunk` (Permafrost Ice / H₂O) in the player's inventory.
   */
  hasOxygenFeedstock(oxygenBuilding) {
    const chamberWaterKg = Math.max(0, Number(oxygenBuilding?.waterFeedstockKg) || 0);
    if (chamberWaterKg > 1e-9) return true;
    const inv = this.game?.inventory;
    const iceCount = (inv && typeof inv.getItemCount === 'function')
      ? inv.getItemCount(this.oxygenFeedstockItemId)
      : 0;
    return iceCount >= 1;
  }

  /**
   * Returns target continuous power demand (kW) for a consumer building when operating.
   * Note: `build_ore_crusher` operates strictly in batch-processing mode (1.0 kWh per batch; 0 kW continuous idle load).
   */
  getTargetPowerDemandKW(building) {
    const modDef = this._resolveModuleDef(building);
    if (!modDef) return 0;
    if (modDef.id === 'build_oxygen_gen') return this.oxygenGeneratorPowerKW;
    if (modDef.id === 'build_ore_crusher') return 0;
    return Number(modDef.powerCost) || 0;
  }

  /**
   * Checks whether `building` (`build_oxygen_gen`) has valid electrical power AND required feedstock
   * to start/continue operating on its local network without mutating state.
   */
  canOperateBuilding(building) {
    this.rebuildNetworks();
    if (!building) {
      return {
        ok: false,
        reason: 'no_building',
        drawKW: 0,
        message_mn: '⚠️ Төхөөрөмж олдсонгүй'
      };
    }

    const modDef = this._resolveModuleDef(building);
    if (modDef?.id === 'build_ore_crusher') {
      return {
        ok: false,
        reason: 'batch_mode_only',
        drawKW: 0,
        message_mn: `⚙️ Хүдэр бутлагч нь багцын горимоор ажиллана (1 багц = ${this.oreCrusherBatchEnergyKWh.toFixed(1)} ${ENERGY_CONFIG.unitEnergy}, тасралтгүй сул зогсолтын чадал 0 ${ENERGY_CONFIG.unitPower})`
      };
    }

    const drawKW = this.getTargetPowerDemandKW(building);
    const labelMn = modDef?.name_mn || modDef?.name || 'Төхөөрөмж';
    const net = this.getNetworkForBuilding(building);

    if (!net || !net.hasAnyEnergyNode) {
      return {
        ok: false,
        reason: 'disconnected',
        drawKW,
        network: net || null,
        message_mn: `⚡ ${labelMn} эрчим хүчний сүлжээнд холбогдоогүй байна (${this.linkRadius}м дотор нарны станц эсвэл батерей байршуулна уу)`
      };
    }

    const otherConsumptionKW = building.isOperating
      ? Math.max(0, net.powerConsumption - drawKW)
      : net.powerConsumption;
    const totalRequiredKW = otherConsumptionKW + drawKW;
    const solarCoversLoad = net.hasSolar && (net.powerGeneration + 1e-9 >= totalRequiredKW);
    const batteryHasCharge = net.hasBattery && (net.storedEnergy > 1e-6);

    if (!solarCoversLoad && !batteryHasCharge) {
      return {
        ok: false,
        reason: 'insufficient_power',
        drawKW,
        network: net,
        message_mn: `⚡ Эрчим хүч хүрэлцэхгүй байна (Шаардлагатай чадал: ${drawKW} ${ENERGY_CONFIG.unitPower}, Одоогийн нарны чадал: ${net.powerGeneration.toFixed(1)} ${ENERGY_CONFIG.unitPower}, Батерей: ${net.storedEnergy.toFixed(1)} ${ENERGY_CONFIG.unitEnergy})`
      };
    }

    if (modDef?.id === 'build_oxygen_gen' && !this.hasOxygenFeedstock(building)) {
      return {
        ok: false,
        reason: 'no_feedstock',
        drawKW,
        network: net,
        message_mn: '🧊 Усны мөс (ice_chunk) хүрэлцэхгүй байна! O₂ үйлдвэрлэхэд Усны мөс (H₂O) шаардлагатай.'
      };
    }

    return {
      ok: true,
      reason: 'ok',
      drawKW,
      network: net
    };
  }

  /**
   * Starts or stops a continuous power consumer (`build_oxygen_gen`).
   */
  setBuildingOperating(building, shouldOperate) {
    if (!building) {
      return {
        ok: false,
        isOperating: false,
        reason: 'no_building',
        message_mn: '⚠️ Төхөөрөмж олдсонгүй'
      };
    }

    const modDef = this._resolveModuleDef(building);
    const labelMn = modDef?.name_mn || modDef?.name || 'Төхөөрөмж';
    const drawKW = this.getTargetPowerDemandKW(building);

    if (modDef?.id === 'build_ore_crusher') {
      building.isOperating = false;
      building.lastStopReason = null;
      this.rebuildNetworks();
      return {
        ok: false,
        isOperating: false,
        drawKW: 0,
        reason: 'batch_mode_only',
        message_mn: `⚙️ ${labelMn} нь зөвхөн багцын горимоор ажиллана (1 багц = ${this.oreCrusherBatchEnergyKWh.toFixed(1)} ${ENERGY_CONFIG.unitEnergy})`
      };
    }

    if (!shouldOperate) {
      building.isOperating = false;
      building.lastStopReason = 'manual_stop';
      this.rebuildNetworks();
      return {
        ok: true,
        isOperating: false,
        drawKW: 0,
        reason: 'stopped',
        message_mn: `⏹️ ${labelMn} зогслоо (0 ${ENERGY_CONFIG.unitPower})`
      };
    }

    const check = this.canOperateBuilding(building);
    if (!check.ok) {
      building.isOperating = false;
      building.lastStopReason = check.reason;
      this.rebuildNetworks();
      return {
        ok: false,
        isOperating: false,
        drawKW: 0,
        reason: check.reason,
        message_mn: check.message_mn
      };
    }

    building.isOperating = true;
    building.lastStopReason = null;
    this.rebuildNetworks();
    return {
      ok: true,
      isOperating: true,
      drawKW,
      reason: 'operating',
      message_mn: `▶️ ${labelMn} ажиллаж эхэллээ (${drawKW} ${ENERGY_CONFIG.unitPower})`
    };
  }

  toggleBuildingOperation(building) {
    return this.setBuildingOperating(building, !building?.isOperating);
  }

  /**
   * Transfers produced Pressurized O₂ Canisters (`o2_canister`) from an Oxygen Generator's buffer
   * into the player's inventory without losing any canisters if inventory space is limited.
   */
  collectOxygenCanisters(oxygenBuilding) {
    if (!oxygenBuilding) {
      return {
        ok: false,
        collected: 0,
        remainingStored: 0,
        message_mn: '⚠️ Хүчилтөрөгч үйлдвэрлэгч олдсонгүй'
      };
    }

    const stored = Math.max(0, Math.floor(Number(oxygenBuilding.oxygenCanistersStored) || 0));
    if (stored <= 0) {
      return {
        ok: false,
        reason: 'empty',
        collected: 0,
        remainingStored: 0,
        message_mn: '💨 Хуримтлагдсан O₂ баллон одоогоор байхгүй байна'
      };
    }

    const inv = this.game?.inventory;
    if (!inv || typeof inv.addItem !== 'function') {
      return {
        ok: false,
        reason: 'no_inventory',
        collected: 0,
        remainingStored: stored,
        message_mn: '⚠️ Цүнхний систем олдсонгүй'
      };
    }

    let collected = 0;
    for (let i = 0; i < stored; i++) {
      if (inv.addItem('o2_canister', 1)) {
        collected += 1;
      } else {
        break;
      }
    }

    oxygenBuilding.oxygenCanistersStored = Math.max(0, stored - collected);

    if (collected <= 0) {
      return {
        ok: false,
        reason: 'inventory_full',
        collected: 0,
        remainingStored: oxygenBuilding.oxygenCanistersStored,
        message_mn: '⚠️ Цүнх дүүрсэн байна! Сул зай гаргаад дахин оролдоно уу.'
      };
    }

    return {
      ok: true,
      reason: 'ok',
      collected,
      remainingStored: oxygenBuilding.oxygenCanistersStored,
      message_mn: `💨 +${collected} Хүчилтөрөгчийн баллон (O₂) цүнхэнд нэмэгдлээ`
    };
  }

  /**
   * Checks whether an Industrial Ore Crusher's local network can supply `costKWh` (default 1.0 kWh)
   * from its connected batteries without mutating state.
   *
   * Planet Base 2.1 Energy Model:
   * - Ore Crusher operates in batch-processing mode (20 kW * 180 simulated seconds / 3600 = 1.0 kWh total per batch).
   * - Continuous idle load is 0 kW; there is no double-charging and no zero-deduction solar bypass.
   */
  canSupplyCrusherEnergy(crusherBuilding, costKWh = this.oreCrusherBatchEnergyKWh) {
    const required = Math.max(0, Number(costKWh) ?? this.oreCrusherBatchEnergyKWh);
    this.rebuildNetworks();

    if (!crusherBuilding) {
      return {
        ok: false,
        reason: 'no_crusher',
        availableEnergy: 0,
        requiredEnergy: required,
        message_mn: '⚠️ Хүдэр бутлагч олдсонгүй'
      };
    }

    const net = this.getNetworkForBuilding(crusherBuilding);
    if (!net || !net.hasAnyEnergyNode) {
      return {
        ok: false,
        reason: 'disconnected',
        availableEnergy: 0,
        requiredEnergy: required,
        message_mn: `⚡ Хүдэр бутлагч эрчим хүчний сүлжээнд холбогдоогүй байна (${this.linkRadius}м дотор нарны станц болон батерей байршуулна уу)`
      };
    }

    if (!net.hasBattery || net.batteryCapacity <= 0) {
      return {
        ok: false,
        reason: 'no_battery',
        availableEnergy: 0,
        requiredEnergy: required,
        message_mn: '⚡ Баазын эрчим хүчний хураагуур (Батерей) холбогдоогүй байна'
      };
    }

    const hasBatteryEnergy = net.storedEnergy + 1e-9 >= required;
    if (!hasBatteryEnergy) {
      return {
        ok: false,
        reason: 'insufficient_energy',
        availableEnergy: net.storedEnergy,
        requiredEnergy: required,
        message_mn: `⚡ Эрчим хүч хүрэлцэхгүй байна (Шаардлагатай: ${required.toFixed(1)} ${ENERGY_CONFIG.unitEnergy}, Одоогийн батерей: ${net.storedEnergy.toFixed(1)} / ${net.batteryCapacity} ${ENERGY_CONFIG.unitEnergy})`
      };
    }

    return {
      ok: true,
      reason: 'ok',
      network: net,
      deductFromBattery: true,
      availableEnergy: net.storedEnergy,
      requiredEnergy: required
    };
  }

  /**
   * Executes one atomic Industrial Ore Crusher recipe transaction:
   *   4 martian_regolith + 1.0 kWh (20 kW x 180 s / 3600) -> 1 iron_ore
   *
   * Rules enforced:
   * 1. Re-entrancy guarded against double clicks / rapid triggers.
   * 2. Validates input materials (`4 martian_regolith`) BEFORE deducting energy.
   * 3. Validates electrical energy (`1.0 kWh` in connected batteries) BEFORE deducting inputs.
   * 4. Atomically deducts `1.0 kWh` and executes `inventory.processRecipe()`.
   * 5. Rolls back battery energy if `inventory.processRecipe()` fails for any reason.
   */
  processOreCrusherBatch(crusherBuilding, recipe = ENERGY_CONFIG.oreCrusherRecipe) {
    if (this._isProcessingCrusherBatch) {
      return {
        ok: false,
        reason: 'busy',
        message_mn: '⏳ Боловсруулалт явагдаж байна...'
      };
    }

    this._isProcessingCrusherBatch = true;
    try {
      const activeRecipe = recipe || ENERGY_CONFIG.oreCrusherRecipe;
      const inputItem = activeRecipe?.input?.itemId || 'martian_regolith';
      const inputQty = Math.max(1, Number(activeRecipe?.input?.quantity) || 4);
      const outputItem = activeRecipe?.output?.itemId || 'iron_ore';
      const outputQty = Math.max(1, Number(activeRecipe?.output?.quantity) || 1);
      const energyCostKWh = Math.max(0, Number(activeRecipe?.energyCostKWh) ?? this.oreCrusherBatchEnergyKWh);

      if (!crusherBuilding) {
        return {
          ok: false,
          reason: 'no_crusher',
          message_mn: '⚠️ Хүдэр бутлагч төхөөрөмж олдсонгүй'
        };
      }

      const inv = this.game?.inventory;
      if (!inv || typeof inv.hasItems !== 'function' || typeof inv.processRecipe !== 'function') {
        return {
          ok: false,
          reason: 'no_inventory',
          message_mn: '⚠️ Цүнхний систем олдсонгүй'
        };
      }

      // 1. Verify input materials FIRST so insufficient inputs never deduct energy
      const currentInputCount = typeof inv.getItemCount === 'function' ? inv.getItemCount(inputItem) : 0;
      if (!inv.hasItems({ [inputItem]: inputQty })) {
        return {
          ok: false,
          reason: 'insufficient_input',
          haveInput: currentInputCount,
          requiredInput: inputQty,
          consumedEnergyKWh: 0,
          message_mn: `⚠️ Түүхий эд хүрэлцэхгүй байна: Ангарагийн хөрс ${currentInputCount} / ${inputQty}`
        };
      }

      // 2. Verify electrical energy BEFORE modifying inventory
      const powerCheck = this.canSupplyCrusherEnergy(crusherBuilding, energyCostKWh);
      if (!powerCheck.ok) {
        return {
          ok: false,
          reason: powerCheck.reason,
          consumedEnergyKWh: 0,
          message_mn: powerCheck.message_mn
        };
      }

      const net = powerCheck.network;
      const preDeductionSnapshot = net.batteries.map(bat => ({
        bat,
        storedEnergy: Number(bat.storedEnergy) || 0
      }));

      // 3. Deduct exact 1.0 kWh batch energy from connected batteries
      let actualConsumedKWh = 0;
      if (energyCostKWh > 0) {
        this._drainNetworkBatteries(net, energyCostKWh);
        actualConsumedKWh = energyCostKWh;
      }

      const rollbackEnergy = () => {
        for (const item of preDeductionSnapshot) {
          item.bat.storedEnergy = item.storedEnergy;
        }
        this.rebuildNetworks();
      };

      // 4. Execute atomic inventory transaction (4 martian_regolith -> 1 iron_ore)
      let recipeOk = false;
      try {
        recipeOk = Boolean(inv.processRecipe({
          input: { itemId: inputItem, quantity: inputQty },
          output: { itemId: outputItem, quantity: outputQty }
        }));
      } catch (err) {
        rollbackEnergy();
        return {
          ok: false,
          reason: 'inventory_error',
          consumedEnergyKWh: 0,
          message_mn: '⚠️ Түүхий эд боловсруулахад алдаа гарлаа'
        };
      }

      if (!recipeOk) {
        rollbackEnergy();
        return {
          ok: false,
          reason: 'inventory_full_or_failed',
          consumedEnergyKWh: 0,
          message_mn: '⚠️ Цүнх дүүрсэн эсвэл түүхий эд хүрэлцэхгүй байна'
        };
      }

      crusherBuilding.isOperating = false;
      crusherBuilding.crusherBatchesCompleted = Math.max(0, Math.floor(Number(crusherBuilding.crusherBatchesCompleted) || 0)) + 1;
      crusherBuilding.lastStopReason = null;
      this.totalCrusherBatchesPowered += 1;
      this.rebuildNetworks();

      const updatedNet = this.getNetworkForBuilding(crusherBuilding);
      return {
        ok: true,
        reason: 'ok',
        consumedEnergyKWh: actualConsumedKWh,
        remainingEnergy: updatedNet ? updatedNet.storedEnergy : 0,
        input: { itemId: inputItem, quantity: inputQty },
        output: { itemId: outputItem, quantity: outputQty },
        batchesCompleted: crusherBuilding.crusherBatchesCompleted,
        message_mn: `⚙️ Бутлав: ${inputQty} Ангарагийн хөрс → +${outputQty} Төмрийн хүдэр (-${actualConsumedKWh.toFixed(1)} ${ENERGY_CONFIG.unitEnergy})`
      };
    } finally {
      this._isProcessingCrusherBatch = false;
    }
  }

  /**
   * Checks whether a station's connected local network can supply `cost` kWh without mutating state.
   */
  canSupplyAnalysisEnergy(stationBuilding, cost = this.analysisEnergyCost) {
    const required = Math.max(0, Number(cost) ?? this.analysisEnergyCost);
    this.rebuildNetworks();

    if (!stationBuilding) {
      return {
        ok: false,
        reason: 'no_station',
        availableEnergy: 0,
        requiredEnergy: required,
        message_mn: '⚠️ Судалгааны станц олдсонгүй'
      };
    }

    const net = this.getNetworkForBuilding(stationBuilding);
    if (!net || !net.hasAnyEnergyNode) {
      return {
        ok: false,
        reason: 'disconnected',
        availableEnergy: 0,
        requiredEnergy: required,
        message_mn: `⚡ Судалгааны станц эрчим хүчний сүлжээнд холбогдоогүй байна (Офлайн — ${this.linkRadius}м дотор нарны станц болон батерей байршуулна уу)`
      };
    }

    if (!net.hasBattery || net.batteryCapacity <= 0) {
      return {
        ok: false,
        reason: 'no_battery',
        availableEnergy: 0,
        requiredEnergy: required,
        message_mn: '⚡ Баазын эрчим хүчний хураагуур (Батерей) холбогдоогүй байна'
      };
    }

    if (net.storedEnergy + 1e-9 < required) {
      return {
        ok: false,
        reason: 'insufficient_energy',
        availableEnergy: net.storedEnergy,
        requiredEnergy: required,
        message_mn: `⚡ Эрчим хүч хүрэлцэхгүй байна (Шаардлагатай: ${required} ${ENERGY_CONFIG.unitEnergy}, Одоо: ${net.storedEnergy.toFixed(1)} / ${net.batteryCapacity} ${ENERGY_CONFIG.unitEnergy})`
      };
    }

    return {
      ok: true,
      reason: 'ok',
      network: net,
      availableEnergy: net.storedEnergy,
      requiredEnergy: required
    };
  }

  /**
   * Validates and atomically consumes discrete energy (kWh) from the Research Station's local network batteries.
   * Returns a `rollback()` closure so callers can restore exact battery levels if downstream journal persistence fails.
   */
  consumeAnalysisEnergy(stationBuilding, cost = this.analysisEnergyCost) {
    const check = this.canSupplyAnalysisEnergy(stationBuilding, cost);
    if (!check.ok) {
      return {
        ok: false,
        reason: check.reason,
        consumed: 0,
        remainingEnergy: check.availableEnergy || 0,
        message_mn: check.message_mn
      };
    }

    const net = check.network;
    const required = check.requiredEnergy;

    // Snapshot battery levels before deduction for atomic rollback safety
    const preDeductionSnapshot = net.batteries.map(bat => ({
      bat,
      storedEnergy: Number(bat.storedEnergy) || 0
    }));

    let remainingToDeduct = required;
    for (const bat of net.batteries) {
      if (remainingToDeduct <= 0) break;
      const modDef = this._resolveModuleDef(bat);
      const cap = Number(modDef?.batteryCapacity) || ENERGY_CONFIG.batteryCapacity;
      const current = Math.max(0, Math.min(cap, Number(bat.storedEnergy) || 0));
      if (current > 0) {
        const deduct = Math.min(current, remainingToDeduct);
        const nextVal = Math.max(0, current - deduct);
        bat.storedEnergy = nextVal < 1e-9 ? 0 : Math.round(nextVal * 1e6) / 1e6;
        remainingToDeduct -= deduct;
      }
    }

    const prevCount = this.totalAnalysesPowered;
    const prevTs = this.lastAnalysisTimestamp;
    this.totalAnalysesPowered += 1;
    this.lastAnalysisTimestamp = Date.now();
    this.lastAnalysisEnergyKWh = required;
    this.rebuildNetworks();

    const updatedNet = this.getNetworkForBuilding(stationBuilding);
    let rolledBack = false;
    const rollback = () => {
      if (rolledBack) return;
      rolledBack = true;
      for (const item of preDeductionSnapshot) {
        item.bat.storedEnergy = item.storedEnergy;
      }
      this.totalAnalysesPowered = prevCount;
      this.lastAnalysisTimestamp = prevTs;
      this.rebuildNetworks();
    };

    return {
      ok: true,
      reason: 'ok',
      consumed: required,
      remainingEnergy: updatedNet ? updatedNet.storedEnergy : 0,
      batteryCapacity: updatedNet ? updatedNet.batteryCapacity : net.batteryCapacity,
      message_mn: `⚡ -${required} ${ENERGY_CONFIG.unitEnergy} зарцуулагдлаа`,
      rollback
    };
  }

  getState() {
    this.rebuildNetworks();
    const batteryStates = {};
    const machineStates = {};
    const placed = this.game?.buildingSystem?.placedBuildings || [];
    for (const b of placed) {
      if (!b || !b.id) continue;
      const modDef = this._resolveModuleDef(b);
      if (modDef?.batteryCapacity > 0) {
        const clamped = Math.max(0, Math.min(modDef.batteryCapacity, Number(b.storedEnergy) || 0));
        batteryStates[b.id] = Math.round(clamped * 1e6) / 1e6;
      }
      if (modDef?.id === 'build_oxygen_gen' || modDef?.id === 'build_ore_crusher') {
        machineStates[b.id] = {
          moduleId: modDef.id,
          isOperating: modDef.id === 'build_ore_crusher' ? false : Boolean(b.isOperating),
          oxygenGenerated: Math.max(0, Math.round((Number(b.oxygenGenerated) || 0) * 1e6) / 1e6),
          oxygenCanisterProgress: Math.max(0, Math.min(1, Math.round((Number(b.oxygenCanisterProgress) || 0) * 1e6) / 1e6)),
          oxygenCanistersStored: Math.max(0, Math.floor(Number(b.oxygenCanistersStored) || 0)),
          waterFeedstockKg: Math.max(0, Math.round((Number(b.waterFeedstockKg) || 0) * 1e6) / 1e6),
          iceChunksConsumed: Math.max(0, Math.floor(Number(b.iceChunksConsumed) || 0)),
          crusherBatchesCompleted: Math.max(0, Math.floor(Number(b.crusherBatchesCompleted) || 0)),
          lastStopReason: b.lastStopReason || null
        };
      }
    }
    return {
      version: 4,
      linkRadius: this.linkRadius,
      totalAnalysesPowered: this.totalAnalysesPowered,
      lastAnalysisTimestamp: this.lastAnalysisTimestamp,
      totalOxygenKgProduced: Math.round(this.totalOxygenKgProduced * 1e6) / 1e6,
      totalOxygenCanistersProduced: this.totalOxygenCanistersProduced,
      totalIceChunksConsumed: this.totalIceChunksConsumed,
      totalCrusherBatchesPowered: this.totalCrusherBatchesPowered,
      batteryStates,
      machineStates
    };
  }

  loadState(savedState = null) {
    if (savedState && typeof savedState === 'object') {
      this.totalAnalysesPowered = Number(savedState.totalAnalysesPowered) || 0;
      this.lastAnalysisTimestamp = Number(savedState.lastAnalysisTimestamp) || 0;
      this.totalOxygenKgProduced = Math.max(0, Number(savedState.totalOxygenKgProduced) || 0);
      this.totalOxygenCanistersProduced = Math.max(0, Math.floor(Number(savedState.totalOxygenCanistersProduced) || 0));
      this.totalIceChunksConsumed = Math.max(0, Math.floor(Number(savedState.totalIceChunksConsumed) || 0));
      this.totalCrusherBatchesPowered = Math.max(0, Math.floor(Number(savedState.totalCrusherBatchesPowered) || 0));

      const batteryStates = savedState.batteryStates;
      const machineStates = savedState.machineStates;
      const placed = this.game?.buildingSystem?.placedBuildings || [];
      for (const b of placed) {
        if (!b || !b.id) continue;
        const modDef = this._resolveModuleDef(b);
        if (modDef?.batteryCapacity > 0 && batteryStates && batteryStates[b.id] !== undefined) {
          const restored = Number(batteryStates[b.id]);
          if (Number.isFinite(restored)) {
            b.storedEnergy = Math.max(0, Math.min(modDef.batteryCapacity, restored));
          }
        }
        if ((modDef?.id === 'build_oxygen_gen' || modDef?.id === 'build_ore_crusher') && machineStates && machineStates[b.id]) {
          const ms = machineStates[b.id];
          b.isOperating = modDef.id === 'build_ore_crusher' ? false : Boolean(ms.isOperating);
          b.oxygenGenerated = Math.max(0, Number(ms.oxygenGenerated) || 0);
          b.oxygenCanisterProgress = Math.max(0, Math.min(1, Number(ms.oxygenCanisterProgress) || 0));
          b.oxygenCanistersStored = Math.max(0, Math.floor(Number(ms.oxygenCanistersStored) || 0));
          b.waterFeedstockKg = Math.max(0, Number(ms.waterFeedstockKg) || 0);
          b.iceChunksConsumed = Math.max(0, Math.floor(Number(ms.iceChunksConsumed) || 0));
          b.crusherBatchesCompleted = Math.max(0, Math.floor(Number(ms.crusherBatchesCompleted) || 0));
          b.lastStopReason = ms.lastStopReason || null;
        }
      }
    } else {
      this.totalAnalysesPowered = 0;
      this.lastAnalysisTimestamp = 0;
      this.totalOxygenKgProduced = 0;
      this.totalOxygenCanistersProduced = 0;
      this.totalIceChunksConsumed = 0;
      this.totalCrusherBatchesPowered = 0;
    }
    this.rebuildNetworks();
  }

  reset() {
    this.totalAnalysesPowered = 0;
    this.lastAnalysisTimestamp = 0;
    this.lastAnalysisEnergyKWh = 0;
    this.totalOxygenKgProduced = 0;
    this.totalOxygenCanistersProduced = 0;
    this.totalIceChunksConsumed = 0;
    this.totalCrusherBatchesPowered = 0;
    this.rebuildNetworks();
  }
}
