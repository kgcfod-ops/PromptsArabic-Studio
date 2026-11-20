import {nav, brand, btn, ext, icon, sectionTitle, community} from './ui.mjs';
import {types} from './data/paths.mjs';
import {projects} from './data/projects.mjs';

export const stages = [
  ['الفكرة','ماذا نريد أن يتعلم المشاهد؟','bulb','idea'],
  ['السيناريو','بعد المطر… أين ذهب الماء؟','pen','script'],
  ['المشاهد','من سطح الماء إلى السحب','image','scene'],
  ['الصوت','التعليق يربط اللقطات بالفكرة','mic','audio'],
  ['الفيديو','اجمع اللقطات والصوت وراجع النتيجة','film','film']
];
const bars = [11,17,12,25,36,21,13,30,43,31,15,22,35,49,30,46,22,15,26,39,24,15,24,15,11,20,14,30,13,9];
export function showcase() {
  return `<figure class="showcase" id="showcase">
    <span class="float-icon float-clap" aria-hidden="true">${icon('logo',30)}</span><span class="float-icon float-spark" aria-hidden="true">${icon('sparkles',27)}</span>
    <div class="studio-shell">
      <div class="studio-head"><span class="studio-caption"><i></i> عرض تفاعلي</span><bdi>WATER CYCLE / STUDIO</bdi><span class="studio-dots" aria-hidden="true">•••</span></div>
      <div class="screen">
        <img src="assets/media/water.webp" alt="" fetchpriority="high" width="718" height="634">
        <div class="screen-shade"></div>
        ${stages.map(([name,description,glyph,id],i)=>`<div class="scene-state ${id}" data-stage="${i}" ${i ? 'hidden' : ''}>
          <span class="scene-glyph" aria-hidden="true">${icon(glyph,29)}</span>
          <div class="scene-content"><strong>${name}</strong><span>${description}</span></div>
          ${id==='audio' ? `<div class="wave" aria-hidden="true">${bars.map((h,i)=>`<i style="--h:${h}px;--delay:${i*-70}ms"></i>`).join('')}</div>` : ''}
          ${id==='scene' ? '<div class="frame-guides" aria-hidden="true"></div>' : ''}
        </div>`).join('')}
      </div>
      <div class="studio-timeline">
        <div class="timeline-line" aria-hidden="true"><div></div><i></i></div>
        <div class="timeline-buttons" role="group" aria-label="مراحل الإنتاج">${stages.map(([name,,glyph],i)=>`<button type="button" data-stage-button="${i}" aria-pressed="${!i}">${icon(glyph,16)}<span>${name}</span></button>`).join('')}</div>
      </div>
      <figcaption><span>مثال تطبيقي • دورة الماء</span><button type="button" id="showcase-toggle" aria-label="إيقاف العرض" hidden>${icon('pause',18)}</button></figcaption>
    </div>
  </figure>`;
}
export function projectCard(project) {
  const type=types.find(item=>item.id===project.type);
  return `<article class="project-card filter-card" data-category="${project.type}">
    <a class="project-image" href="projects.html?project=${project.id}#project-${project.id}" aria-label="دليل مشروع ${project.title}"><img src="assets/media/${project.image}.webp" alt="${project.alt}" loading="lazy" width="718" height="634"><span class="project-picture-label">${icon(type.icon,16)}${type.label}</span></a>
    <div class="project-body"><div class="metadata"><span>${icon('clock',15)}${project.duration} مستهدفة</span><span>${project.level}</span><bdi>${project.ratio}</bdi></div><h3>${project.title}</h3><p>${project.teaser}</p>${btn('افتح دليل المشروع','projects.html?project='+project.id+'#project-'+project.id,'text-btn')}</div>
  </article>`;
}
export function home() {
  return `<section class="hero"><div class="wrap hero-grid">
    <div class="hero-copy"><span class="eyebrow"><i></i> استوديو صناعة الفيديو بالذكاء الاصطناعي</span>
    <h1>من الفكرة<br>إلى <em>الفيديو<span>.</span></em></h1>
    <p>تعلّم كتابة السيناريو وتخطيط المشاهد وتحرير الفيديو. ابدأ بمشروع يناسب جهازك وميزانيتك، وطبّق كل خطوة بنفسك.</p>
    <div class="actions">${btn('ابدأ التعلم','paths.html','lime')}${btn('استكشف المشاريع','projects.html','hero-alt','film')}</div>
    <div class="hero-note">${icon('check',17)} تعلّم بالعربي واحتفظ بتقدمك على جهازك</div></div>
    ${showcase()}
  </div></section>
  <section class="wrap section type-section" data-reveal>${sectionTitle('وش ودّك تصنع؟','اختر نوع الفيديو وسيقترح الاستوديو خطة تبدأ بها.') }
    <div class="type-grid">${types.map(t=>`<a class="type-tile lift" href="paths.html?type=${t.id}"><span class="icon-box">${icon(t.icon,25)}</span><h3>${t.label}</h3><p>${t.detail}</p><span class="type-arrow" aria-hidden="true">${icon('arrow',19)}</span></a>`).join('')}</div>
  </section>
  <section class="feature-section"><div class="wrap section" data-reveal><div class="section-split">${sectionTitle('طبّق على مشروع حقيقي','افتح دليل الإنتاج وشاهد كيف تتحول الفكرة إلى نص ولوحة مشاهد وخطوات مونتاج.')}${btn('كل المشاريع','projects.html','outline')}</div>
    <div class="project-grid featured">${projects.slice(0,2).map(projectCard).join('')}</div>
  </div></section>
  <section class="wrap section" data-reveal>${sectionTitle('ثلاث خطوات لفيديوك الأول')}
    <ol class="start-list">${[['اختر مسارك','حدّد نوع الفيديو وخبرتك والجهاز والميزانية.','route'],['جهّز اللقطات','اكتب نصك وحدد الصورة والصوت لكل لقطة.','layers'],['حرّر وصدّر','اجمع اللقطات وافحص الفيديو على الهاتف.','film']].map(([t,d,g],i)=>`<li><span class="icon-box">${icon(g,24)}</span><div><h3>${i+1}. ${t}</h3><p>${d}</p></div></li>`).join('')}</ol>
    <div class="budget-deck"><article><span class="icon-box">${icon('leaf')}</span><h3>دون شراء أرصدة</h3><p>استخدم صورك وصوتك وحرّك الصور داخل محرر فيديو.</p></article><article><span class="icon-box">${icon('sparkles')}</span><h3>بأرصدة تجريبية</h3><p>جرّب توليد لقطة واحدة وراجع قيودها قبل تركيبها في المشروع.</p></article>${btn('قارن خيارات الأدوات','compare.html','outline')}</div>
  </section>
  <section class="wrap section closing" data-reveal><div><h2>ابدأ بمشروع دورة الماء</h2><p>في الدرس الأول ستحدد هدف فيديو وتصدر عينة قصيرة.</p></div>${btn('افتح أول درس','lesson.html','lime')}</section>`;
}

