import {icon, safe, btn, empty, normalize} from './ui.mjs';
import {toolDetail} from './pages.mjs';
import {state, save, progress} from './storage.mjs';
import {types, questions, recommend} from './data/paths.mjs';
import {lessons} from './data/lessons.mjs';
import {tools} from './data/tools.mjs';
import {projects} from './data/projects.mjs';
import {prompts, promptText} from './data/prompts.mjs';

const $ = (selector,root=document) => root.querySelector(selector);
const all = (selector,root=document) => [...root.querySelectorAll(selector)];
const params = new URLSearchParams(location.search);
const page = document.body.dataset.page;
const dialog = $('#detail-dialog');
const pref = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => pref.matches || state().motionPaused;
document.documentElement.classList.add('enhanced');

let toastTimer;
function toast(message) {
  const node=$('#toast');
  node.textContent=message;
  node.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{
    node.classList.remove('visible');
    node.textContent='';
  },1950);
}
function persist(update) {
  if (!save(update)) toast('تعذر الحفظ في المتصفح. يبقى التغيير متاحًا حتى تغادر الصفحة.');
}

function navigation() {
  const menu=$('#main-menu');
  const button=$('.menu-toggle');
  const mobile=matchMedia('(max-width: 930px)');
  let open=false;
  function apply(value) {
    open=value;
    menu.classList.toggle('is-open',open);
    menu.inert=mobile.matches && !open;
    button.hidden=!mobile.matches;
    button.setAttribute('aria-expanded',String(open));
    button.innerHTML=icon(open?'close':'menu',24);
  }
  button.addEventListener('click',()=>apply(!open));
  mobile.addEventListener('change',()=>apply(false));
  document.addEventListener('keydown',event=>{
    if (event.key==='Escape' && open && !dialog.open) {
      apply(false);
      button.focus();
    }
  });
  document.addEventListener('click',event=>{
    if (open && !event.target.closest('.top-inner')) apply(false);
  });
  apply(false);
  requestAnimationFrame(()=>requestAnimationFrame(()=>menu.classList.add('menu-ready')));
}

function motionControl() {
  const control=$('#motion-setting');
  const sync=()=>{
    document.documentElement.dataset.motion=reduced()?'reduce':'full';
    control.setAttribute('aria-pressed',String(reduced()));
    control.disabled=pref.matches;
    $('span',control).textContent=pref.matches?'الحركة منخفضة بإعداد الجهاز':'تقليل الحركة';
    document.dispatchEvent(new Event('studio-motion'));
  };
  control.hidden=false;
  control.addEventListener('click',()=>{
    persist({motionPaused:!state().motionPaused});
    sync();
  });
  pref.addEventListener('change',sync);
  sync();
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries=>{
    for(const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!reduced()) entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  },{threshold:.1});
  all('[data-reveal]').forEach(element=>observer.observe(element));
}

function showcase() {
  const root=$('#showcase');
  const scenes=all('[data-stage]',root);
  const steps=all('[data-stage-button]',root);
  const toggle=$('#showcase-toggle');
  let current=0;
  let manualPause=false;
  let visible=true;
  let timer;
  const update=(index,animate)=>{
    current=index;
    root.dataset.active=String(index);
    root.style.setProperty('--position',(10+20*index)+'%');
    scenes.forEach((scene,i)=>{
      scene.hidden=i!==index;
      scene.classList.toggle('is-entering',i===index && animate && !reduced());
    });
    steps.forEach((step,i)=>step.setAttribute('aria-pressed',String(i===index)));
  };
  const schedule=()=>{
    clearTimeout(timer);
    const playing=!manualPause && !reduced() && visible && !document.hidden;
    root.classList.toggle('is-playing',playing);
    toggle.hidden=false;
    toggle.disabled=reduced();
    toggle.setAttribute('aria-label',manualPause?'تشغيل العرض':'إيقاف العرض');
    toggle.innerHTML=icon(manualPause?'play':'pause',18);
    if (playing) timer=setTimeout(()=>{
      update((current+1)%scenes.length,true);
      schedule();
    },1800);
  };
  steps.forEach((step,i)=>step.addEventListener('click',()=>{
    update(i,true);
    schedule();
  }));
  toggle.addEventListener('click',()=>{
    manualPause=!manualPause;
    schedule();
  });
  document.addEventListener('studio-motion',schedule);
  document.addEventListener('visibilitychange',schedule);
  if ('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting;
      schedule();
    });
    observer.observe(root);
  }
  update(0,false);
  schedule();
}

