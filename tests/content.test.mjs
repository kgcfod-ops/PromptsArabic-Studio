import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recommend, questions} from '../assets/js/data/paths.mjs';
import {tools} from '../assets/js/data/tools.mjs';
import {lessons} from '../assets/js/data/lessons.mjs';
import {projects} from '../assets/js/data/projects.mjs';
import {prompts, promptText, promptCategories} from '../assets/js/data/prompts.mjs';

const cases = [
 ['educational','beginner','phone','free',1,'water',['capcut','canva']],
 ['educational','experienced','desktop','limited',3,'water',['clipchamp','canva','flow']],
 ['educational','beginner','desktop','free',1,'water',['shotcut','canva']],
 ['advertising','experienced','desktop','paid',3,'cards',['clipchamp','elevenlabs','runway']],
 ['advertising','beginner','phone','free',1,'cards',['capcut']],
 ['short','experienced','phone','limited',3,'short',['capcut','pika']],
 ['short','beginner','desktop','paid',1,'short',['clipchamp','elevenlabs','pika']],
 ['avatar','beginner','phone','limited',1,'avatar',['capcut','ttsmaker','heygen']],
 ['avatar','experienced','desktop','free',3,'avatar',['shotcut','ttsmaker']],
 ['avatar','experienced','phone','paid',3,'avatar',['capcut','elevenlabs','heygen']]
];
for(const [type,level,device,budget,lesson,project,toolIds] of cases) test([type,level,device,budget].join(' / '),()=>{
  const result=recommend({type,level,device,budget});
  assert.equal(result.lesson,lesson);
  assert.equal(result.project,project);
  assert.deepEqual(result.toolIds,toolIds);
  assert.ok(result.reason && result.limit && result.fallback);
});
test('all 48 combinations point at tools supported on the chosen device',()=>{
  const [types,levels,devices,budgets]=questions.map(q=>q.options.map(o=>o.id));
  for(const type of types) for(const level of levels) for(const device of devices) for(const budget of budgets) {
    const result=recommend({type,level,device,budget});
    assert.ok(result.toolIds.every(id=>tools.find(tool=>tool.id===id).devices.includes(device)));
    assert.ok(result.toolIds.some(id=>tools.find(tool=>tool.id===id).category==='edit'));
    if(budget==='free') assert.ok(result.toolIds.every(id=>!['video','avatar'].includes(tools.find(tool=>tool.id===id).category)));
  }
});
test('incomplete and malformed answers have no recommendation',()=>{
  assert.equal(recommend({type:'educational',level:'beginner',device:'tablet',budget:'free'}),null);
  assert.equal(recommend(null),null);
});
test('24 distinct prompts cover each requested category and safely retain unfilled markers',()=>{
  assert.equal(new Set(prompts.map(p=>p.task)).size,24);
  for(const category of Object.keys(promptCategories)) assert.equal(prompts.filter(p=>p.category===category).length,3);
  const first=prompts[0];
  assert.match(promptText(first),/\[المفهوم\]/);
  const value=promptText(first,{المفهوم:'دورة الماء [خاص]',الصف:'  الرابع  '});
  assert.match(value,/دورة الماء \[خاص\]/);
  assert.match(value,/الرابع/);
  assert.doesNotMatch(value,/\[الصف\]/);
});
test('eight lessons and all project content reference valid official tools and prompts',()=>{
  assert.equal(lessons.length,8);
  assert.ok(projects.length>=3);
  for(const record of [...lessons,...projects]){
    assert.ok(record.tools.every(id=>tools.some(t=>t.id===id)));
    assert.ok(record.prompts.every(id=>prompts.some(p=>p.id===id)));
    assert.ok(record.checks.length>=3);
  }
  lessons.forEach((lesson,i)=>{
    assert.equal(lesson.id,i+1);
    assert.equal(lesson.quiz.length,2);
    assert.ok(lesson.steps.length>=4);
  });
  for(const project of projects){
    let previous=0;
    for(const [time,shot,voice] of project.shots){
      const [start,end]=time.split('–').map(Number);
      assert.equal(start,previous);
      assert.ok(end>start && shot && voice);
      previous=end;
    }
    assert.equal(previous,parseInt(project.duration,10));
  }
  for(const tool of tools) for(const url of [tool.url,...tool.sources.map(([,src])=>src)]) assert.equal(new URL(url).protocol,'https:');
});