export function shell(page, content) {
  const title=nav.find(([id])=>id===page)?.[1];
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#092f25">
<meta name="description" content="دروس عربية تطبيقية لصناعة الفيديو بالذكاء الاصطناعي، من الفكرة حتى التصدير.">
<title>${title} | PromptsArabic Studio</title>
<script>document.documentElement.classList.add('js');</script>
<link rel="icon" href="assets/media/brand.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/cairo-arabic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/fonts/cairo.css?v=2">
<link rel="stylesheet" href="assets/css/style.css?v=2">
</head>
<body data-page="${page}">
<a class="skip" href="#main">انتقل إلى المحتوى</a>
<header class="topbar"><div class="wrap top-inner">${brand}<button class="menu-toggle" type="button" aria-controls="main-menu" aria-expanded="false" aria-label="القائمة" hidden>${icon('menu',24)}</button><nav id="main-menu" aria-label="القائمة الرئيسية">
${nav.map(([id,label])=>`<a href="${id}.html"${id===page?' aria-current="page"':''}>${label}</a>`).join('')}
</nav><a href="${community}" class="top-community" target="_blank" rel="noopener noreferrer" aria-label="قناة تيليجرام">${icon('send',17)}<span>تيليجرام</span></a></div></header>
<main id="main" tabindex="-1">${content}</main>
<footer class="site-footer"><div class="wrap footer-inner"><div>${brand}<p>تعلّم إنتاج الفيديو بالممارسة.</p></div><div class="footer-actions"><button id="motion-setting" class="btn quiet" type="button" aria-pressed="false" hidden>${icon('pause',16)} <span>تقليل الحركة</span></button>${ext('قناة تيليجرام',community,'quiet')}</div></div></footer>
<div id="toast" class="toast" role="status" aria-live="polite"></div>
<dialog id="detail-dialog" aria-labelledby="detail-title"><div class="dialog-content"></div></dialog>
<script type="module" src="assets/js/main.js?v=2"></script>
</body>
</html>
`;
}
