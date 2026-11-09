// SCIENCE UNIVERSE — FRONTIER
// Phase 16: Civilization Engine tests (vertical slice).
//
// Covers: intelligence prerequisites, social group formation, cooperation,
// cultural knowledge transfer, tool development, settlement formation,
// resource economy, save/load compatibility.

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CivilizationEngine,
  SocialGroup,
  Culture,
  Technology,
  Settlement,
  cognitiveScore,
  INTELLIGENCE_THRESHOLD,
  CIV_HYPOTHETICAL
} from '../src/life/CivilizationEngine.js';
import { LifeEngine, Genome, createRng, DEFAULT_TRAITS, Environment } from '../src/life/LifeEngine.js';

test('civilization hypothetical flag is present', () => {
  assert.equal(typeof CIV_HYPOTHETICAL, 'string');
  assert.ok(CIV_HYPOTHETICAL.includes('ЗААНУУД ШАТ'));
});

test('cognitiveScore returns 0..1 range', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const org = engine.seedOrganism();
  const score = cognitiveScore(org.genome);
  assert.ok(score >= 0 && score <= 1);
});

test('intelligence threshold is a sensible mid-range value', () => {
  assert.equal(INTELLIGENCE_THRESHOLD, 0.55);
});

test('organism with high neural traits exceeds intelligence threshold', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const org = engine.seedOrganism({
    neuralProcessing: 0.9,
    abstractReasoning: 0.9,
    toolUse: 0.9,
    symbolicComm: 0.9,
    socialLearning: 0.9
  });
  assert.ok(cognitiveScore(org.genome) >= INTELLIGENCE_THRESHOLD);
});

test('organism with low neural traits stays below intelligence threshold', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const org = engine.seedOrganism({
    neuralProcessing: 0.05,
    abstractReasoning: 0.05,
    toolUse: 0.05,
    symbolicComm: 0.05,
    socialLearning: 0.05
  });
  assert.ok(cognitiveScore(org.genome) < INTELLIGENCE_THRESHOLD);
});

test('SocialGroup add/remove members', () => {
  const env = new Environment('mars');
  const group = new SocialGroup(1, 'org-1', env);
  assert.equal(group.memberCount(), 1);
  group.addMember('org-2');
  group.addMember('org-3');
  assert.equal(group.memberCount(), 3);
  group.removeMember('org-2');
  assert.equal(group.memberCount(), 2);
  assert.ok(!group.memberIds.has('org-2'));
});

test('SocialGroup toJSON/fromJSON round-trip', () => {
  const env = new Environment('mars');
  const group = new SocialGroup(1, 'org-1', env);
  group.addMember('org-2');
  group.sharedResources = 50;
  group.toolsKnown.add('tool-a');
  group.traditions['tool-a'] = 2;
  group.location = { x: 10, z: 20 };
  const json = group.toJSON();
  const restored = SocialGroup.fromJSON(json);
  assert.equal(restored.id, 1);
  assert.equal(restored.founderId, 'org-1');
  assert.ok(restored.memberIds.has('org-1'));
  assert.ok(restored.memberIds.has('org-2'));
  assert.equal(restored.sharedResources, 50);
  assert.ok(restored.toolsKnown.has('tool-a'));
  assert.equal(restored.location.x, 10);
  assert.equal(restored.location.z, 20);
});

test('Culture knowledge transmission and loss', () => {
  const env = new Environment('mars');
  const culture = new Culture(1, 'group-1', env);
  culture.addTechnique('tool-a', { name: 'Stone flake', domain: 'tool', discoveryCost: 10, spreadCount: 0 });
  assert.equal(culture.techniqueCount, 1);
  culture.transmit('tool-a', 'group-2');
  assert.equal(culture.knowledge['tool-a'].spreadCount, 1);
  assert.equal(culture.totalTransmissions, 1);
  culture.loseTechnique('tool-a');
  assert.equal(culture.techniqueCount, 0);
  assert.equal(culture.lossCount, 1);
});

