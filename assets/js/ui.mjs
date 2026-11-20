export const nav = [
  ['index','الرئيسية'],['paths','المسارات'],['lesson','الدروس'],['tools','الأدوات'],['projects','المشاريع'],
  ['prompts','البرومبتات'],['compare','المقارنة'],['roadmap','خريطة التعلم'],['about','عن المنصة']
];
export const community = 'https://t.me/PromptsArabic';
const icons = {
  logo:'<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 10h18M8 5l3 5m3-5 3 5"/><path d="m10 13 4 2-4 2z" fill="currentColor" stroke="none"/>',
  arrow:'<path d="M19 12H5m7-7-7 7 7 7"/>', back:'<path d="M5 12h14m-7-7 7 7-7 7"/>',
  external:'<path d="M13 5h6v6m0-6-8 8m6 0v6H5V7h6"/>',
  film:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16m10-16v16M3 9h4m10 0h4M3 15h4m10 0h4"/>',
  book:'<path d="M12 7c-3-2-6-2-9-1v13c3-1 6-1 9 1 3-2 6-2 9-1V6c-3-1-6-1-9 1Zm0 0v13"/>',
  megaphone:'<path d="m3 11 15-5v12L3 14zM7 15l2 5h3l-2-4m11-5v2"/>',
  phone:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  mic:'<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0m-7 7v3m-3 0h6"/>',
  play:'<path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none"/>',
  pause:'<path d="M9 5v14m6-14v14" stroke-width="3"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>', close:'<path d="m6 6 12 12M6 18 18 6"/>',
  bulb:'<path d="M9 18h6m-5 3h4m-2-18a6 6 0 0 0-3.5 11c.7.5.5 1.5.5 2h6c0-.5-.2-1.5.5-2A6 6 0 0 0 12 3Z"/>',
  pen:'<path d="m3 21 5-1L21 7l-4-4L4 16l-1 5ZM15 5l4 4"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="m3 17 5-4 4 3 3-5 6 6"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5zm-9 9 9 5 9-5m-18 4 9 5 9-5"/>',
  leaf:'<path d="M5 19C1 11 8 6 20 4c0 10-5 16-12 14m-4 3c3-5 7-8 11-11"/>',
  sparkles:'<path d="M12 3c1 6 3 8 9 9-6 1-8 3-9 9-1-6-3-8-9-9 6-1 8-3 9-9Zm8 1v4m-2-2h4"/>',
  monitor:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M12 17v4m-4 0h8"/>',
  sprout:'<path d="M12 21v-9m0 4c0-6-3-9-9-9 0 5 3 9 9 9Zm0-3c0-5 3-8 9-9 0 6-3 9-9 9Z"/>',
  sliders:'<path d="M5 4v16m7-16v16m7-16v16M3 8h4m3 8h4m3-7h4"/>',
  check:'<path d="m5 12 4 4L19 6"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2"/>',
  heart:'<path d="M12 20S3 15 3 9a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 6-9 11-9 11Z"/>',
  route:'<circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h8a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h8"/>',
  bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',
  terminal:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 8 4 4-4 4m6 0h4"/>',
  send:'<path d="m22 3-7 18-4-8L3 9l19-6Zm-11 10 5-5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  flag:'<path d="M5 21V4c5-3 8 3 14 0v10c-6 3-9-3-14 0"/>',
  droplet:'<path d="M12 2c3 4 7 8 7 13a7 7 0 1 1-14 0c0-5 4-9 7-13Z"/>',
};
export function icon(id, size=20) {
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[id] || icons.sparkles}</svg>`;
}
export function safe(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export const btn = (text,href,which='primary',glyph='arrow') => `<a class="btn ${which}" href="${href}">${text}${glyph ? icon(glyph,18) : ''}</a>`;
export const ext = (text,href,which='outline') => `<a class="btn ${which}" href="${href}" target="_blank" rel="noopener noreferrer">${text}${icon('external',17)}</a>`;
export const brand = `<a class="brand" href="./" aria-label="PromptsArabic Studio · الرئيسية"><span class="brand-icon">${icon('logo',24)}</span><span dir="ltr">PromptsArabic <b>Studio</b></span></a>`;
export const heading = (eyebrow,title,description,glyph) => `<section class="page-heading"><div class="wrap heading-layout"><div><span class="eyebrow">${icon(glyph,17)}${eyebrow}</span><h1>${title}</h1><p>${description}</p></div><div class="heading-icon" aria-hidden="true">${icon(glyph,48)}</div></div></section>`;
export const empty = (text='ما لقينا نتائج مطابقة. جرّب تعديل البحث أو الفلاتر.') => `<div class="empty">${icon('search',26)}<p>${text}</p></div>`;
export const ordered = items => `<ol class="instruction-list">${items.map(item=>`<li>${item}</li>`).join('')}</ol>`;
export const list = items => `<ul class="bullet-list">${items.map(item=>`<li>${item}</li>`).join('')}</ul>`;
export const faq = items => items.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('');
export const sectionTitle = (title, description='') => `<div class="section-title"><h2>${title}</h2>${description ? `<p>${description}</p>`:''}</div>`;
export const searchBox = (id,label) => `<label class="search-box" for="${id}">${icon('search')}<span class="sr-only">${label}</span><input type="search" id="${id}" placeholder="${label}" autocomplete="off"></label>`;
export const normalize = value => value.toLowerCase().normalize('NFKD').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/ى/g,'ي').trim();
