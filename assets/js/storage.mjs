import {validChoices} from './data/paths.mjs';

const key = 'promptsarabic-studio';
const ids = value => Array.isArray(value) ? [...new Set(value.filter(item=>typeof item==='string'))] : [];
let session;
let available = true;

function read() {
  let value = {};
  let legacy = [];
  try {
    value = JSON.parse(localStorage.getItem(key) || '{}') || {};
    if (!value.version) legacy = JSON.parse(localStorage.getItem('promptsarabic-progress') || '[]');
  } catch { /* A malformed or blocked store can start with an empty session. */ }
  const checks = value.checks && typeof value.checks === 'object' ? value.checks : {};
  const previous = Array.isArray(legacy) ? legacy.slice(0,6).flatMap((done,i)=>done===true ? [i] : []) : [];
  const oldChecks = Array.isArray(value.legacy) ? value.legacy.filter(i=>Number.isInteger(i) && i>=0 && i<6) : previous;
  return {
    version:1,
    favorites:ids(value.favorites),
    choices:validChoices(value.choices),
    checks:Object.fromEntries(Array.from({length:8},(_, i)=>[i+1, ids(checks[i+1])])),
    legacy:oldChecks,
    motionPaused:value.motionPaused === true
  };
}
export function state() {
  session ||= read();
  return session;
}
export function save(update) {
  Object.assign(state(), update);
  try { localStorage.setItem(key, JSON.stringify(session)); }
  catch { available = false; }
  return available;
}
export function progress(lessons) {
  const model=state();
  const complete=lessons.filter(lesson=>lesson.checks.every((_,i)=>model.checks[lesson.id].includes(lesson.id+':'+i))).map(lesson=>lesson.id);
  return {complete, percent:Math.round(100*complete.length/lessons.length)};
}