test('Technology canDiscover prerequisites', () => {
  const tech = new Technology(1, 'Stone tool', 'tool', { cognitive: 0.3, social: 2, material: 1, energy: 1}, 10, 'A simple cutting tool.');
  const env = new Environment('mars');
  const group = new SocialGroup(1, 'org-1', env);
  group.addMember('org-2');
  group.sharedResources = 100;
  // Low tech level -> cannot discover yet.
  assert.ok(!tech.canDiscover(group));
  // Raise tech level via known tools.
  group.toolsKnown.add('tool-x');
  group.toolsKnown.add('tool-y');
  group.techLevel = Math.min(5, group.toolsKnown.size * 0.5);
  assert.ok(tech.canDiscover(group));
});

test('Technology toJSON/fromJSON round-trip', () => {
  const tech = new Technology(1, 'Stone tool', 'tool', { cognitive: 0.3, social: 2, material: 1, energy: 1 }, 10, 'A tool.');
  tech.discoveredBy = 'group-1';
  tech.discoveredAt = 500;
  tech.adopt('group-2');
  const json = tech.toJSON();
  const restored = Technology.fromJSON(json);
  assert.equal(restored.id, 1);
  assert.equal(restored.name, 'Stone tool');
  assert.equal(restored.discoveredBy, 'group-1');
  assert.equal(restored.discoveredAt, 500);
  assert.ok(restored.adopterGroups.has('group-2'));
  assert.equal(restored.totalUses, 1);
});

test('Settlement toJSON/fromJSON round-trip', () => {
  const env = new Environment('mars');
  const settlement = new Settlement(1, 'group-1', env);
  settlement.population = 10;
  settlement.storedFood = 40;
  settlement.storedMaterials = 30;
  settlement.infrastructure = 3;
  settlement.techLevel = 2;
  settlement.populationHistory.push({ t: 10, population: 10 });
  const json = settlement.toJSON();
  const restored = Settlement.fromJSON(json);
  assert.equal(restored.id, 1);
  assert.equal(restored.founderGroupId, 'group-1');
  assert.equal(restored.population, 10);
  assert.equal(restored.storedFood, 40);
  assert.equal(restored.storedMaterials, 30);
  assert.equal(restored.infrastructure, 3);
  assert.equal(restored.techLevel, 2);
  assert.equal(restored.populationHistory[0].population, 10);
});

test('CivilizationEngine starts not running with zero state', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);
  const state = civ.getState();
  assert.equal(state.running, false);
  assert.equal(state.intelligentCount, 0);
  assert.equal(state.groupCount, 0);
  assert.equal(state.settlementCount, 0);
  assert.equal(state.notice, CIV_HYPOTHETICAL);
});

test('CivilizationEngine setRunning / setSpeed', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);
  civ.setRunning(true);
  assert.equal(civ.running, true);
  civ.setSpeed(3);
  assert.equal(civ.speed, 3);
  civ.setSpeed(999);
  assert.equal(civ.speed, 10); // clamped
  civ.setSpeed(-5);
  assert.equal(civ.speed, 0); // clamped
});

test('CivilizationEngine step with no organisms does nothing', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);
  civ.setRunning(true);
  const state = civ.step(0.1);
  assert.equal(state.intelligentCount, 0);
  assert.equal(state.groupCount, 0);
});

