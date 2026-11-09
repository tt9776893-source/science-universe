import { SURVIVAL_CONFIG } from '../core/Constants.js';
import { audio } from '../audio/ProceduralAudio.js';

export class SurvivalSystem {
  constructor() {
    this.oxygen = SURVIVAL_CONFIG.maxOxygen;
    this.power = SURVIVAL_CONFIG.maxPower;
    this.health = SURVIVAL_CONFIG.maxHealth;
    this.water = SURVIVAL_CONFIG.maxWater;
    this.food = SURVIVAL_CONFIG.maxFood;
    
    this.temperature = SURVIVAL_CONFIG.suitTargetTemp;
    this.isLowO2WarningActive = false;
    this.lastAlarmTime = 0;
    this.ambientDayTemperature = SURVIVAL_CONFIG.ambientTempDay;
    this.ambientNightTemperature = SURVIVAL_CONFIG.ambientTempNight;
  }

  setPlanet(config) {
    if (!config) return false;
    this.ambientDayTemperature = config.temperatureC.day;
    this.ambientNightTemperature = config.temperatureC.night;
    return true;
  }

  update(delta, isFlashlightOn, isLaserFiring, solarFactor, now, ambientTemperature = this.ambientNightTemperature) {
    // 1. Oxygen consumption
    this.oxygen = Math.max(0, this.oxygen - SURVIVAL_CONFIG.oxygenDepletionRate * delta);

    // Oxygen alarms
    if (this.oxygen <= SURVIVAL_CONFIG.lowOxygenWarningThreshold && this.oxygen > 0) {
      if (now - this.lastAlarmTime > 4000) {
        audio.playWarningBeep();
        this.lastAlarmTime = now;
      }
    }

    // Suffocation if O2 is zero
    if (this.oxygen <= 0) {
      this.health = Math.max(0, this.health - SURVIVAL_CONFIG.suffocationDamageRate * delta);
    }

    // 2. Suit Battery / Power
    let powerDrain = SURVIVAL_CONFIG.powerIdleDrainRate;
    if (isFlashlightOn) powerDrain += SURVIVAL_CONFIG.flashlightPowerDrain;
    if (isLaserFiring) powerDrain += SURVIVAL_CONFIG.laserPowerDrain;

    // Solar trickle recharge during peak daylight
    const solarRecharge = solarFactor * 0.08;
    this.power = Math.min(SURVIVAL_CONFIG.maxPower, Math.max(0, this.power - (powerDrain - solarRecharge) * delta));

    // 3. Hydration & Food
    this.water = Math.max(0, this.water - SURVIVAL_CONFIG.waterDrainRate * delta);
    this.food = Math.max(0, this.food - SURVIVAL_CONFIG.foodDrainRate * delta);

    // 4. Suit Internal Temperature Regulation
    // As long as power > 0, thermal regulator holds steady at ~21°C
    if (this.power > 5) {
      this.temperature = 21.0 + (Math.sin(now * 0.001) * 0.4);
    } else {
      this.temperature += (ambientTemperature - this.temperature) * Math.min(1, 0.1 * delta);
      if (this.temperature < 0 || this.temperature > 45) {
        this.health = Math.max(0, this.health - 2.5 * delta);
      }
    }
  }

  replenishOxygen(amount) {
    this.oxygen = Math.min(SURVIVAL_CONFIG.maxOxygen, this.oxygen + amount);
    audio.playPickupChime();
  }

  replenishPower(amount) {
    this.power = Math.min(SURVIVAL_CONFIG.maxPower, this.power + amount);
    audio.playPickupChime();
  }

  replenishHealth(amount) {
    this.health = Math.min(SURVIVAL_CONFIG.maxHealth, this.health + amount);
    audio.playPickupChime();
  }

  getState() {
    return {
      oxygen: Math.round(this.oxygen),
      power: Math.round(this.power),
      health: Math.round(this.health),
      water: Math.round(this.water),
      food: Math.round(this.food),
      temperature: Math.round(this.temperature)
    };
  }

  resetToFullVitals() {
    this.oxygen = SURVIVAL_CONFIG.maxOxygen;
    this.power = SURVIVAL_CONFIG.maxPower;
    this.health = SURVIVAL_CONFIG.maxHealth;
    this.water = SURVIVAL_CONFIG.maxWater;
    this.food = SURVIVAL_CONFIG.maxFood;
    this.temperature = SURVIVAL_CONFIG.suitTargetTemp;
    this.isLowO2WarningActive = false;
    this.lastAlarmTime = 0;
  }

  loadState(state) {
    if (!state) return;
    this.oxygen = state.oxygen ?? this.oxygen;
    this.power = state.power ?? this.power;
    this.health = state.health ?? this.health;
    this.water = state.water ?? this.water;
    this.food = state.food ?? this.food;
    this.temperature = state.temperature ?? this.temperature;
  }
}
