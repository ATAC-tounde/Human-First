/**
 * HUMAN FIRST shared site header.
 * Single source of truth for structure, logo, link order, translations and
 * responsive navigation on THINK / FOCUS / LEARN / DECIDE / JOURNEY / STUDIO.
 * The only persisted preference belongs to the existing language module.
 */
const PAGES=Object.freeze(['think','focus','learn','decide','journey','studio']);
const NAV=Object.freeze(['think','focus','learn','decide','journey','studio','method','commitments']);
const ROUTES=Object.freeze({
 think:'/',focus:'/focus',learn:'/learn',decide:'/decide',
 journey:'/journey',studio:'/studio',method:'/#method',commitments:'/#ethics'
});
const LABELS=Object.freeze({
 fr:Object.freeze({think:'THINK',focus:'FOCUS',learn:'LEARN',decide:'DECIDE',
 journey:'MON PARCOURS',studio:'STUDIO',method:'Notre méthode',
 commitments:'Nos engagements',brand:'INITIATIVE INDÉPENDANTE',
 navigation:'Navigation principale',home:'HUMAN FIRST, accueil',menu:'Menu',
 close:'Fermer le menu',toEnglish:'Passer en anglais',toFrench:'Passer en français'}),
 en:Object.freeze({think:'THINK',focus:'FOCUS',learn:'LEARN',decide:'DECIDE',
 journey:'MY JOURNEY',studio:'STUDIO',method:'Our method',
 commitments:'Our commitments',brand:'INDEPENDENT INITIATIVE',
 navigation:'Main navigation',home:'HUMAN FIRST, home',menu:'Menu',
 close:'Close menu',toEnglish:'Switch to English',toFrench:'Switch to French'})
});
const IDS=Object.freeze({
 think:{focus:'focus-nav-link',learn:'learn-nav-link',decide:'decide-nav-link',
  journey:'journey-nav-link',studio:'studio-nav-link',method:'nav-method',
  commitments:'nav-ethics',button:'language-switch',brand:'brand-link'},
 focus:{think:'back-home',button:'focus-language-switch'},
 learn:{think:'nav-think',focus:'nav-focus',decide:'nav-decide',
  journey:'nav-journey',button:'switch-lang'},
 decide:{think:'nav-think',focus:'nav-focus',learn:'nav-learn',
  journey:'nav-journey',button:'switch-lang'},
 journey:{think:'link-think',focus:'link-focus',learn:'link-learn',
  decide:'link-decide',studio:'link-studio',button:'lang'},
 studio:{button:'studio-language-switch'}
});
const FOCUS_LINKS={learn:'focus-learn-link',decide:'focus-decide-link',journey:'focus-journey-link'};
const onlyLanguage=lang=>lang==='en'?'en':'fr';
const targetUrl=(key,lang)=>{
 const route=ROUTES[key];
 const [path,hash='']=route.split('#');
 return path+'?lang='+lang+(hash?'#'+hash:'');
};
const linkTarget=(page,key,lang)=>{
 if(page==='think'&&key==='method')return '#method';
 if(page==='think'&&key==='commitments')return '#ethics';
 return targetUrl(key,lang);
};
/** A pure contract used by the UI and tests. */
export function headerModel(page='think',lang='fr'){
 if(!PAGES.includes(page))throw new TypeError('Unknown HUMAN FIRST page');
 const language=onlyLanguage(lang),words=LABELS[language];
 return Object.freeze({
  page,lang:language,brand:words.brand,logo:'HF',
  menu:words.menu,navigation:words.navigation,
  links:NAV.map(key=>Object.freeze({key,text:words[key],
   href:linkTarget(page,key,language),active:key===page,id:IDS[page]?.[key]||null})),
  languageButtonId:IDS[page].button,
  languageButtonText:language==='fr'?'EN':'FR'
 });
}
function linkFor(page,item,document){
 const link=document.createElement('a');
 link.className='hf-header__link'+(item.active?' is-current':'')+
  ((item.key==='method'||item.key==='commitments')?' hf-header__link--secondary':'');
 link.dataset.hfNavKey=item.key;
 link.href=item.href;
 if(item.id)link.id=item.id;
 if(page==='focus'&&FOCUS_LINKS[item.key])link.classList.add(FOCUS_LINKS[item.key]);
 if(page==='focus'&&item.key==='think'){
  const label=document.createElement('span');label.id='nav-back-label';label.textContent=item.text;link.append(label);
 }else{
  link.textContent=item.text;
 }
 if(item.active)link.setAttribute('aria-current','page');
 if(page==='journey'&&item.key==='journey')link.setAttribute('data-text','journeyNav');
 return link;
}
function applyLanguage(header,lang){
 if(!header)return;
 const model=headerModel(header.dataset.hfPage,lang);
 const words=LABELS[model.lang];
 const nav=header.querySelector('.hf-header__nav');
 nav.setAttribute('aria-label',model.navigation);
 const logo=header.querySelector('.hf-header__brand');
 logo.setAttribute('aria-label',words.home);
 logo.href=targetUrl('think',model.lang);
 header.querySelector('.hf-header__tagline').textContent=model.brand;
 for(const item of model.links){
  const link=header.querySelector('[data-hf-nav-key="'+item.key+'"]');
  if(!link)continue;
  link.href=item.href;
  if(item.key==='think'&&model.page==='focus'){
   link.querySelector('#nav-back-label').textContent=item.text;
  }else link.textContent=item.text;
 }
 const button=header.querySelector('.hf-header__lang');
 button.textContent=model.languageButtonText;
 button.setAttribute('aria-label',model.lang==='en'?words.toFrench:words.toEnglish);
 const toggle=header.querySelector('.hf-header__menu');
 const opened=toggle.getAttribute('aria-expanded')==='true';
 toggle.textContent=opened?words.close:words.menu;
 toggle.setAttribute('aria-label',opened?words.close:words.menu);
 header.dataset.hfLocale=model.lang;
}
export function refreshHeaderLanguage(lang,root=globalThis.document){
 const header=root?.querySelector?.('[data-hf-header][data-hf-page]');
 if(header)applyLanguage(header,lang);
}
export function mountHeader(page,lang='fr',root=globalThis.document){
 const header=root?.querySelector?.('[data-hf-header]');
 if(!header)throw new TypeError('Shared header root missing');
 if(header.dataset.hfMounted==='true'){
  refreshHeaderLanguage(lang,root);return header;
 }
 const model=headerModel(page,lang);
 header.className='hf-header';
 header.dataset.hfPage=page;
 const brand=root.createElement('a');
 brand.className='hf-header__brand';brand.href=targetUrl('think',model.lang);
 if(IDS[page].brand)brand.id=IDS[page].brand;
 brand.setAttribute('aria-label',LABELS[model.lang].home);
 const mark=root.createElement('span');
 mark.className='hf-header__mark';mark.setAttribute('aria-hidden','true');mark.textContent='HF';
 const copy=root.createElement('span');copy.className='hf-header__brand-copy';
 const name=root.createElement('span');name.className='hf-header__name';
 name.append(root.createTextNode('HUMAN '));
 const strong=root.createElement('strong');strong.textContent='FIRST';name.append(strong);
 const tagline=root.createElement('small');tagline.className='hf-header__tagline';tagline.textContent=model.brand;
 copy.append(name,tagline);brand.append(mark,copy);
 const right=root.createElement('div');right.className='hf-header__right';
 const nav=root.createElement('nav');nav.className='hf-header__nav';nav.id='hf-header-nav';
 nav.setAttribute('aria-label',model.navigation);
 for(const item of model.links)nav.append(linkFor(page,item,root));
 const tools=root.createElement('div');tools.className='hf-header__tools';
 const languageButton=root.createElement('button');
 languageButton.id=model.languageButtonId;languageButton.type='button';
 languageButton.className='hf-header__lang';languageButton.textContent=model.languageButtonText;
 languageButton.setAttribute('aria-label',model.lang==='en'?LABELS.en.toFrench:LABELS.fr.toEnglish);
 const toggle=root.createElement('button');toggle.className='hf-header__menu';
 toggle.id='hf-header-menu';toggle.type='button';
 toggle.setAttribute('aria-controls','hf-header-nav');toggle.setAttribute('aria-expanded','false');
 toggle.textContent=model.menu;toggle.setAttribute('aria-label',model.menu);
 tools.append(languageButton,toggle);right.append(nav,tools);
 header.replaceChildren(brand,right);
 header.dataset.hfMounted='true';header.dataset.hfLocale=model.lang;
 toggle.addEventListener('click',()=>{
  const open=toggle.getAttribute('aria-expanded')!=='true';
  toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);
  const words=LABELS[header.dataset.hfLocale];
  toggle.textContent=open?words.close:words.menu;
  toggle.setAttribute('aria-label',open?words.close:words.menu);
 });
 nav.addEventListener('click',event=>{
  const link=event.target.closest('a');
  if(!link)return;
  // Never reload an in-progress practice or unsaved Studio draft on the active link.
  if(link.getAttribute('aria-current')==='page')event.preventDefault();
  toggle.setAttribute('aria-expanded','false');nav.classList.remove('is-open');
  applyLanguage(header,header.dataset.hfLocale);
 });
 header.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){
   toggle.setAttribute('aria-expanded','false');nav.classList.remove('is-open');
   applyLanguage(header,header.dataset.hfLocale);toggle.focus();
  }
 });
 // Existing independent pages own their language switches. React after their
 // own translation pass rather than adding a second click handler.
 if(typeof MutationObserver!=='undefined'){
  const observer=new MutationObserver(()=>refreshHeaderLanguage(root.documentElement?.lang||model.lang,root));
  observer.observe(root.documentElement,{attributes:true,attributeFilter:['lang']});
 }
 return header;
}
