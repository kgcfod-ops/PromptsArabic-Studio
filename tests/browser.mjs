import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {nav} from '../assets/js/ui.mjs';
import {serve} from './server.mjs';

const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const saved=resolve(process.env.STUDIO_TEST_OUTPUT || root+'/test-results');
await mkdir(saved,{recursive:true});
const local=process.env.STUDIO_LIVE ? null : await serve(root);
const base=process.env.STUDIO_LIVE || local.url;
let launch={args:['--no-sandbox']};
if (process.env.STUDIO_CHROMIUM_PACKAGE) {
  const {default:bin}=await import(process.env.STUDIO_CHROMIUM_PACKAGE);
  launch={executablePath:await bin.executablePath(),args:bin.args};
}
const browser=await chromium.launch(launch);
const context=await browser.newContext({viewport:{width:1440,height:900}});
await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:new URL(base).origin});
const page=await context.newPage();
const errors=[];
const results=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
page.on('response',r=>{if(r.status()>=400 && r.url().startsWith(base))errors.push(r.status()+' '+r.url());});
if(process.env.STUDIO_PROXY) await page.route(base+'**',async route=>{
  const data=await fetch(route.request().url());
  await route.fulfill({status:data.status,headers:{'content-type':data.headers.get('content-type')??'application/octet-stream'},body:Buffer.from(await data.arrayBuffer())});
});
const goto = async name => {
  const response=await page.goto(base+name,{waitUntil:'load'});
  assert.equal(response.status(),200,name);
  await page.locator('html.enhanced').waitFor();
};
const capture = name => page.screenshot({path:saved+'/'+name+'.png',animations:'allow'});
const tap = name => page.getByRole('button',{name,exact:true}).click();
const pick = text => page.getByRole('radio',{name:text,exact:false}).check();
const text = locator => page.locator(locator).innerText();
const run = async (name, task) => {
  try {const detail=await task();results.push({name,pass:true,detail});console.log('PASS',name,detail??'');}
  catch(error){results.push({name,pass:false,detail:error.message});console.error('FAIL',name,error.message);}
};
async function choose(type,level,device,budget) {
  for(const [i,choice] of [type,level,device,budget].entries()){
    await pick(choice);
    await tap(i===3?'عرض التوصية':'التالي');
  }
}

