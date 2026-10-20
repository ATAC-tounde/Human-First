/**
 * HUMAN FIRST - Lifelong Learning Kernel v0.8.
 * Pure, deterministic, browser-side engine; no account, telemetry, AI or HTTP required.
 * Packs are declarative, versioned and validated before use.
 * Self-reported familiarity is never a certified skill assessment.
 */
export const KERNEL_VERSION = '0.8.0';
export const PILLARS = Object.freeze(['think', 'focus', 'learn', 'decide']);
export const FAMILIARITY = Object.freeze(['new', 'exploring', 'practicing', 'confident']);
const ID = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/;
const VERSION = /^\d+\.\d+\.\d+$/;
const stages = ['personal', 'school-return', 'higher-education', 'work', 'transition', 'teaching'];
const ageBands = ['unspecified', '18-24', '25-39', '40-59', '60+'];
const isPlain = value => value !== null && typeof value === 'object' &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const assert = (test, message) => { if (!test) throw new TypeError(message); };
const unique = items => [...new Set(items)];
const texts = (value, label) => {
  assert(isPlain(value), `${label}: missing bilingual strings`);
  for (const lang of ['fr', 'en']) assert(typeof value[lang] === 'string' && value[lang].trim().length >= 8, `${label}: ${lang} incomplete`);
};
const id = (value, label) => assert(typeof value === 'string' && ID.test(value) && value.length <= 96, `${label}: invalid namespaced identifier`);
const strings = (value, label) => assert(Array.isArray(value) && value.every(s => typeof s === 'string' && s.length <= 80), `${label}: invalid string array`);

/** Reject duplicate/missing references, cycles, inaccessible content, and malformed packs. */
export function createRegistry(packs) {
  assert(Array.isArray(packs) && packs.length > 0, 'A registry requires at least one content pack');
  const byId = new Map();
  const pathways = new Map();
  const seenPacks = new Set();
  const manifests = [];
  for (const pack of packs) {
    assert(isPlain(pack), 'Content pack must be a plain object');
    assert(typeof pack.id === 'string' && /^[a-z][a-z0-9-]{1,39}$/.test(pack.id), 'Invalid pack ID');
    assert(!seenPacks.has(pack.id), `Duplicate pack ${pack.id}`);
    seenPacks.add(pack.id);
    assert(VERSION.test(pack.version), `Pack ${pack.id}: invalid semantic version`);
    texts(pack.title, `Pack ${pack.id} title`);
    assert(Array.isArray(pack.competencies) && pack.competencies.length, `Pack ${pack.id} has no competencies`);
    assert(Array.isArray(pack.pathways), `Pack ${pack.id} needs a pathways array`);
    manifests.push(Object.freeze({id:pack.id, version:pack.version, title:{...pack.title}}));
    for (const skill of pack.competencies) {
      assert(isPlain(skill), 'Competency must be a plain object');
      id(skill.id, 'Competency');
      assert(skill.id.startsWith(pack.id + '.'), `Competency ${skill.id} not in ${pack.id}`);
      assert(!byId.has(skill.id), `Duplicate competency ${skill.id}`);
      texts(skill.title, `${skill.id} title`);
      texts(skill.outcome, `${skill.id} outcome`);
      strings(skill.tags, `${skill.id} tags`);
      assert(Array.isArray(skill.requires), `${skill.id} requires array`);
      for (const prerequisite of skill.requires) id(prerequisite, `${skill.id} prerequisite`);
      assert(isPlain(skill.activities), `${skill.id} activities`);
      for (const pillar of PILLARS) texts(skill.activities[pillar], `${skill.id} ${pillar}`);
      const contexts = skill.contexts ?? {};
      assert(isPlain(contexts), `${skill.id}: invalid contexts`);
      for (const [stage, value] of Object.entries(contexts)) {
        assert(stages.includes(stage), `${skill.id}: unsupported context ${stage}`);
        texts(value, `${skill.id} context ${stage}`);
      }
      byId.set(skill.id, Object.freeze({
        id:skill.id,packId:pack.id,title:{...skill.title},outcome:{...skill.outcome},
        tags:[...skill.tags],requires:[...skill.requires],
        activities:Object.fromEntries(PILLARS.map(p=>[p,{...skill.activities[p]}])),
        contexts:Object.fromEntries(Object.entries(contexts).map(([k,v])=>[k,{...v}]))
      }));
    }
    for (const path of pack.pathways) {
      assert(isPlain(path), 'Pathway must be plain object');
      id(path.id, 'Pathway');
      assert(path.id.startsWith(pack.id+'.'), `${path.id} not in pack ${pack.id}`);
      assert(!pathways.has(path.id), `Duplicate pathway ${path.id}`);
      texts(path.title, `${path.id} title`);texts(path.summary, `${path.id} summary`);
      assert(Array.isArray(path.competencyIds) && path.competencyIds.length, `${path.id} missing goals`);
      path.competencyIds.forEach(x=>id(x, `${path.id} goal`));
      strings(path.audiences ?? [], `${path.id} audiences`);
      pathways.set(path.id, Object.freeze({id:path.id,packId:pack.id,
        title:{...path.title},summary:{...path.summary},competencyIds:[...path.competencyIds],audiences:[...(path.audiences??[])]}));
    }
  }
  for (const skill of byId.values()) {
    assert(!skill.requires.includes(skill.id), `${skill.id}: self-dependency`);
    for (const x of skill.requires) assert(byId.has(x), `${skill.id}: missing prerequisite ${x}`);
  }
  for (const path of pathways.values()) for (const x of path.competencyIds)
    assert(byId.has(x), `${path.id}: missing competency ${x}`);
  const state = new Map();
  function visit(skillId) {
    if (state.get(skillId) === 1) throw new TypeError(`Dependency cycle at ${skillId}`);
    if (state.get(skillId) === 2) return;
    state.set(skillId, 1);
    for (const x of byId.get(skillId).requires) visit(x);
    state.set(skillId, 2);
  }
  for (const name of byId.keys()) visit(name);
  return Object.freeze({
    kernelVersion:KERNEL_VERSION,manifests:Object.freeze(manifests),
    skills:byId,paths:pathways,
    version:manifests.map(x=>`${x.id}@${x.version}`).join('|')
  });
}

