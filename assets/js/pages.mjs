import {icon,btn,ext,heading,sectionTitle,ordered,list,faq,searchBox,safe,community} from './ui.mjs';
import {home,projectCard} from './home.mjs';
import {types,questions} from './data/paths.mjs';
import {lessons} from './data/lessons.mjs';
import {tools, verified,categories,devices,access} from './data/tools.mjs';
import {projects,waterSource} from './data/projects.mjs';
import {prompts,promptCategories,promptText} from './data/prompts.mjs';

const badge = text => `<span class="badge">${text}</span>`;
const toolById = id=>tools.find(tool=>tool.id===id);
const promptById = id=>prompts.find(prompt=>prompt.id===id);
const copyButton = (id,label='نسخ البرومبت') => `<button type="button" class="btn outline" data-copy="${id}">${icon('copy',17)}<span>${label}</span></button>`;
const toolLinks = ids => `<div class="chip-list">${ids.map(id=>ext(toolById(id).name,toolById(id).url)).join('')}</div>`;
const promptLinks = ids => `<div class="chip-list">${ids.map(id=>btn(promptById(id).title,'prompts.html?prompt='+id,'outline','terminal')).join('')}</div>`;
const select = (id,label,options) => `<label class="select-label" for="${id}"><span>${label}</span><select id="${id}"><option value="">الكل</option>${Object.entries(options).map(([value,text])=>`<option value="${value}">${text}</option>`).join('')}</select></label>`;
const filters = (label,items) => `<div class="filter-pills" role="group" aria-label="${label}">${[['','الكل'],...Object.entries(items)].map(([key,label])=>`<button type="button" data-filter="${key}" aria-pressed="${key==='' }">${label}</button>`).join('')}</div>`;
const track = id => `<div class="progress-track" id="${id}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" aria-label="نسبة الإنجاز"><i></i></div>`;

function paths() {
  return heading('اختيار المسار','خطتك لأول فيديو','أربع اختيارات لنقترح لك الأدوات ونقطة البداية.','route')+`
  <section class="wrap section start-path"><div class="path-layout">
    <aside class="path-rail"><h2>اختياراتك</h2><ol>${[...questions.map(q=>q.step),'التوصية'].map((step,i)=>`<li ${i===0?'aria-current="step"':''}><span>${i+1}</span><div>${step}<small data-step-answer="${i}"></small></div></li>`).join('')}</ol></aside>
    <div class="panel path-panel" id="path-panel"><div class="path-top"><b id="step-counter">الخطوة 1 من 4</b>${track('path-progress')}</div>
      <div id="path-steps">${questions.map((q,i)=>`<fieldset data-question="${i}" ${i?'hidden':''}>
      <legend tabindex="-1">${q.title}</legend><p>${q.description}</p><div class="choices">${q.options.map(o=>`<label class="choice lift"><input type="radio" name="${q.key}" value="${o.id}"><span class="icon-box">${icon(o.icon,23)}</span><span class="choice-text"><strong>${o.label}</strong><small>${o.detail}</small></span><span class="radio-mark" aria-hidden="true"></span></label>`).join('')}</div></fieldset>`).join('')}</div>
      <div id="path-result" hidden></div>
      <div class="path-controls"><button type="button" id="path-back" class="btn outline" hidden>${icon('back',17)} السابق</button><button type="button" id="path-next" class="btn primary" disabled>التالي ${icon('arrow',17)}</button></div>
      <noscript><p>فعّل JavaScript للحصول على اقتراح مخصص أو <a href="lesson.html">ابدأ الدرس مباشرة</a>.</p></noscript>
    </div></div></section>`;
}