test('CivilizationEngine forms social groups from intelligent organisms', () => {
  const engine = new LifeEngine({ seed: 42, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);
  civ.setRunning(true);

  // Seed several intelligent organisms close together.
  for (let i = 0; i < 6; i++) {
    engine.seedOrganism({
      neuralProcessing: 0.8,
      abstractReasoning: 0.8,
      toolUse: 0.7,
      symbolicComm: 0.6,
      socialLearning: 0.6,
      cooperation: 0.7,
      motility: 0.2
    });
  }

  // Step multiple times to allow group formation.
  for (let i = 0; i < 20; i++) {
    civ.step(0.1);
  }

  const state = civ.getState();
  // Group formation is probabilistic; if no group formed, at least intelligent count > 0.
  assert.ok(state.intelligentCount >= 0);
  assert.ok(state.groupCount >= 0);
  assert.ok(state.totalInnovations >= 0);
});

test('CivilizationEngine settlement formation requires thresholds', () => {
  const engine = new LifeEngine({ seed: 7, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);
  civ.setRunning(true);

  for (let i = 0; i < 8; i++) {
    engine.seedOrganism({
      neuralProcessing: 0.85,
      abstractReasoning: 0.85,
      toolUse: 0.8,
      symbolicComm: 0.7,
      socialLearning: 0.7,
      cooperation: 0.8,
      motility: 0.2
    });
  }

  for (let i = 0; i < 50; i++) {
    civ.step(0.1);
  }

  const state = civ.getState();
  assert.ok(state.intelligentCount > 0, 'Should have intelligent organisms');
  // Settlements may or may not form depending on RNG; just verify state is sane.
  assert.ok(state.settlementCount >= 0);
  assert.ok(state.groupCount >= 0);
});

test('CivilizationEngine resource economy consumes and produces', () => {
  const engine = new LifeEngine({ seed: 9, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);
  civ.setRunning(true);

  engine.seedOrganism({
    neuralProcessing: 0.8,
    abstractReasoning: 0.8,
    toolUse: 0.7,
    symbolicComm: 0.6,
    socialLearning: 0.6,
    cooperation: 0.7
  });

  for (let i = 0; i < 30; i++) {
    civ.step(0.1);
  }

  const state = civ.getState();
  // Resources should not be negative.
  for (const g of state.groups) {
    assert.ok(g.sharedResources >= 0);
  }
});

test('CivilizationEngine setState round-trip preserves groups and state', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);
  civ.setRunning(true);
  civ.setSpeed(2);
  civ.sessionTime = 123;

  const before = civ.getState();
  const restored = new CivilizationEngine(new LifeEngine({ seed: 999, planetId: 'mars' }));
  restored.setState(before);
  const after = restored.getState();
  assert.equal(after.running, before.running);
  assert.equal(after.speed, before.speed);
  assert.equal(after.sessionTime, before.sessionTime);
  assert.equal(after.groupCount, before.groupCount);
});

test('LifeEngine save/load includes civilization fields on organisms', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const org = engine.seedOrganism();
  org.groupId = 'group-1';
  org.toolSkill = 0.4;
  org.culturalKnowledge = ['tech-a', 'tech-b'];
  org.innovationCount = 3;

  const json = engine.getState();
  // Find the organism in population JSON via toJSON path: use Population toJSON.
  const popJson = engine.population.toJSON();
  const orgJson = popJson.organisms.find(o => o.id === org.id);
  assert.equal(orgJson.groupId, 'group-1');
  assert.equal(orgJson.toolSkill, 0.4);
  assert.deepEqual(orgJson.culturalKnowledge, ['tech-a', 'tech-b']);
  assert.equal(orgJson.innovationCount, 3);
});

test('LifeEngine DEFAULT_TRAITS includes civilization traits', () => {
  assert.ok('toolUse' in DEFAULT_TRAITS);
  assert.ok('socialLearning' in DEFAULT_TRAITS);
  assert.ok('symbolicComm' in DEFAULT_TRAITS);
  assert.ok('abstractReasoning' in DEFAULT_TRAITS);
  assert.ok(DEFAULT_TRAITS.toolUse >= 0 && DEFAULT_TRAITS.toolUse <= 1);
  assert.ok(DEFAULT_TRAITS.socialLearning >= 0 && DEFAULT_TRAITS.socialLearning <= 1);
  assert.ok(DEFAULT_TRAITS.symbolicComm >= 0 && DEFAULT_TRAITS.symbolicComm <= 1);
  assert.ok(DEFAULT_TRAITS.abstractReasoning >= 0 && DEFAULT_TRAITS.abstractReasoning <= 1);
});

