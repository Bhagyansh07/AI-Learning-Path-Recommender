// Node built-in test runner for the client-side skill graph DAG.
// Run: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SKILL_GRAPH, SKILL_DEMAND, getSkillById, getDownstreamSkills, getCareerRelevance } from '../lib/skillGraph.js';

const SKILLS = SKILL_GRAPH.skills;

test('skill graph contains at least 50 skills', () => {
  assert.ok(SKILLS.length >= 50, `expected >= 50 skills, got ${SKILLS.length}`);
});

test('every skill has a unique id with name and domain', () => {
  const ids = new Set();
  for (const s of SKILLS) {
    assert.ok(s.id, 'skill missing id');
    assert.ok(!ids.has(s.id), `duplicate id: ${s.id}`);
    ids.add(s.id);
    assert.ok(s.name, `skill ${s.id} missing name`);
    assert.ok(s.domain, `skill ${s.id} missing domain`);
    assert.ok(Number.isInteger(s.difficulty), `skill ${s.id} difficulty not int`);
  }
});

test('every prerequisite id resolves to a real skill (no dangling edges)', () => {
  const ids = new Set(SKILLS.map((s) => s.id));
  for (const s of SKILLS) {
    for (const pre of s.prerequisites || []) {
      assert.ok(ids.has(pre), `skill ${s.id} has unknown prerequisite ${pre}`);
    }
  }
});

test('the skill graph is acyclic (valid topological ordering exists)', () => {
  const indegree = new Map(SKILLS.map((s) => [s.id, 0]));
  const adj = new Map(SKILLS.map((s) => [s.id, []]));
  for (const s of SKILLS) {
    for (const pre of s.prerequisites || []) {
      adj.get(pre).push(s.id);
      indegree.set(s.id, indegree.get(s.id) + 1);
    }
  }
  const queue = [...SKILLS.filter((s) => indegree.get(s.id) === 0).map((s) => s.id)];
  let count = 0;
  while (queue.length) {
    const cur = queue.shift();
    count += 1;
    for (const next of adj.get(cur)) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }
  assert.equal(count, SKILLS.length, 'cycle detected in skill graph');
});

test('getSkillById returns the matching skill', () => {
  const skill = getSkillById('python-basics');
  assert.ok(skill);
  assert.equal(skill.name, 'Python Basics');
  assert.equal(getSkillById('does-not-exist'), undefined);
});

test('getDownstreamSkills returns courses that depend on a skill', () => {
  const downstream = getDownstreamSkills('python-basics');
  assert.ok(downstream.length >= 1);
  assert.ok(downstream.every((d) => d.id !== 'python-basics'));
});

test('getCareerRelevance reports careers that target a skill', () => {
  const careers = getCareerRelevance('numpy-pandas');
  assert.ok(careers.length >= 1);
});

test('demand scores exist for the most important skills', () => {
  for (const id of ['python-basics', 'machine-learning', 'react-basics', 'sql-databases']) {
    assert.ok(SKILL_DEMAND[id] !== undefined, `missing demand for ${id}`);
  }
});

test('every career path references real target skills', () => {
  const ids = new Set(SKILLS.map((s) => s.id));
  for (const [id, path] of Object.entries(SKILL_GRAPH.career_paths)) {
    assert.ok(path.display_name, `career ${id} missing display_name`);
    for (const ts of path.target_skills) {
      assert.ok(ids.has(ts), `career ${id} targets unknown skill ${ts}`);
    }
  }
});