function lessonBody(lesson) {
  const currentPrompt=promptById(lesson.prompts[0]);
  return `<article class="lesson-body" data-lesson="${lesson.id}" id="lesson-${lesson.id}" ${lesson.id===1?'':'hidden'}>
    <div class="panel lesson-intro"><span class="eyebrow">${icon('book',17)} الدرس ${lesson.id} من ${lessons.length} · ${lesson.subtitle}</span><h2 tabindex="-1">${lesson.title}</h2><p>${lesson.goal}</p><p class="lesson-needs"><b>قبل أن تبدأ</b> ${lesson.needs}</p></div>
    ${lesson.id===1?`<figure class="lesson-visual"><img src="assets/media/water.webp" alt="بحيرة تحيط بها الأشجار والجبال" width="718" height="634"><figcaption>${badge('لوحة مشاهد') }<strong>دورة الماء للأطفال</strong><a href="projects.html?project=water#project-water">افتح النص والتوقيت</a></figcaption></figure>`:''}
    <section class="panel"><h3>خطوات التنفيذ</h3>${ordered(lesson.steps)}</section>
    <section class="panel lesson-example"><h3>مثال وتطبيق</h3><dl><div><dt>المدخل</dt><dd>${lesson.input}</dd></div><div><dt>الناتج المتوقع</dt><dd>${lesson.output}</dd></div></dl><p><b>جرّب بنفسك</b> ${lesson.practice}</p></section>
    <section class="panel"><h3>البرومبت والأدوات</h3><p>${currentPrompt.goal}</p><pre dir="rtl" id="copy-lesson-${lesson.id}">${safe(promptText(currentPrompt))}</pre>
    <div class="actions">${copyButton('copy-lesson-'+lesson.id)}${btn('خصّص البرومبت','prompts.html?prompt='+currentPrompt.id,'text-btn','pen')}</div>
    <div class="chip-list">${lesson.prompts.slice(1).map(id=>btn(promptById(id).title,'prompts.html?prompt='+id,'outline','terminal')).join('')}</div>${toolLinks(lesson.tools)}</section>
    <section class="panel"><h3>أخطاء شائعة</h3>${list(lesson.mistakes)}<h3>اختبر فهمك</h3><div class="details-list">${faq(lesson.quiz.map(([q,a,why])=>[q,'<b>'+a+'</b> '+why]))}</div></section>
    <section class="panel lesson-checks"><div class="section-split"><h3>قائمة تحقق الدرس</h3><span class="lesson-count" aria-live="polite">0 / ${lesson.checks.length} خطوات</span></div>
    ${track('lesson-progress-'+lesson.id)}
    ${lesson.checks.map((check,i)=>`<label class="check-line"><input type="checkbox" data-check="${lesson.id}:${i}"><span>${check}</span></label>`).join('')}
    <div class="actions lesson-next">${lesson.id>1?btn('الدرس السابق','lesson.html?id='+(lesson.id-1),'outline','back'):''}${lesson.id<lessons.length?btn('الدرس التالي','lesson.html?id='+(lesson.id+1)):btn('خريطة التعلم','roadmap.html')}</div></section>
    </article>`;
}
function lesson() {
  return heading('الاستوديو التعليمي','دروس صناعة الفيديو','ثمانية دروس تقودك من تحديد الهدف حتى مراجعة الفيديو المصدّر.','book')+`
    <div class="wrap section learning-grid"><aside class="learning-rail panel"><div class="rail-head"><h2>محتوى المسار</h2><span id="lesson-total" aria-live="polite">0 من 8 دروس</span></div>
    <div class="progress-ring" id="lesson-ring"><span>0٪</span></div>
    <nav aria-label="دروس المسار">${lessons.map(l=>`<a href="lesson.html?id=${l.id}" data-lesson-link="${l.id}" ${l.id===1?'aria-current="page"':''}><i>${l.id}</i><span>${l.title}</span><span class="lesson-done" hidden>${icon('check',16)}<span class="sr-only">مكتمل</span></span></a>`).join('')}</nav><div id="legacy-progress"></div></aside>
    <div class="lesson-main">${lessons.map(lessonBody).join('')}</div></div>`;
}