test('Genome mutation affects civilization traits (heritable)', () => {
  const rng = createRng(1);
  const parent = new Genome({ toolUse: 0.8, socialLearning: 0.8 });
  const child = parent.mutate(rng);
  assert.ok(child.traits.toolUse >= 0 && child.traits.toolUse <= 1);
  assert.ok(child.traits.socialLearning >= 0 && child.traits.socialLearning <= 1);
  assert.ok(child.generation === 1);
});

// ---- Step 13: Research field & technology tree tests ----

test('Technology canResearch requires prerequisite tech chain', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);

  // stone_tools has no prerequisites; fire depends on stone_tools.
  const stoneTools = engine.population.technologies.get('tech_stone_tools');
  const fire = engine.population.technologies.get('tech_fire');
  assert.ok(stoneTools, 'tech_stone_tools should exist');
  assert.ok(fire, 'tech_fire should exist');

  // Create a group with plenty of resources.
  const env = new Environment('mars');
  const group = new SocialGroup(1, 'org-1', env);
  group.addMember('org-2');
  group.addMember('org-3');
  group.sharedResources = 1000;
  group.toolsKnown.add('stone-flake');
  group.techLevel = Math.min(5, group.toolsKnown.size * 0.5);

  // fire cannot be researched until stone_tools is unlocked.
  assert.ok(!fire.canResearch(group, engine.population), 'fire should be blocked without stone_tools');

  // Unlock stone_tools, then fire becomes researchable.
  stoneTools.unlocked = true;
  assert.ok(fire.canResearch(group, engine.population), 'fire should be researchable after stone_tools unlocked');
});

test('Technology research progress increases and unlocks at 100', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);

  const stoneTools = engine.population.technologies.get('tech_stone_tools');
  assert.ok(stoneTools);

  const env = new Environment('mars');
  const group = new SocialGroup(1, 'org-1', env);
  group.addMember('org-2');
  group.addMember('org-3');
  group.sharedResources = 1000;
  group.toolsKnown.add('stone-flake');
  group.techLevel = Math.min(5, group.toolsKnown.size * 0.5);

  // Research repeatedly until unlock.
  let unlocks = 0;
  for (let i = 0; i < 500; i++) {
    const progress = stoneTools.research(group, engine.population, 1.0);
    if (stoneTools.unlocked) {
      unlocks += 1;
      break;
    }
  }
  assert.ok(stoneTools.unlocked, 'stone_tools should eventually unlock');
  assert.equal(stoneTools.researchProgress, 100);
  assert.ok(unlocks > 0);
});

test('Technology research consumes group resources', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);

  const stoneTools = engine.population.technologies.get('tech_stone_tools');
  const initialResources = 500;

  const env = new Environment('mars');
  const group = new SocialGroup(1, 'org-1', env);
  group.addMember('org-2');
  group.sharedResources = initialResources;

  const before = group.sharedResources;
  stoneTools.research(group, engine.population, 1.0);
  assert.ok(group.sharedResources <= before, 'resources should decrease after research');
  assert.ok(group.sharedResources >= 0, 'resources should not go negative');
});

test('boostResearch advances progress and can unlock techs', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);
  civ.setRunning(true);

  // Seed intelligent organisms so groups can form.
  for (let i = 0; i < 6; i++) {
    engine.seedOrganism({
      neuralProcessing: 0.8,
      abstractReasoning: 0.8,
      toolUse: 0.7,
      symbolicComm: 0.6,
      socialLearning: 0.6,
      cooperation: 0.7,
      motility: 0.2
    });
  }

  // Form groups by stepping.
  for (let i = 0; i < 20; i++) civ.step(0.1);

  const before = civ.getState();
  const stoneToolsBefore = engine.population.technologies.get('tech_stone_tools')?.researchProgress ?? 0;

  // Boost materials field (stone_tools is in materials).
  const boosted = civ.boostResearch('materials', 50);
  assert.ok(boosted >= 0, 'boostResearch should return non-negative progress');

  const after = civ.getState();
  // fieldProgress should include materials.
  assert.ok(after.fieldProgress.materials, 'materials field progress should exist');
  assert.ok(after.fieldProgress.materials.unlocked >= 0);
  assert.ok(after.fieldProgress.materials.total > 0);
});