function openDialog(title,content,trigger) {
  $('.dialog-content',dialog).innerHTML=`<div class="dialog-title-row"><h2 id="detail-title" tabindex="-1">${safe(title)}</h2><form method="dialog"><button class="icon-button" aria-label="إغلاق" type="submit">${icon('close',22)}</button></form></div>${content}`;
  if (!dialog.open) {
    dialog.showModal();
    dialog.addEventListener('close',()=>trigger?.focus(),{once:true});
  }
  $('#detail-title',dialog).focus();
}
const copyTimers = new WeakMap();
async function clipboardCopy(content) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
      return true;
    }
  } catch { /* Some embedded browsers permit only the selection-based fallback. */ }
  const previous=document.activeElement;
  const field=document.createElement('textarea');
  field.value=content;
  field.style.cssText='position:fixed;top:0;left:0;opacity:0;';
  (dialog.open?dialog:document.body).append(field);
  field.select();
  try { return document.execCommand('copy'); }
  catch { return false; }
  finally { field.remove(); previous?.focus(); }
}
function setupCopy() {
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-copy]');
    if (!button) return;
    const source=document.getElementById(button.dataset.copy);
    if (!source) return;
    const success=await clipboardCopy(source instanceof HTMLTextAreaElement?source.value:source.textContent);
    if (!success) {
      if (source instanceof HTMLTextAreaElement) {source.focus();source.select();}
      else {
        const details=source.closest('details');
        if (details) details.open=true;
        const selection=window.getSelection();
        if (selection) {
          const range=document.createRange();
          range.selectNodeContents(source);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      toast('تعذر النسخ التلقائي. حددنا النص لتنسخه يدويًا.');
      return;
    }
    const label=$('span',button);
    if (label) {
      label.dataset.original ||= label.textContent;
      label.textContent='تم النسخ';
      button.classList.add('copy-success');
      clearTimeout(copyTimers.get(button));
      copyTimers.set(button,setTimeout(()=>{
        label.textContent=label.dataset.original;
        button.classList.remove('copy-success');
      },1600));
    }
    toast('تم نسخ البرومبت');
  });
}

function setProgress(element,percent) {
  element.style.setProperty('--progress',String(percent/100));
  element.setAttribute('aria-valuenow',String(percent));
}
function setRing(element, percent) {
  element.style.setProperty('--ring',percent+'%');
  $('span',element).textContent=percent+'٪';
}
function enter(element) {
  element.classList.remove('panel-enter');
  requestAnimationFrame(()=>element.classList.add('panel-enter'));
}

function pathWizard() {
  const choices={...state().choices};
  const requested=types.find(t=>t.id===params.get('type'));
  if (requested) choices.type=requested.id;
  const fieldsets=all('[data-question]');
  const rail=all('.path-rail li');
  const next=$('#path-next');
  const back=$('#path-back');
  const result=$('#path-result');
  let index=0;
  all('input[type=radio]',$('#path-steps')).forEach(input=>{
    input.checked=choices[input.name]===input.value;
    input.addEventListener('change',()=>{
      choices[input.name]=input.value;
      persist({choices:{...choices}});
      render(false);
    });
  });
  function resultMarkup() {
    const value=recommend(choices);
    if (!value) return '';
    return `<div class="path-result-content"><h2 tabindex="-1">${value.title}</h2><p>${value.reason}</p><h3>الأدوات المقترحة</h3>
      <div class="chip-list">${value.toolIds.map(id=>btn(tools.find(t=>t.id===id).name,'tools.html?tool='+id+'#tool-'+id,'outline','external')).join('')}</div>
      <p>${value.limit}</p><p class="hint"><strong>أكمل دون توليد</strong> ${value.fallback}</p>
      <div class="actions">${btn('افتح الدرس المقترح','lesson.html?id='+value.lesson)}${btn('افتح دليل المشروع','projects.html?project='+value.project+'#project-'+value.project,'outline')}</div></div>`;
  }
  function render(moveFocus) {
    const current=questions[index];
    fieldsets.forEach((element,i)=>{element.hidden=i!==index;});
    rail.forEach((item,i)=>{
      const name=questions[i]?.options.find(option=>option.id===choices[questions[i]?.key])?.label;
      $('[data-step-answer]',item).textContent=name||'';
      item.toggleAttribute('data-done',Boolean(name) && i<index);
      if (i===index) item.setAttribute('aria-current','step');
      else item.removeAttribute('aria-current');
    });
    const atResult=index===questions.length;
    back.hidden=index===0;
    next.hidden=atResult;
    next.disabled=!current || !choices[current.key];
    next.innerHTML=(index===questions.length-1?'عرض التوصية':'التالي')+' '+icon('arrow',17);
    result.hidden=!atResult;
    $('#step-counter').textContent=atResult?'توصيتك جاهزة':'الخطوة '+(index+1)+' من '+questions.length;
    setProgress($('#path-progress'),index*25);
    if (atResult) result.innerHTML=resultMarkup();
    if (moveFocus) {
      const active=atResult?result:fieldsets[index];
      enter(active);
      $(atResult?'h2':'legend',active)?.focus({preventScroll:true});
    }
  }
  next.addEventListener('click',()=>{
    if (index>=questions.length || !choices[questions[index].key]) return;
    index++;
    if (index===questions.length) persist({choices:{...choices}});
    render(true);
  });
  back.addEventListener('click',()=>{
    if (!index) return;
    index--;
    render(true);
  });
  render(false);
}