function toolsPage() {
  return heading('دليل الاختيار','دليل الأدوات','قارن أدوات المونتاج والتصميم والصوت والتوليد حسب حاجتك وجهازك.','sliders')+`
  <section class="wrap section catalog">
  <div class="controls"><div class="control-main">${searchBox('catalog-search','ابحث باسم الأداة أو مهمتها')}${select('access-filter','نوع الوصول',access)}${select('device-filter','الجهاز',devices)}</div>${filters('فئة الأداة',categories)}</div>
  <div class="result-line"><p id="result-count" aria-live="polite">${tools.length} أدوات</p><p>مراجعة المصادر · ${verified}</p></div>
  <div class="tool-grid" id="catalog-items">${tools.map(t=>`<article class="tool-card filter-card lift" data-id="${t.id}" data-category="${t.category}"><div class="tool-card-top"><span class="tool-mark" aria-hidden="true">${t.mark}</span>${badge(categories[t.category])}</div><h2 dir="ltr">${t.name}</h2><p>${t.summary}</p>
  <div class="metadata"><span>${icon('leaf',16)}${access[t.access[0]]}</span><span>${t.devices.map(d=>devices[d]).join(' / ')}</span></div><div class="tool-controls"><a href="tools.html?tool=${t.id}#tool-${t.id}" class="btn text-btn" data-tool="${t.id}">التفاصيل ${icon('arrow',17)}</a>${ext('الموقع الرسمي',t.url,'outline')}</div></article>`).join('')}</div>
  <div class="fallback-details">${tools.map(t=>`<details id="tool-${t.id}"><summary>${t.name}</summary>${toolDetail(t)}</details>`).join('')}</div>
  ${btn('قارن المجاني والمدفوع','compare.html','outline')}</section>`;
}
export function toolDetail(t) {
  return `<p>${t.summary}</p><dl class="detail-facts"><div><dt>المجال والجهاز</dt><dd>${categories[t.category]} · ${t.devices.map(d=>devices[d]).join(' و')}</dd></div><div><dt>الوصول والقيود</dt><dd>${t.limits}</dd></div><div><dt>متى تدفع؟</dt><dd>${t.paid}</dd></div><div><dt>حقوق الاستخدام</dt><dd>${t.rights}</dd></div></dl><p class="muted">تاريخ مراجعة المصادر · ${verified}</p><div class="chip-list">${t.sources.map(([label,url])=>ext(label,url)).join('')}</div><div class="actions">${ext('افتح الأداة الرسمية',t.url,'primary')}</div>`;
}

function projectDetail(p) {
  return `<article class="project-detail panel" id="project-${p.id}" data-project="${p.id}" ${p.id==='water'?'':'hidden'}>
  <header class="project-detail-top">${badge(p.level)} <span>${p.duration} مستهدفة · <bdi>${p.ratio}</bdi></span><h2 tabindex="-1">${p.title}</h2><p>${p.goal}</p><p><b>الجمهور</b> ${p.audience}</p></header>
  <section><h3>ما تحتاجه</h3>${list(p.needs)}</section>
  <section><h3>لوحة المشاهد ونص الراوي</h3><div class="shot-grid">${p.shots.map(([time,shot,voice],i)=>`<article><div class="shot-num"><span class="icon-box">${icon(i===0?'image':p.id==='water'?'droplet':'film',20)}</span><bdi>${time} s</bdi></div><h4>${shot}</h4><p>${voice}</p></article>`).join('')}</div>
    ${p.id==='water'?`<p class="muted">مراجعة المفاهيم العلمية ${ext('مرجع دورة الماء',waterSource,'text-btn')}</p>`:''}</section>
  <section><h3>النسخة المجانية</h3><p>${p.free}</p></section>
  <section><h3>المونتاج والتصدير</h3>${ordered(p.edit)}</section>
  <section><h3>برومبتات وأدوات المشروع</h3>${promptLinks(p.prompts)}${toolLinks(p.tools)}</section>
  <section><h3>راجع الناتج قبل النشر</h3>${list(p.checks)}</section></article>`;
}
function projectPage() {
  return heading('تطبيق عملي','معرض المشاريع','اختر مشروعًا وابدأ من نص وتعليمات جاهزة للتطبيق في محرر الفيديو.','film')+`
  <section class="wrap section catalog">${filters('نوع المشروع',Object.fromEntries(types.map(t=>[t.id,t.label])))}<p id="result-count" class="result-line" aria-live="polite">${projects.length} مشاريع</p>
  <div class="project-grid" id="catalog-items">${projects.map(projectCard).join('')}</div>
  <div class="project-details">${projects.map(projectDetail).join('')}</div></section>`;
}

function promptPage() {
  return heading('مكتبة الكتابة والتوليد','مكتبة البرومبتات','ابحث عن برومبت، عدّل الحقول بين الأقواس، ثم انسخه إلى أداتك.','terminal')+`
    <section class="wrap section catalog"><div class="controls"><div class="control-main">${searchBox('catalog-search','ابحث بالعنوان أو الموضوع')}
    <button class="btn outline" id="favorites-only" type="button" aria-pressed="false">${icon('heart',17)} المفضلة</button></div>${filters('فئة البرومبت',promptCategories)}</div>
    <p id="result-count" class="result-line" aria-live="polite">${prompts.length} برومبتًا</p>
    <div class="prompt-grid" id="catalog-items">${prompts.map(p=>`<article class="prompt-card filter-card lift" data-id="${p.id}" data-category="${p.category}"><div class="prompt-top"><span class="icon-box">${icon('terminal',20)}</span>${badge(promptCategories[p.category])}<button type="button" data-favorite="${p.id}" class="icon-button favorite" aria-label="حفظ في المفضلة: ${p.title}" aria-pressed="false">${icon('heart',21)}</button></div>
    <h2>${p.title}</h2><p>${p.goal}.</p><p class="muted">${p.model}</p><div class="actions"><button type="button" class="btn primary" data-prompt="${p.id}">${icon('pen',17)} تخصيص</button>${copyButton('copy-'+p.id,'نسخ')}</div>
    <details><summary>عرض القالب والمثال</summary><pre id="copy-${p.id}" dir="rtl">${safe(promptText(p))}</pre><p><b>مثال</b> ${p.example}</p></details></article>`).join('')}</div></section>`;
}

