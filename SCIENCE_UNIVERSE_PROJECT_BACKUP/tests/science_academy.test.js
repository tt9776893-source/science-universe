import assert from 'node:assert/strict';
import test from 'node:test';
import { SCIENCE_LABS, ScienceAcademy } from '../src/education/ScienceAcademy.js';

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

test('all thirteen labs contain three multiple-choice learning checks', () => {
  assert.equal(SCIENCE_LABS.length, 13);
  for (const lab of SCIENCE_LABS) {
    assert.equal(lab.questions.length, 3, `${lab.name} question count`);
    for (const question of lab.questions) {
      assert.ok(question.answer >= 0 && question.answer < question.choices.length);
    }
  }
});

test('correct answers award XP once and complete a lab at two of three', () => {
  const academy = new ScienceAcademy(() => 'slot_1', new MemoryStorage());
  const lab = academy.getLab('physics');

  const first = academy.answerQuestion(lab.id, 0, lab.questions[0].answer);
  const repeated = academy.answerQuestion(lab.id, 0, lab.questions[0].answer);
  academy.answerQuestion(lab.id, 1, lab.questions[1].answer);
  const completed = academy.answerQuestion(lab.id, 2, (lab.questions[2].answer + 1) % lab.questions[2].choices.length);

  assert.equal(first.xpAwarded, 25);
  assert.equal(repeated.xpAwarded, 0);
  assert.equal(repeated.alreadyAnswered, true);
  assert.equal(completed.completed, true);
  assert.equal(academy.getState().xp, 50);
  assert.deepEqual(academy.getState().completedLabs, ['physics']);
});

test('incorrect answers can be retried without awarding XP for the failed attempt', () => {
  const academy = new ScienceAcademy(() => 'slot_1', new MemoryStorage());
  const question = academy.getLab('chemistry').questions[0];

  const incorrect = academy.answerQuestion('chemistry', 0, (question.answer + 1) % question.choices.length);
  const retry = academy.answerQuestion('chemistry', 0, question.answer);
  const repeated = academy.answerQuestion('chemistry', 0, question.answer);

  assert.equal(incorrect.correct, false);
  assert.equal(incorrect.xpAwarded, 0);
  assert.equal(retry.correct, true);
  assert.equal(retry.xpAwarded, 25);
  assert.equal(repeated.xpAwarded, 0);
});

test('learning progress is isolated per save slot and drives mission objectives', () => {
  const storage = new MemoryStorage();
  let slotId = 'slot_1';
  const academy = new ScienceAcademy(() => slotId, storage);
  academy.recordFieldSample();
  academy.recordOrbitVisit();
  academy.recordRocketLaunch();

  assert.deepEqual(academy.getMissionObjectives().slice(0, 4).map((mission) => mission.complete), [false, true, true, true]);
  slotId = 'slot_2';
  assert.deepEqual(academy.getMissionObjectives().slice(0, 4).map((mission) => mission.complete), [false, false, false, false]);
});

test('planet landing and survey visits update saved mission records and XP once', () => {
  const academy = new ScienceAcademy(() => 'slot_1', new MemoryStorage());

  assert.equal(academy.recordPlanetLanding('moon'), true);
  assert.equal(academy.recordPlanetLanding('moon'), false);
  assert.equal(academy.recordPlanetLocation('moon', 'mare-tranquillitatis'), true);
  assert.equal(academy.recordPlanetLocation('moon', 'mare-tranquillitatis'), false);

  const missions = academy.getMissionObjectives();
  assert.equal(missions.find((mission) => mission.id === 'land:moon').complete, true);
  assert.equal(missions.find((mission) => mission.id === 'location:moon:mare-tranquillitatis').complete, true);
  assert.equal(academy.getState().xp, 40);
});

test('gas-giant probe reports complete the matching mission and persist readings', () => {
  const academy = new ScienceAcademy(() => 'slot_1', new MemoryStorage());
  const samples = [{ pressureKPa: 20, temperatureK: 165 }, { pressureKPa: 480, temperatureK: 320 }];

  assert.equal(academy.recordAtmosphericProbe('jupiter', samples), true);
  assert.equal(academy.recordAtmosphericProbe('jupiter', samples), false);
  assert.equal(academy.recordAtmosphericProbe('earth', samples), false);
  assert.equal(academy.getMissionObjectives().find((mission) => mission.id === 'probe:jupiter').complete, true);
  assert.deepEqual(academy.getState().probeReports.jupiter, samples);
  assert.equal(academy.getState().xp, 50);
});

test('life creation simulation unlocks after biology progression and runs deterministically', () => {
  const academy = new ScienceAcademy(() => 'slot_1', new MemoryStorage());
  assert.equal(academy.isLifeCreationUnlocked(), false);

  // Complete the five biology progression labs.
  for (const labId of ['biology', 'cell-biology', 'genetics', 'ecosystems', 'origin-of-life']) {
    const lab = academy.getLab(labId);
    for (let i = 0; i < lab.questions.length; i++) {
      academy.answerQuestion(labId, i, lab.questions[i].answer);
    }
  }
  assert.equal(academy.isLifeCreationUnlocked(), true);
  assert.equal(academy.updateLifeCreationUnlock(), true);

  // Reset to pristine inputs.
  academy.resetLifeSimulation();
  const initial = academy.getLifeCreationState().simulation;
  assert.equal(initial.biomass, 0);
  assert.equal(initial.generation, 0);

  // Run a short deterministic simulation.
  academy.setLifeCreationInput('water', 60);
  academy.setLifeCreationInput('temperature', 30);
  academy.setLifeCreationInput('energy', 50);
  academy.setLifeCreationInput('minerals', 50);
  academy.setLifeCreationInput('organic', 40);
  for (let i = 0; i < 60; i++) academy.stepLifeSimulation(0.1);
  const after = academy.getLifeCreationState().simulation;
  assert.ok(after.biomass > 0, 'biomass should accumulate under optimal conditions');
  assert.ok(after.generation >= 1, 'prebiotic chemistry should advance at least one generation');
  assert.ok(after.status !== 'sterile', 'simulation status should change from sterile');
});