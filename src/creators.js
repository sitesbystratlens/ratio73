/* Creators & Partners: client-side email draft; no backend or application storage. */
const translations = window.creatorTranslations || {en:{},ko:{},zh:{}};
const recipient = 'sam.lim@stratlens.com'; // Temporary contact. Replace with a ratio73 inbox when established.
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
// The English HTML is the source of truth for untranslated static labels.
for (const el of $$('[data-i18n]')) if (!(el.dataset.i18n in translations.en)) translations.en[el.dataset.i18n] = el.innerHTML;
const savedLanguage = () => {
  try {
    const value=localStorage.getItem('ratio73:language');
    return ['en','ko','zh'].includes(value) ? value : 'en';
  } catch { return 'en'; }
};
let language = savedLanguage();
const t = key => translations[language]?.[key] ?? translations.en[key] ?? key;
function localize() {
  document.documentElement.lang = {en:'en',ko:'ko',zh:'zh-Hans'}[language];
  document.title = t('pageTitle');
  const description = $('meta[name="description"]');
  if (description) description.content = t('seoDescription');
  $$('[data-i18n]').forEach(el => { el.innerHTML=t(el.dataset.i18n); });
  $$('[data-aria]').forEach(el => el.setAttribute('aria-label',t(el.dataset.aria)));
  $$('[data-placeholder]').forEach(el => { el.placeholder=t(el.dataset.placeholder); });
  $('#language').value=language;
  $('#language').setAttribute('aria-label',t('language'));
  $('#creator-form-result').textContent='';
}
$('#language').addEventListener('change', e => {
  language=e.target.value;
  try { localStorage.setItem('ratio73:language',language); } catch {}
  localize();
});
const menu=$('.menu-toggle');
const mobileNav=$('#mobile-nav');
menu.addEventListener('click',()=>{
  const open=mobileNav.hidden;
  mobileNav.hidden=!open;
  menu.setAttribute('aria-expanded',String(open));
});
$$('#mobile-nav a').forEach(el=>el.addEventListener('click',()=>{
  mobileNav.hidden=true;
  menu.setAttribute('aria-expanded','false');
}));
const formatEnquiry=()=>{
  const name=$('#creator-name').value.trim();
  const email=$('#creator-email').value.trim();
  const market=$('#creator-country').value;
  const platform=$('#creator-platform').value;
  const profile=$('#creator-profile').value.trim();
  const message=$('#creator-message').value.trim();
  if(!name||!email||!market||!platform||!profile||!message) return null;
  return [
    'Hello ratio73 team,',
    '',
    'I am interested in a future creator or partner collaboration.',
    '',
    'Name: '+name,
    'Contact email: '+email,
    'Based in: '+market,
    'Main platform: '+platform,
    'Content profile: '+profile,
    '',
    'My content and collaboration ideas:',
    message,
    '',
    'I understand that paid, affiliate and product-gifting collaborations are not yet confirmed.'
  ].join('\n');
};
$('#creator-interest-form').addEventListener('submit',event=>{
  event.preventDefault();
  const form=event.currentTarget;
  if(!form.reportValidity()) return;
  const body=formatEnquiry();
  if(!body) return;
  const subject=t('mailSubject');
  // A draft is opened in the visitor's mail client: no form submission happens here.
  const href='mailto:'+recipient+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  $('#creator-form-result').textContent=t('emailOpened');
  window.location.href=href;
});
const infoDialog=$('#creators-info-dialog');
const showInfo=kind=>{
  const lookup={
    privacy:['privacyTitle','privacyText'],
    terms:['termsTitle','termsText'],
    delivery:['deliveryTitle','deliveryInfo']
  };
  const pair=lookup[kind];
  if(!pair) return;
  $('#creators-info-title').textContent=t(pair[0]);
  $('#creators-info-text').textContent=t(pair[1]);
  infoDialog.showModal();
};
$$('[data-info]').forEach(el=>el.addEventListener('click',()=>showInfo(el.dataset.info)));
$$('[data-close]').forEach(el=>el.addEventListener('click',()=>el.closest('dialog').close()));
infoDialog.addEventListener('click',e=>{if(e.target===infoDialog) infoDialog.close();});
$('#year').textContent=new Date().getFullYear();
localize();