export function normalizeProfile(input, registry) {
  assert(isPlain(input), 'A profile must be an object');
  assert(input.adult === true, 'The v0.8 demonstration is reserved for adults (18+)');
  const locale = input.locale === 'en' ? 'en' : 'fr';
  const stage = stages.includes(input.stage) ? input.stage : 'personal';
  const ageBand = ageBands.includes(input.ageBand) ? input.ageBand : 'unspecified';
  const pathId = typeof input.pathId === 'string' && registry.paths.has(input.pathId) ? input.pathId : null;
  assert(pathId, 'Choose an available pathway');
  const qualification = typeof input.qualification === 'string' ? input.qualification.trim().slice(0,70) : '';
  const occupation = typeof input.occupation === 'string' ? input.occupation.trim().slice(0,70) : '';
  const paceInput = Number(input.minutesPerWeek);
  const minutesPerWeek = [30, 60, 120, 180].includes(paceInput) ? paceInput : 60;
  const familiarity = Object.create(null);
  if (isPlain(input.familiarity)) {
    for (const [skillId, level] of Object.entries(input.familiarity))
      if (registry.skills.has(skillId) && FAMILIARITY.includes(level)) familiarity[skillId] = level;
  }
  return {schema:'hf.profile.v1',adult:true,locale,stage,ageBand,pathId,qualification,occupation,minutesPerWeek,familiarity};
}

const local = (value, locale) => value?.[locale] ?? value?.fr ?? '';
function collectPrerequisites(registry, targets) {
  const seen = new Set(), ordered=[];
  function visit(key) {
    if(seen.has(key))return;
    seen.add(key);
    for(const dependency of registry.skills.get(key).requires)visit(dependency);
    ordered.push(key);
  }
  targets.forEach(visit);
  return ordered;
}