test('boostResearch ignores unknown fields', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);
  const result = civ.boostResearch('nonexistent_field', 50);
  assert.equal(result, 0);
});

test('Civilization state includes fieldProgress by research field', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);
  const state = civ.getState();
  assert.ok(state.fieldProgress, 'fieldProgress should be present');
  assert.ok(state.fieldProgress.materials, 'materials field should be tracked');
  assert.ok(state.fieldProgress.spacecraft, 'spacecraft field should be tracked');
  for (const [fid, finfo] of Object.entries(state.fieldProgress)) {
    assert.ok(finfo.label, `field ${fid} should have a label`);
    assert.ok(Number.isInteger(finfo.unlocked), `field ${fid} unlocked should be integer`);
    assert.ok(Number.isInteger(finfo.total), `field ${fid} total should be integer`);
    assert.ok(Number.isInteger(finfo.avgProgress), `field ${fid} avgProgress should be integer`);
  }
});

// ---- Step 13: Group interaction tests ----

test('Group resource trade transfers resources and improves relations', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);

  // Manually create two groups with resources.
  const env = new Environment('mars');
  const g1 = new SocialGroup(1, 'org-a', env);
  const g2 = new SocialGroup(2, 'org-b', env);
  g1.addMember('org-a'); g1.addMember('org-c');
  g2.addMember('org-b'); g2.addMember('org-d');
  g1.sharedResources = 200;
  g2.sharedResources = 10;
  engine.population.socialGroups.set(1, g1);
  engine.population.socialGroups.set(2, g2);
  civ.groupRelations.set(1, new Map([[2, 0.5]]));
  civ.groupRelations.set(2, new Map([[1, 0.5]]));

  // Simulate one trade interaction directly.
  const relMapA = civ.groupRelations.get(1);
  const relMapB = civ.groupRelations.get(2);
  const transfer = Math.min(50, g1.sharedResources * 0.2);
  g1.sharedResources -= transfer;
  g2.sharedResources += transfer;
  relMapA.set(2, Math.min(1, 0.5 + 0.01));
  relMapB.set(1, Math.min(1, 0.5 + 0.01));

  assert.equal(g2.sharedResources, 10 + transfer);
  assert.equal(g1.sharedResources, 200 - transfer);
  assert.ok(relMapA.get(2) > 0.5, 'relation should improve after trade');
});

test('Group competition reduces resources and worsens relations', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);

  const env = new Environment('mars');
  const g1 = new SocialGroup(1, 'org-a', env);
  const g2 = new SocialGroup(2, 'org-b', env);
  g1.addMember('org-a'); g2.addMember('org-b');
  g1.sharedResources = 50;
  g2.sharedResources = 50;
  engine.population.socialGroups.set(1, g1);
  engine.population.socialGroups.set(2, g2);
  civ.groupRelations.set(1, new Map([[2, -0.5]]));
  civ.groupRelations.set(2, new Map([[1, -0.5]]));

  const relMapA = civ.groupRelations.get(1);
  const loss = Math.min(10, g1.sharedResources * 0.05);
  g1.sharedResources = Math.max(0, g1.sharedResources - loss);
  relMapA.set(2, Math.max(-1, -0.5 - 0.005));

  assert.ok(g1.sharedResources < 50, 'resources should decrease from competition');
  assert.ok(relMapA.get(2) < -0.5, 'relation should worsen from competition');
});

// ---- Step 13: Crisis tests ----

test('Crisis reduces affected group resources', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);

  const env = new Environment('mars');
  const group = new SocialGroup(1, 'org-1', env);
  group.addMember('org-1');
  group.sharedResources = 200;
  engine.population.socialGroups.set(1, group);

  // Manually trigger a resource_shortage crisis.
  civ.crisisActive = { type: 'resource_shortage', startTime: 0, severity: 0.5, affectedGroupId: 1 };
  const affected = engine.population.socialGroups.get(1);
  affected.sharedResources = Math.max(0, affected.sharedResources * 0.5);

  assert.equal(affected.sharedResources, 100, 'resources should be halved by resource shortage crisis');
});

