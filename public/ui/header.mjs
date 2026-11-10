/** Universal navigation for THINK, FOCUS, LEARN, DECIDE, JOURNEY and STUDIO.
 * The logo, labels, link order and position are identical across every page.
 * Only the non-personal FR/EN preference is persisted by language.mjs.
 */
import {initialLanguage,localizeLinks} from '../language.mjs';
const destinations=Object.freeze({
 '/':'brand-link','/index.html':'brand-link',
 '/focus':'focus-nav-link','/focus.html':'focus-nav-link',
 '/learn':'learn-nav-link','/learn.html':'learn-nav-link',
 '/decide':'decide-nav-link','/decide.html':'decide-nav-link',
 '/journey':'journey-nav-link','/journey.html':'journey-nav-link',
 '/studio':'studio-nav-link','/studio.html':'studio-nav-link'
});
const strings=Object.freeze({
 fr:{tagline:'INITIATIVE INDÉPENDANTE',method:'Notre méthode',journey:'MON PARCOURS',
  ethics:'Nos engagements',label:'Navigation principale',home:'HUMAN FIRST, accueil',
  switch:'Passer en anglais'},
 en:{tagline:'INDEPENDENT INITIATIVE',method:'Our method',journey:'MY JOURNEY',
  ethics:'Our commitments',label:'Main navigation',home:'HUMAN FIRST, home',
  switch:'Switch to French'}
});
export function renderSiteHeader(locale=initialLanguage(),root=globalThis.document){
 if(!root?.querySelector)return;
 const header=root.querySelector('header.hf-site-header');
 if(!header)return;
 const lang=locale==='en'?'en':'fr',copy=strings[lang];
 const set=(selector,value)=>{const node=header.querySelector(selector);if(node)node.textContent=value;};
 set('[data-hf-label="tagline"]',copy.tagline);
 set('#nav-method',copy.method);set('#journey-nav-link',copy.journey);set('#nav-ethics',copy.ethics);
 const brand=header.querySelector('#brand-link');
 if(brand)brand.setAttribute('aria-label',copy.home);
 const nav=header.querySelector('.hf-site-nav');if(nav)nav.setAttribute('aria-label',copy.label);
 const language=header.querySelector('#language-switch');
 if(language){language.textContent=lang==='fr'?'EN':'FR';language.setAttribute('aria-label',copy.switch)}
 const current=destinations[globalThis.location?.pathname??'/']??'';
 for(const item of header.querySelectorAll('.hf-site-nav a')){
  if(item.id===current)item.setAttribute('aria-current','page');
  else item.removeAttribute('aria-current');
 }
 // Global link localization only: no learner answer or profile is touched.
 localizeLinks(lang,root);
}
renderSiteHeader(initialLanguage());