/** Deterministic, explainable and non-evaluative: no automatic ability ranking. */
export function buildJourney(registry, rawProfile) {
  const profile=normalizeProfile(rawProfile,registry);
  const pathway=registry.paths.get(profile.pathId);
  const goals=new Set(pathway.competencyIds);
  const ordered=collectPrerequisites(registry,pathway.competencyIds);
  const items=ordered.map((key,index)=>{
    const s=registry.skills.get(key);
    const isGoal=goals.has(key);
    const known=profile.familiarity[key]??'new';
    const activity=Object.fromEntries(PILLARS.map(p=>[p,local(s.activities[p],profile.locale)]));
    const context=local(s.contexts[profile.stage],profile.locale);
    return {
      skillId:key,order:index+1,packId:s.packId,
      title:local(s.title,profile.locale),outcome:local(s.outcome,profile.locale),
      tags:[...s.tags],requires:[...s.requires],pillars:activity,
      reason:isGoal?'pathway-goal':'prerequisite',
      explanation:profile.locale==='en'?(isGoal?'Selected in your chosen pathway.':'Provides a foundation for a later objective.'):(isGoal?'Compétence prévue dans ton parcours choisi.':'Prépare une compétence que tu souhaites développer.'),
      context:context||null,
      selfReportedFamiliarity:known,
      suggestedFocus:known==='confident'?'transfer-and-verify':known==='new'?'discover-and-practice':'practice-and-transfer',
      minutesIndicative:20
    };
  });
  return {
    schema:'hf.journey.v1',engineVersion:KERNEL_VERSION,catalogVersion:registry.version,
    generatedFor:{...profile,familiarity:{...profile.familiarity}},
    pathway:{id:pathway.id,title:local(pathway.title,profile.locale),summary:local(pathway.summary,profile.locale)},
    disclaimer:profile.locale==='en'?'Suggestions are not an assessment or certificate. Change the plan whenever you want.':'Suggestions non certificatives. Ce parcours ne mesure pas tes capacités et peut être modifié librement.',
    plan:items,
    workload:{totalMinutesIndicative:items.length*20,minutesPerWeek:profile.minutesPerWeek},
    principles:{selfDirected:true,graded:false,mandatorySchedule:false,aiDecidesForYou:false}
  };
}

/** Portable data: only user-selected context + self-report, never free response text. */
export function exportPortableProfile(registry, rawProfile) {
  const profile=normalizeProfile(rawProfile,registry);
  return JSON.stringify({schema:'hf.portfolio.v1',savedAt:new Date().toISOString(),catalogVersion:registry.version,profile},null,2);
}
export function importPortableProfile(json, registry) {
  assert(typeof json==='string'&&json.length<=80_000, 'The imported file must be JSON under 80 kB');
  let parsed;
  try{parsed=JSON.parse(json);}catch{throw new TypeError('Invalid JSON');}
  assert(isPlain(parsed)&&parsed.schema==='hf.portfolio.v1', 'Unsupported portfolio format');
  assert(isPlain(parsed.profile), 'Missing profile');
  // Unknown attributes are dropped; competencies removed from the catalog do not reappear.
  return normalizeProfile(parsed.profile,registry);
}

export function registryPublicStats(registry) {
  return {packs:registry.manifests.length,competencies:registry.skills.size,pathways:registry.paths.size,version:registry.version};
}

export const PROGRESS_EVENTS = Object.freeze(['explored','practiced','review-later']);
export function normalizeEvidence(registry, events) {
  assert(Array.isArray(events), 'Evidence must be an array');
  assert(events.length <= 2000, 'Too many portable events for this demo file');
  return events.map((item, index) => {
    assert(isPlain(item), `Evidence ${index}: invalid event`);
    assert(registry.skills.has(item.skillId), `Evidence ${index}: unknown competency`);
    assert(PROGRESS_EVENTS.includes(item.type), `Evidence ${index}: unknown status`);
    assert(typeof item.at === 'string' && /^\d{4}-\d\d-\d\dT/.test(item.at) &&
      Number.isFinite(Date.parse(item.at)), `Evidence ${index}: invalid date`);
    return {skillId:item.skillId,type:item.type,at:new Date(item.at).toISOString(),source:'self-declared'};
  });
}
export function exportPortfolio(registry, rawProfile, events=[]) {
  const profile=normalizeProfile(rawProfile, registry);
  return JSON.stringify({schema:'hf.portfolio.v1',savedAt:new Date().toISOString(),catalogVersion:registry.version,
    profile,evidence:normalizeEvidence(registry,events)}, null, 2);
}
export function importPortfolio(content, registry) {
  assert(typeof content==='string' && content.length <= 80_000, 'Portfolio must be JSON under 80 kB');
  let data;
  try { data=JSON.parse(content); } catch { throw new TypeError('Invalid JSON'); }
  assert(isPlain(data) && data.schema==='hf.portfolio.v1', 'Unsupported portfolio schema');
  const profile=normalizeProfile(data.profile,registry);
  // Do not blindly accept unknown legacy fields, users or signed certificates.
  const evidence=normalizeEvidence(registry, data.evidence??[]);
  return {profile,evidence,originVersion:data.catalogVersion??null,migrated:data.catalogVersion!==registry.version};
}