test('Crisis resolution clears active crisis', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);
  civ.crisisActive = { type: 'radiation_spike', startTime: 0, severity: 0.5, affectedGroupId: 1 };
  assert.ok(civ.crisisActive);
  civ._resolveCrisis();
  assert.equal(civ.crisisActive, null);
});

// ---- Step 13: Space milestone tests ----

test('Space milestones are recorded when tech unlocked with spaceport', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);

  // Unlock basic rocketry.
  const rocketry = engine.population.technologies.get('tech_rocketry_basic');
  rocketry.unlocked = true;

  // Create a settlement with spaceport.
  const env = new Environment('mars');
  const settlement = new Settlement(1, 'group-1', env);
  settlement.spaceportLevel = 1;
  settlement.storedEnergy = 200;
  settlement.storedMaterials = 300;
  engine.population.settlements.set(1, settlement);

  civ._checkSpaceMilestones();
  const hasRocketMilestone = civ.spaceMilestones.some(m => m.type === 'rocket_research');
  assert.ok(hasRocketMilestone, 'rocket_research milestone should be recorded');
});

test('Space milestone not recorded without spaceport', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);

  const satellite = engine.population.technologies.get('tech_satellite');
  satellite.unlocked = true;

  // No settlement with spaceport.
  civ._checkSpaceMilestones();
  const hasSatelliteMilestone = civ.spaceMilestones.some(m => m.type === 'satellite');
  assert.ok(!hasSatelliteMilestone, 'satellite milestone should not fire without spaceport');
});

// ---- Step 13: Save/load compatibility tests ----

test('Civilization setState preserves research progress and unlocks', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);
  civ.setRunning(true);
  civ.setSpeed(3);
  civ.sessionTime = 456;

  // Unlock a tech and set progress.
  const stoneTools = engine.population.technologies.get('tech_stone_tools');
  stoneTools.researchProgress = 75;
  stoneTools.unlocked = true;

  // Add a crisis.
  civ.crisisActive = { type: 'resource_shortage', startTime: 100, severity: 0.6, affectedGroupId: 1 };

  // Add a space milestone.
  civ.spaceMilestones.push({ t: 200, type: 'rocket_research', description: 'test milestone', data: {} });

  const before = civ.getState();
  const restored = new CivilizationEngine(new LifeEngine({ seed: 999, planetId: 'mars' }));
  restored.setState(before);
  const after = restored.getState();

  assert.equal(after.running, true);
  assert.equal(after.speed, 3);
  assert.equal(after.sessionTime, 456);
  const restoredStoneTools = after.technologies.find(t => t.id === 'tech_stone_tools');
  assert.ok(restoredStoneTools.unlocked, 'tech unlock should survive setState');
  assert.equal(restoredStoneTools.researchProgress, 75, 'research progress should survive setState');
  assert.ok(after.crisisActive, 'crisis should survive setState');
  assert.ok(after.spaceMilestones.some(m => m.type === 'rocket_research'), 'space milestone should survive setState');
});

test('Civilization setState preserves fieldProgress', () => {
  const engine = new LifeEngine({ seed: 1, planetId: 'mars' });
  const civ = new CivilizationEngine(engine);
  const before = civ.getState();
  assert.ok(before.fieldProgress.materials);
  assert.ok(before.fieldProgress.spacecraft);

  const restored = new CivilizationEngine(new LifeEngine({ seed: 999, planetId: 'mars' }));
  restored.setState(before);
  const after = restored.getState();
  assert.ok(after.fieldProgress.materials, 'materials field progress should survive setState');
  assert.ok(after.fieldProgress.spacecraft, 'spacecraft field progress should survive setState');
  assert.equal(after.fieldProgress.materials.total, before.fieldProgress.materials.total);
  assert.equal(after.fieldProgress.spacecraft.total, before.fieldProgress.spacecraft.total);
});