const compareRows = [
  ['Shotcut','مجاني بالكامل','مونتاج محلي بلا أرصدة؛ الجودة حسب الإعدادات','لا يضيف علامة','المحرر مجاني تجاريًا؛ راجع حقوق الأصول','shotcut'],
  ['Microsoft Clipchamp','مجاني محدود / مدفوع','حتى 1080p مجانًا بالإمكانات المشمولة؛ ‏4K من مزايا مدفوعة','بلا علامة باستخدام مواد وميزات مشمولة','تخضع مواد المخزون لترخيصها','clipchamp'],
  ['Google Flow','مجاني محدود / مدفوع','التوليد يستهلك أرصدة حسب النموذج والحساب','تختلف حسب النموذج والخطة','راجع شروط المشروع والأصول المرفوعة','flow'],
  ['Pika','مجاني محدود / مدفوع','الأرصدة والدقة بحسب الخطة','تحقق من خيار التصدير في خطتك','الحساب المجاني لا يمنح رخصة تجارية','pika'],
  ['HeyGen','مجاني محدود / مدفوع','عدد مقاطع ومدة محدودان مجانًا؛ التفاصيل بحسب الخطة','النسخة المجانية بعلامة مائية','تحقق من شروط الشخصية والصوت قبل النشر','heygen'],
  ['ElevenLabs','مجاني محدود / مدفوع','رصيد تحويل النص إلى صوت؛ لا ينطبق قياس دقة الفيديو','للخطة المجانية شروط نشر وإسناد','الترخيص التجاري يبدأ من Starter وفق خطة المنتج','elevenlabs']
];
function compare() {
  return heading('خيارات الحساب','مجاني أم مدفوع؟','حدّد ما تحتاجه في المشروع، ثم تحقق من شروط الأداة نفسها قبل الاشتراك.','layers')+`
  <section class="wrap section"><div class="compare-leads">${[['مجاني بالكامل','تحرير محلي باستخدام ملفاتك دون أرصدة، مثل Shotcut.','leaf'],['مجاني محدود','تجربة بحدود أو مزايا محددة، مثل توليد لقطة في Flow.','bolt'],['مدفوع','إمكانات إضافية تحتاجها فعليًا، مثل 4K في Clipchamp.','layers']].map(([title,p,glyph])=>`<article class="panel"><span class="icon-box">${icon(glyph,24)}</span><h2>${title}</h2><p>${p}</p></article>`).join('')}</div>
  <div class="section-split">${sectionTitle('مقارنة حسب الأداة')}<p class="muted">مراجعة المصادر · ${verified}</p></div>
  <div class="compare-table"><table><caption class="sr-only">خيارات الوصول والقيود حسب الأداة</caption><thead><tr>${['الأداة','الوصول','الجودة والأرصدة','علامة أو إسناد','الحقوق'].map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead>
  <tbody>${compareRows.map(([name,mode,quality,watermark,rights,id])=>`<tr><th scope="row"><bdi>${name}</bdi><a href="tools.html?tool=${id}#tool-${id}">المصادر والتفاصيل</a></th>${[[mode,'الوصول'],[quality,'الجودة والأرصدة'],[watermark,'علامة أو إسناد'],[rights,'الحقوق']].map(([s,l])=>`<td data-label="${l}">${s}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
  <div class="panel faq-block"><h2>قبل أن تختار حسابًا</h2><div class="details-list">${faq([
    ['هل أحتاج اشتراكًا؟','ابدأ بأصولك ومحرر فيديو. قد تحتاج باقة لتجاوز حد عملي مثل ترخيص صوت تجاري أو إزالة علامة أداة بعينها.'],
    ['كيف أنتج دون أرصدة؟','ارسم صورًا بسيطة وسجّل صوتك ثم حرّك الصور داخل المحرر. شاهد <a href="projects.html?project=water#project-water">مشروع دورة الماء</a>.'],
    ['كيف أختار على الهاتف أو الكمبيوتر؟','اختبر CapCut على الهاتف أو Shotcut محليًا على الكمبيوتر. صدّر عينة من مشروع فارغ بأصولك للتحقق من الشروط في جهازك.']
  ])}</div></div></section>`;
}
function roadmap() {
  const plans = [
    ['مبتدئ','حدّد هدفًا واكتب نصًا وارسم اللقطات.','sprout',[1,2,3],'water'],
    ['تطبيقي','جهّز الأصول وحرّكها وسجّل التعليق.','layers',[4,5,6],'cards'],
    ['متقدم','جمّع العمل وراجع ملف التصدير.','flag',[7,8],'short']
  ];
  return heading('من أول درس إلى التصدير','خريطة التعلم','أكمل قائمة التحقق في كل درس، وستظهر النتيجة هنا على جهازك.','route')+`
  <section class="wrap section roadmap-section">
    <div class="panel roadmap-summary"><div class="progress-ring" id="roadmap-ring"><span>0٪</span></div><div><h2>تقدمك في المسار</h2><p id="roadmap-count" aria-live="polite">أكملت 0 من 8 دروس</p>${track('roadmap-progress')}</div>${btn('ابدأ التعلم','lesson.html','primary')}</div>
    <ol class="roadmap-track" data-reveal>${plans.map(([title,description,glyph,ids,project])=>`<li class="panel phase" data-phase="${ids.join(',')}"><span class="phase-node">${icon(glyph,24)}</span><h2>${title}</h2><p>${description}</p><ul>${ids.map(id=>`<li><a data-roadmap-lesson="${id}" href="lesson.html?id=${id}">${lessons[id-1].title}<span hidden>${icon('check',17)} مكتمل</span></a></li>`).join('')}</ul>${btn('المشروع التطبيقي','projects.html?project='+project+'#project-'+project,'text-btn')}</li>`).join('')}</ol>
  </section>`;
}
function about() {
  return heading('عن PromptsArabic Studio','استوديو لتعلّم صناعة الفيديو','تعلّم الخطوات بالعربي واستخدم الأدوات التي تلائم مشروعك.','logo')+`
  <section class="wrap section about-layout"><article class="panel about-intro"><div><h2>لمن هذه المنصة؟</h2><p>للمعلمين والطلاب وصناع المحتوى ممن يريدون إنتاج فيديو تعليمي أو إعلان أو مقطع قصير، حتى إن كان التصوير والتحرير جديدين عليهم.</p><p>تجد هنا خطط إنتاج ودروسًا وبرومبتات. يتم التوليد والتحرير والتصدير في الأدوات الخارجية التي تختارها.</p><div class="actions">${btn('اختر مسارك','paths.html')}${ext('تابع القناة',community)}</div></div><img src="assets/media/camera.webp" alt="كاميرا في استوديو مضاء بالأخضر" width="718" height="634"></article>
  <div class="panel faq-block"><h2>أسئلة شائعة</h2><div class="details-list">${faq([
    ['هل الدروس مجانية؟','جميع الدروس والمشاريع والبرومبتات هنا متاحة مجانًا. للأدوات الخارجية خططها وشروطها.'],
    ['هل أحتاج حسابًا؟','تصفح المنصة مباشرة. قد تحتاج حسابًا عند فتح مزود خارجي، بحسب الأداة.'],
    ['أين يُحفظ تقدمي؟','يحفظ المتصفح محليًا تقدم الدروس وخيارات المسار والمفضلة وتفضيل الحركة. مسح بيانات الموقع أو تغيير المتصفح أو الجهاز يؤثر على الوصول إلى تقدمك. نصوص التخصيص تبقى في نافذة البرومبت حتى إغلاقها.'],
    ['هل يعمل الاستوديو على الهاتف؟','تعمل الصفحات على هاتف وكمبيوتر بمتصفح حديث. راجع توافق محرر الفيديو ومولدات المشاهد في دليل الأدوات.'],
    ['كيف أجد مصادر الأدوات؟','افتح تفاصيل البطاقة في <a href="tools.html">دليل الأدوات</a>. ستجد صفحات المزود الرسمية وتاريخ مراجعتها.'],
    ['هل ينتج هذا الموقع ملف فيديو لي؟','يشرح الاستوديو طريقة الإنتاج ويجهز لك خطوات العمل. تجمع أصولك وتصدّر ملف MP4 في محرر تختاره.']
  ])}</div></div></section>`;
}
export const views = {index:home,paths,lesson,tools:toolsPage,projects:projectPage,prompts:promptPage,compare,roadmap,about};
