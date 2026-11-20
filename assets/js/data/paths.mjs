export const types = [
  {id:'educational', label:'فيديو تعليمي', icon:'book', detail:'حوّل فكرة دراسية إلى شرح يسهل فهمه.', project:'water', output:'شرح بصري لدورة الماء'},
  {id:'advertising', label:'فيديو إعلاني', icon:'megaphone', detail:'اعرض منتجًا وفائدته بلقطات واضحة.', project:'cards', output:'عرض استخدام لمنتج تعليمي'},
  {id:'short', label:'محتوى قصير', icon:'phone', detail:'صوّر فكرة واحدة بتنسيق عمودي.', project:'short', output:'مقطع عمودي بمقدمة مباشرة'},
  {id:'avatar', label:'مقدم افتراضي', icon:'mic', detail:'قدّم نصًا قصيرًا بصوت وشخصية.', project:'avatar', output:'تقديم عربي بشخصية مرسومة'}
];
export const questions = [
  {key:'type', title:'ماذا تريد أن تصنع؟', step:'نوع الفيديو', description:'اختر النتيجة التي تريد أن تصل إليها في مشروعك الأول.', options:types},
  {key:'level', title:'ما خبرتك في إنتاج الفيديو؟', step:'الخبرة', description:'نقترح لك نقطة بداية بناءً على ما جربته من قبل.', options:[
    {id:'beginner', label:'مبتدئ', detail:'أبدأ من الفكرة وأحتاج خطوات مرتبة.',icon:'sprout'},
    {id:'experienced', label:'لدي خبرة', detail:'جرّبت المونتاج وأريد تحسين التخطيط.',icon:'sliders'}]},
  {key:'device', title:'على أي جهاز ستعمل؟', step:'الجهاز',description:'يعتمد اختيار محرر الفيديو على الجهاز الذي ستستخدمه.', options:[
    {id:'phone', label:'هاتف', detail:'أصوّر وأحرّر من الهاتف.', icon:'phone'},
    {id:'desktop', label:'كمبيوتر', detail:'أفضل شاشة ومسارات تحرير أكبر.', icon:'monitor'}]},
  {key:'budget', title:'كيف تريد البدء؟', step:'الميزانية',description:'جميع المسارات تتضمن طريقة بديلة عند عدم توفر التوليد.', options:[
    {id:'free',label:'مجاني', detail:'صور وصوت وحركة داخل محرر دون شراء أرصدة.',icon:'leaf'},
    {id:'limited',label:'مجاني محدود', detail:'أجرّب توليد لقطة واحدة بالأرصدة المتاحة.',icon:'sparkles'},
    {id:'paid',label:'مدفوع', detail:'أقارن اشتراكًا مناسبًا إذا احتجت إليه.',icon:'layers'}]}
];
export function validChoices(value) {
  return Object.fromEntries(questions.flatMap(q => q.options.some(o => o.id === value?.[q.key]) ? [[q.key,value[q.key]]] : []));
}

export function recommend(selection) {
  const {type, level, device, budget} = validChoices(selection);
  if (!type || !level || !device || !budget) return null;
  const selected = types.find(item => item.id === type);
  const phone = device === 'phone';
  // التحرير أولًا على كل جهاز. التوليد الاختياري يتغير حسب نوع الفيديو والخطة.
  const editor = phone ? 'capcut' : budget === 'free' ? 'shotcut' : 'clipchamp';
  const optional = type === 'avatar' ? 'heygen' : type === 'short' || phone ? 'pika' : type === 'advertising' ? 'runway' : 'flow';
  const levelReason = level === 'beginner' ? 'ابدأ بكتابة هدف واحد واختبر ترتيب ثلاث لقطات.' : 'ابدأ بمخطط اللقطات واختبر نسختين من اللقطة المحورية قبل تثبيت التوقيت.';
  const deviceReason = phone ? 'حرّر على الهاتف بملفاتك واختر مشروعًا فارغًا، وجرّب التصدير قبل إكمال العمل.' : 'حرّر على الكمبيوتر لفصل مساري الصوت والصورة وضبط التوقيت بدقة.';
  const limit = {
    free:'يُنجز المسار دون شراء أرصدة. تجنب قوالب أو مخزون المحرر المدفوع.',
    limited:'خصص الأرصدة المتاحة لأصعب لقطة. راجع العلامة المائية والترخيص قبل النشر.',
    paid:'اختبر عينة قبل الاشتراك، وراجع الرصيد وجودة التصدير والترخيص التجاري للخطة الفعلية.'
  }[budget];
  const creation = budget === 'free' ? [] : [optional];
  const support = type === 'educational' ? ['canva'] : type === 'avatar' || budget === 'paid' ? [budget === 'paid' ? 'elevenlabs' : 'ttsmaker'] : [];
  const fallback = type === 'avatar' ? 'ارسم شخصية أصلية، واعرض ثلاث وضعيات ثابتة بالتناوب مع تعليقك الصوتي المسجل.' : 'استخدم صورك أو شرائحك، حرّكها بالتقريب والإزاحة داخل المحرر، وسجّل التعليق الصوتي بهاتفك.';
  return {title:selected.output, reason:levelReason+' '+deviceReason, limit, toolIds:[editor,...support,...creation], lesson:level === 'beginner' ? 1 : 3, project:selected.project, fallback};
}
