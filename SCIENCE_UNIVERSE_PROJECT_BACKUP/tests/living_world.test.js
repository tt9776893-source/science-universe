import assert from 'node:assert/strict';
import test from 'node:test';
import { ResearchNPCBrain } from '../src/world/LivingWorldSystem.js';
import { ScienceAcademy } from '../src/education/ScienceAcademy.js';
import * as THREE from 'three';

function makeStorage() {
  const data = new Map();
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value)
  };
}

test('research NPCs walk their route and react to a nearby player', () => {
  const position = new THREE.Vector3(0, 0, 0);
  const brain = new ResearchNPCBrain({
    id: 'scientist-test',
    position,
    waypoints: [new THREE.Vector3(2, 0, 0), new THREE.Vector3(2, 0, 2)],
    speed: 1
  });
  for (let index = 0; index < 12; index++) brain.update(0.25, new THREE.Vector3(20, 0, 20));
  assert.ok(position.distanceTo(new THREE.Vector3(0, 0, 0)) > 0.5);
  const response = brain.update(0.3, position);
  assert.equal(response.state, 'reacting');
});

test('wildlife flees nearby players rather than standing still', () => {
  const position = new THREE.Vector3(0, 0, 0);
  const brain = new ResearchNPCBrain({
    id: 'hare-test',
    position,
    waypoints: [new THREE.Vector3(3, 0, 0)],
    speed: 1,
    kind: 'wildlife'
  });
  const response = brain.update(0.3, new THREE.Vector3(1, 0, 0));
  assert.equal(response.state, 'fleeing');
  assert.ok(position.x < 0);
});

test('research NPCs steer around blocked waypoint steps', () => {
  const position = new THREE.Vector3(0, 0, 0);
  const brain = new ResearchNPCBrain({
    id: 'avoid-test',
    position,
    waypoints: [new THREE.Vector3(3, 0, 0)],
    speed: 1,
    isBlocked: (x, z) => x > 0.05 && Math.abs(z) < 0.3
  });
  for (let index = 0; index < 8; index++) brain.update(0.25, new THREE.Vector3(20, 0, 20));
  assert.notEqual(brain.state, 'walking');
  assert.ok(Math.abs(position.z) > 0);
});

test('human researchers rest during local night while robotic probes keep working', () => {
  const player = new THREE.Vector3(10, 0, 0);
  const humanPosition = new THREE.Vector3(0, 0, 0);
  const robotPosition = new THREE.Vector3(0, 0, 0);
  const route = [new THREE.Vector3(3, 0, 0)];
  const human = new ResearchNPCBrain({ id: 'human-night', position: humanPosition, waypoints: route, schedule: 'day' });
  const robot = new ResearchNPCBrain({ id: 'robot-night', position: robotPosition, waypoints: route, kind: 'robot', schedule: 'continuous' });
  const humanResult = human.update(0.3, player, true, false);
  const robotResult = robot.update(0.3, player, true, false);
  assert.equal(humanResult.state, 'resting');
  assert.equal(humanPosition.x, 0);
  assert.ok(robotPosition.x > 0);
  assert.equal(robotResult.state, 'walking');
});

test('research actions, greenhouse growth, and outpost reserves persist per slot', () => {
  const storage = makeStorage();
  const academy = new ScienceAcademy(() => 'slot_2', storage);
  assert.equal(academy.recordResearchAction('mars-colony-assignment'), true);
  assert.equal(academy.recordResearchAction('mars-colony-assignment'), false);
  assert.equal(academy.advanceGreenhouse('mars-greenhouse').stage, 1);
  assert.equal(academy.advanceGreenhouse('mars-greenhouse').stage, 2);
  const before = academy.getOutpostResources('mars');
  academy.simulateOutpostMinute('mars', 2);
  academy.serviceOutpost('mars');

  const restored = new ScienceAcademy(() => 'slot_2', storage);
  const state = restored.getState();
  assert.equal(state.greenhouseStages['mars-greenhouse'], 2);
  assert.ok(state.researchActions.includes('mars-colony-assignment'));
  assert.ok(state.outpostResources.mars.oxygen > before.oxygen - 1);
  assert.equal(restored.getMissionObjectives().find(objective => objective.id === 'research:mars-greenhouse').complete, true);
});

test('lunar airlock state persists and mission progress remains slot-scoped', () => {
  const storage = makeStorage();
  const academy = new ScienceAcademy(() => 'slot_3', storage);
  assert.equal(academy.getOutpostSystems('moon').airlockState, 'SEALED');
  academy.setOutpostAirlockState('moon', 'PRESSURIZING');
  academy.recordResearchAction('moon-airlock-cycle');
  const restored = new ScienceAcademy(() => 'slot_3', storage);
  assert.equal(restored.getOutpostSystems('moon').airlockState, 'PRESSURIZING');
  assert.equal(restored.getMissionObjectives().find(objective => objective.id === 'research:moon-airlock').complete, true);
});