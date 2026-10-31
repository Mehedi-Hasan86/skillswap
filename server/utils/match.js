// Rule-based matching algorithm (per proposal, §6.2)
// 40 pts: A can teach something B wants to learn
// 40 pts: B can teach something A wants to learn
// 10 pts: compatible skill levels
// 10 pts: compatible availability + learning mode
// Total: /100

const LEVEL_VALUE = { Beginner: 1, Intermediate: 2, Advanced: 3 };

function norm(s) {
  return String(s || '').trim().toLowerCase();
}

function skillNames(list) {
  return (list || []).map((s) => norm(s.skillName || s.name));
}

function findOverlap(teachList, learnList) {
  const learnSet = new Set(skillNames(learnList));
  return (teachList || []).filter((t) => learnSet.has(norm(t.skillName || t.name)));
}

function levelsCompatible(teachEntry, learnEntry) {
  if (!teachEntry || !learnEntry) return false;
  const t = LEVEL_VALUE[teachEntry.level] || 1;
  const l = LEVEL_VALUE[learnEntry.level] || 1;
  // teacher at same level or higher, or at most one step below -> compatible
  return t >= l || Math.abs(t - l) <= 1;
}

function availabilityCompatible(a, b) {
  const aa = norm(a.availability);
  const bb = norm(b.availability);
  if (!aa || !bb) return true;
  if (aa === 'flexible' || bb === 'flexible') return true;
  return aa === bb;
}

function modeCompatible(a, b) {
  const am = norm(a.mode);
  const bm = norm(b.mode);
  if (!am || !bm) return true;
  if (am === 'both' || bm === 'both') return true;
  return am === bm;
}

function computeMatch(a, b) {
  const aTeachesForB = findOverlap(a.teachSkills, b.learnSkills);
  const bTeachesForA = findOverlap(b.teachSkills, a.learnSkills);

  let score = 0;
  const breakdown = { aTeachesB: 0, bTeachesA: 0, level: 0, availabilityMode: 0 };

  if (aTeachesForB.length > 0) {
    score += 40;
    breakdown.aTeachesB = 40;
  }
  if (bTeachesForA.length > 0) {
    score += 40;
    breakdown.bTeachesA = 40;
  }

  // Level compatibility: check the overlapping pairs
  let levelOk = false;
  for (const t of aTeachesForB) {
    const l = (b.learnSkills || []).find((x) => norm(x.skillName) === norm(t.skillName));
    if (levelsCompatible(t, l)) { levelOk = true; break; }
  }
  if (!levelOk) {
    for (const t of bTeachesForA) {
      const l = (a.learnSkills || []).find((x) => norm(x.skillName) === norm(t.skillName));
      if (levelsCompatible(t, l)) { levelOk = true; break; }
    }
  }
  if (levelOk && (aTeachesForB.length > 0 || bTeachesForA.length > 0)) {
    score += 10;
    breakdown.level = 10;
  }

  const availOk = availabilityCompatible(a, b);
  const modeOk = modeCompatible(a, b);
  if (availOk && modeOk) {
    score += 10;
    breakdown.availabilityMode = 10;
  } else if (availOk || modeOk) {
    score += 5;
    breakdown.availabilityMode = 5;
  }

  return {
    score: Math.min(100, score),
    breakdown,
    aTeachesForB: aTeachesForB.map((s) => s.skillName),
    bTeachesForA: bTeachesForA.map((s) => s.skillName),
    perfect: aTeachesForB.length > 0 && bTeachesForA.length > 0,
  };
}

module.exports = { computeMatch, LEVEL_VALUE };