try {
  await run('Automatic motion: five stages in first ten seconds, CSS transform and Scroll Reveal',async()=>{
    await goto('');
    await capture('home-desktop');
    const floats=[];
    const observed=[];
    const start=Date.now();
    while(Date.now()-start<9800) {
      observed.push(await page.locator('#showcase').getAttribute('data-active'));
      floats.push(await page.locator('.float-clap').evaluate(el=>getComputedStyle(el).transform));
      await page.waitForTimeout(300);
    }
    assert.deepEqual([...new Set(observed)].sort(),['0','1','2','3','4']);
    assert.ok(new Set(floats).size>5);
    await tap('السيناريو');
    assert.equal(await page.locator('#showcase').getAttribute('data-active'),'1');
    await tap('إيقاف العرض');
    await page.waitForTimeout(1850);
    assert.equal(await page.locator('#showcase').getAttribute('data-active'),'1');
    await page.locator('.closing').scrollIntoViewIfNeeded();
    await page.locator('.closing.revealed').waitFor();
    return [...new Set(observed)].join(' → ')+'؛ '+new Set(floats).size+' distinct floating transforms';
  });

  await run('Phone free route and back/edit to desktop and limited credits',async()=>{
    await page.setViewportSize({width:390,height:844});
    await goto('');
    await capture('home-mobile');
    await page.getByRole('link',{name:'ابدأ التعلم'}).click();
    await choose('فيديو تعليمي','مبتدئ','هاتف','مجاني صور');
    assert.match(await text('#path-result'),/CapCut/);
    assert.doesNotMatch(await text('#path-result'),/Google Flow/);
    await capture('path-mobile');
    await tap('السابق');
    await tap('السابق');
    await pick('كمبيوتر');
    await tap('التالي');
    await pick('مجاني محدود');
    await tap('عرض التوصية');
    assert.match(await text('#path-result'),/Google Flow/);
    assert.match(await text('#path-result'),/Clipchamp/);
    assert.match(await text('#path-result'),/أكمل دون توليد/);
    await page.getByRole('link',{name:'افتح الدرس المقترح'}).click();
    assert.match(page.url(),/lesson\.html\?id=1$/);
    await page.reload();
    assert.match(await text('[data-lesson="1"] h2'),/من أين تبدأ/);
  });

  await run('Clipboard, persisted lesson checklist and live progress',async()=>{
    await page.setViewportSize({width:1440,height:900});
    await goto('lesson.html');
    await capture('lesson-desktop');
    await page.locator('[data-lesson="1"] [data-copy]').click();
    await page.getByRole('button',{name:'تم النسخ',exact:true}).waitFor();
    assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/\[المدة\]/);
    const check=page.locator('[data-check="1:0"]');
    const bar=page.locator('#lesson-progress-1');
    await check.scrollIntoViewIfNeeded();
    await check.check();
    assert.equal(await bar.getAttribute('aria-valuenow'),'33');
    assert.match(await text('#lesson-ring'),/33/);
    const transition=await bar.locator('i').evaluate(el=>getComputedStyle(el).transitionProperty);
    assert.equal(transition,'transform');
    await page.reload();
    assert.equal(await check.isChecked(),true);
    for(const id of ['1:1','1:2']) await page.locator('[data-check="'+id+'"]').check();
    await goto('roadmap.html');
    assert.match(await text('#roadmap-count'),/1 من 8/);
    assert.equal(await page.locator('#roadmap-progress').getAttribute('aria-valuenow'),'13');
    await goto('lesson.html?id=8');
    assert.match(await text('[data-lesson="8"] h2'),/راجع وصدّر وانشر/);
  });

  await run('Tools search, three filters, official source and dialog keyboard',async()=>{
    await goto('tools.html');
    await capture('tools-desktop');
    await page.getByRole('searchbox').fill('ttsMAKER');
    await tap('تعليق صوتي');
    await page.getByLabel('الجهاز').selectOption('phone');
    await page.getByLabel('نوع الوصول').selectOption('limited');
    assert.equal(await page.locator('.tool-card:visible').count(),1);
    await page.locator('.tool-card:visible [data-tool]').click();
    const dialog=page.getByRole('dialog');
    assert.equal(await dialog.getByRole('link',{name:'افتح الأداة الرسمية'}).getAttribute('href'),'https://ttsmaker.com/');
    await page.keyboard.press('Escape');
    await dialog.waitFor({state:'hidden'});
    assert.equal(await page.locator(':focus').getAttribute('data-tool'),'ttsmaker');
    await page.getByLabel('نوع الوصول').selectOption('free');
    await page.locator('.empty').waitFor();
    await goto('tools.html?tool=flow');
    await page.getByRole('dialog').getByText('الأجهزة والأهلية').waitFor();
    await page.keyboard.press('Escape');
  });

  await run('RTL prompt customization, actual clipboard, saved favorite and empty state',async()=>{
    await goto('prompts.html');
    await tap('تعليم');
    await page.getByRole('searchbox').fill('اشرح مفهومًا');
    const card=page.locator('.prompt-card:visible');
    assert.equal(await card.count(),1);
    await card.getByRole('button',{name:'تخصيص'}).click();
    await page.getByLabel('المفهوم',{exact:true}).fill('دورة الماء');
    const preview=await page.locator('#dialog-prompt').inputValue();
    assert.match(preview,/دورة الماء/);
    assert.match(preview,/\[الصف\]/);
    await page.getByRole('dialog').getByRole('button',{name:'نسخ البرومبت'}).click();
    await page.getByRole('dialog').getByRole('button',{name:'تم النسخ'}).waitFor();
    assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),preview);
    await page.keyboard.press('Escape');
    await card.locator('button[data-favorite]').click();
    await page.reload();
    await tap('المفضلة');
    assert.equal(await page.locator('.prompt-card:visible').count(),1);
    assert.equal(await page.locator('.prompt-card:visible button[data-favorite]').getAttribute('aria-pressed'),'true');
    await page.locator('.prompt-card:visible button[data-favorite]').click();
    await page.locator('.empty').waitFor();
  });

  await run('Four complete project guides and category filters',async()=>{
    await goto('projects.html');
    await tap('فيديو إعلاني');
    assert.equal(await page.locator('.project-card:visible').count(),1);
    await page.locator('.project-card:visible .text-btn').click();
    await page.locator('#project-cards').waitFor();
    assert.match(await text('#project-cards'),/لوحة المشاهد ونص الراوي/);
    const counts=[];
    for(const id of ['water','cards','short','avatar']){
      await goto('projects.html?project='+id+'#project-'+id);
      assert.equal(await page.locator('[data-project]:visible').count(),1);
      assert.match(await text('#project-'+id),/المونتاج والتصدير/);
      counts.push(await page.locator('#project-'+id+' .shot-grid article').count());
      assert.equal(await page.locator('main video').count(),0);
    }
    return 'Storyboard shots: '+counts.join(', ');
  });

  await run('Keyboard and reduced motion, including stored control',async()=>{
    await page.setViewportSize({width:360,height:780});
    await page.emulateMedia({reducedMotion:'reduce'});
    await goto('');
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').getAttribute('href'),'#main');
    await page.locator('.menu-toggle').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
    assert.equal(await page.locator(':focus').getAttribute('aria-controls'),'main-menu');
    await page.waitForTimeout(1900);
    assert.equal(await page.locator('#showcase').getAttribute('data-active'),'0');
    assert.equal(await page.locator('.float-clap').evaluate(el=>getComputedStyle(el).animationName),'none');
    await tap('الصوت');
    assert.equal(await page.locator('#showcase').getAttribute('data-active'),'3');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await tap('تقليل الحركة');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-motion'),'reduce');
    await tap('تقليل الحركة');
  });

  await run('63 responsive layouts, RTL, and nine direct URLs after reload',async()=>{
    for(const width of [360,390,430,768,1024,1280,1440]) {
      await page.setViewportSize({width,height:900});
      for(const [id] of nav){
        await goto(id+'.html');
        const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,dir:document.documentElement.dir,h1:document.querySelectorAll('h1').length}));
        assert.ok(layout.overflow<=1,id+' '+width+'px overflow '+layout.overflow);
        assert.equal(layout.dir,'rtl');
        assert.equal(layout.h1,1);
        if(width===390){const again=await page.reload({waitUntil:'load'});assert.equal(again.status(),200,id);}
      }
    }
  });

  await run('Axe WCAG automated scans on all nine pages',async()=>{
    const axe=await readFile(new URL('../node_modules/axe-core/axe.min.js',import.meta.url),'utf8');
    await page.emulateMedia({reducedMotion:'reduce'});
    const violations=[];
    for(const [id] of nav){
      await goto(id+'.html');
      await page.addScriptTag({content:axe});
      const result=await page.evaluate(()=>axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
      violations.push(...result.violations.map(item=>id+': '+item.id+' '+item.nodes.map(node=>node.target.join(' ')).slice(0,3).join(', ')));
    }
    assert.deepEqual(violations,[]);
  });
  await run('Console and asset network errors',async()=>assert.deepEqual(errors,[]));
} finally {
  await writeFile(saved+'/browser-results.json',JSON.stringify({base:process.env.STUDIO_LIVE || '/PromptsArabic-Studio/',results},null,2));
  await browser.close();
  local?.server.close();
}
if(results.some(result=>!result.pass)) process.exitCode=1;