function learning() {
  if (page==='roadmap') {
    const data=progress(lessons);
    $('#roadmap-count').textContent='أكملت '+data.complete.length+' من '+lessons.length+' دروس';
    setRing($('#roadmap-ring'),data.percent);
    setProgress($('#roadmap-progress'),data.percent);
    all('[data-roadmap-lesson]').forEach(link=>{$('span',link).hidden=!data.complete.includes(Number(link.dataset.roadmapLesson));});
    all('[data-phase]').forEach(phase=>phase.classList.toggle('is-complete',phase.dataset.phase.split(',').every(id=>data.complete.includes(Number(id)))));
    const resume=$('.roadmap-summary .btn');
    const next=lessons.find(l=>!data.complete.includes(l.id));
    if (next) {
      resume.href='lesson.html?id='+next.id;
      if(next.id!==1) resume.childNodes[0].textContent='تابع التعلم';
    } else {
      resume.href='projects.html';
      resume.childNodes[0].textContent='طبّق على مشروع';
    }
    return;
  }
  const requested=lessons.find(lesson=>String(lesson.id)===params.get('id')) || lessons[0];
  all('[data-lesson]').forEach(article=>{article.hidden=Number(article.dataset.lesson)!==requested.id;});
  const article=$('#lesson-'+requested.id);
  const links=all('[data-lesson-link]');
  links.forEach(link=>{
    if (Number(link.dataset.lessonLink)===requested.id) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  const checks=all('[data-check]',article);
  function update() {
    const count=checks.filter(check=>check.checked).length;
    $('.lesson-count',article).textContent=count+' / '+checks.length+' خطوات';
    const percent=Math.round(count/checks.length*100);
    setProgress($('.progress-track',article),percent);
    setRing($('#lesson-ring'),percent);
    const data=progress(lessons);
    $('#lesson-total').textContent=data.complete.length+' من '+lessons.length+' دروس';
    links.forEach(link=>{$('.lesson-done',link).hidden=!data.complete.includes(Number(link.dataset.lessonLink));});
  }
  checks.forEach(check=>{
    check.checked=state().checks[requested.id].includes(check.dataset.check);
    check.addEventListener('change',()=>{
      persist({checks:{...state().checks,[requested.id]:checks.filter(c=>c.checked).map(c=>c.dataset.check)}});
      update();
    });
  });
  if (state().legacy.length) {
    const legacyLabels=['كتابة السيناريو','تخطيط المشاهد','تجهيز العناصر البصرية','تحريك المشاهد','التعليق الصوتي','المونتاج والتصدير'];
    $('#legacy-progress').innerHTML='<details><summary>إنجازات الإصدار السابق</summary><ul class="bullet-list">'+state().legacy.map(i=>'<li>'+legacyLabels[i]+'</li>').join('')+'</ul></details>';
  }
  update();
}

function catalog() {
  const grid=$('#catalog-items');
  const cards=all('.filter-card',grid);
  const pills=all('[data-filter]');
  const query=$('#catalog-search');
  const device=$('#device-filter');
  const access=$('#access-filter');
  const favorites=$('#favorites-only');
  const labels={tools:'أدوات مطابقة',prompts:'برومبتًا مطابقًا',projects:'مشاريع مطابقة'};
  let category='';
  function apply() {
    let count=0;
    const q=normalize(query?.value||'');
    for (const card of cards) {
      const id=card.dataset.id;
      const tool=page==='tools'?tools.find(t=>t.id===id):null;
      const prompt=page==='prompts'?prompts.find(p=>p.id===id):null;
      const searchable=tool ? [tool.name,tool.summary,tool.limits].join(' ') : prompt ? [prompt.title,prompt.goal,prompt.task,prompt.example].join(' ') : card.textContent;
      const matches=(!category || category===card.dataset.category) &&
        (!q || normalize(searchable).includes(q)) &&
        (!tool || ((!device.value || tool.devices.includes(device.value)) && (!access.value || tool.access.includes(access.value)))) &&
        (favorites?.getAttribute('aria-pressed')!=='true' || state().favorites.includes(id));
      if (matches && card.hidden) {
        card.classList.remove('reappearing');
        requestAnimationFrame(()=>card.classList.add('reappearing'));
      }
      card.hidden=!matches;
      if (matches) count++;
    }
    $('.empty',grid)?.remove();
    if (!count) grid.insertAdjacentHTML('beforeend',empty(favorites?.getAttribute('aria-pressed')==='true'?'لا توجد برومبتات مفضلة تطابق اختياراتك.':'ما لقينا نتائج مطابقة. جرّب تعديل البحث أو الفلاتر.'));
    $('#result-count').textContent=count+' '+labels[page];
    for (const pill of pills) pill.setAttribute('aria-pressed',String(category===pill.dataset.filter));
  }
  for (const pill of pills) pill.addEventListener('click',()=>{category=pill.dataset.filter;apply();});
  query?.addEventListener('input',apply);
  device?.addEventListener('change',apply);
  access?.addEventListener('change',apply);
  favorites?.addEventListener('click',()=>{
    favorites.setAttribute('aria-pressed',String(favorites.getAttribute('aria-pressed')!=='true'));
    apply();
  });
  apply();
  return apply;
}

function toolsCatalog() {
  const handles=all('[data-tool]');
  for (const handle of handles) handle.addEventListener('click',event=>{
    if (event.metaKey||event.ctrlKey||event.shiftKey||event.altKey) return;
    event.preventDefault();
    const t=tools.find(item=>item.id===handle.dataset.tool);
    openDialog(t.name,toolDetail(t),handle);
  });
  const t=tools.find(item=>item.id===params.get('tool'));
  if(t) openDialog(t.name,toolDetail(t),handles.find(handle=>handle.dataset.tool===t.id));
}

function promptsCatalog(apply) {
  function paintFavorites() {
    for (const button of all('[data-favorite]')) {
      const saved=state().favorites.includes(button.dataset.favorite);
      const prompt=prompts.find(item=>item.id===button.dataset.favorite);
      button.setAttribute('aria-label',(saved?'أزل من المفضلة: ':'حفظ في المفضلة: ')+prompt.title);
      button.setAttribute('aria-pressed',String(saved));
    }
  }
  const handles=all('[data-prompt]');
  all('[data-favorite]').forEach(button=>button.addEventListener('click',()=>{
    const id=button.dataset.favorite;
    const existing=state().favorites;
    const saved=existing.includes(id);
    if (save({favorites:saved ? existing.filter(item=>item!==id) : [...existing,id]})) {
      toast(saved?'أُزيل من المفضلة':'أُضيف إلى المفضلة');
    } else toast('تعذر الحفظ في المتصفح. يبقى التغيير متاحًا حتى تغادر الصفحة.');
    paintFavorites();
    apply();
    if (button.closest('[hidden]')) $('#favorites-only').focus();
  }));
  function customize(p,trigger) {
    openDialog(p.title,`<p>${p.goal}. الأداة المناسبة: ${p.model}.</p>
      <div class="dialog-fields">${p.fields.map((key,i)=>`<label>${safe(key)}<input data-field="${i}" type="text" maxlength="500" placeholder="${safe('['+key+']')}" autocomplete="off"></label>`).join('')}</div>
      <label for="dialog-prompt"><strong>البرومبت بعد التخصيص</strong></label><textarea class="prompt-preview" id="dialog-prompt" dir="rtl" rows="5" readonly></textarea>
      <p><b>مثال</b> ${p.example}</p><div class="actions"><button class="btn primary" data-copy="dialog-prompt" type="button">${icon('copy',17)}<span>نسخ البرومبت</span></button></div>`,trigger);
    const fields=all('[data-field]',dialog);
    const preview=$('#dialog-prompt',dialog);
    function update() {preview.value=promptText(p,Object.fromEntries(fields.map((field,i)=>[p.fields[i],field.value])));}
    fields.forEach(field=>field.addEventListener('input',update));
    update();
  }
  handles.forEach(handle=>handle.addEventListener('click',()=>customize(prompts.find(p=>p.id===handle.dataset.prompt),handle)));
  const p=prompts.find(item=>item.id===params.get('prompt'));
  if(p) customize(p,handles.find(handle=>handle.dataset.prompt===p.id));
  paintFavorites();
}

function projectPage() {
  const selected=projects.find(p=>p.id===params.get('project') || '#project-'+p.id===location.hash);
  if (!selected) return;
  all('[data-project]').forEach(article=>{article.hidden=article.dataset.project!==selected.id;});
  if (location.hash==='#project-'+selected.id) {
    requestAnimationFrame(()=>{
      const article=$('#project-'+selected.id);
      article.scrollIntoView();
      $('h2',article).focus({preventScroll:true});
    });
  }
}

navigation();
motionControl();
setupCopy();
if (page==='index') showcase();
if (page==='paths') pathWizard();
if (page==='lesson' || page==='roadmap') learning();
if (['tools','prompts','projects'].includes(page)) {
  const filter = catalog();
  if (page==='tools') toolsCatalog();
  if (page==='prompts') promptsCatalog(filter);
  if (page==='projects') projectPage();
}
