// UI translations are static and owned by the project. Never insert user content as HTML.
const englishSelectors = {
  '.skip-link':'Skip to content',
  '.brand-text small':'INDEPENDENT INITIATIVE',
  '#nav-method':'Our method',
  '#nav-ethics':'Our commitments',
  '.hero-copy>.eyebrow':'<span class="little-star" aria-hidden="true">✳</span> A DIFFERENT VISION OF ARTIFICIAL INTELLIGENCE',
  '#hero-title':'Before the answer,<br><em>your thinking.</em>',
  '.hero-intro':'What if the best AI helped you think <strong>for yourself</strong>? Discover a different way to learn: attempt first, understand next.',
  '#discover-button':'Choose a challenge <span aria-hidden="true">↗</span>',
  '.hero-actions>.button-ghost':'Explore the method <span aria-hidden="true">↓</span>',
  '.hero-notes':'<span><span class="tick">✓</span> No account</span><span><span class="tick">✓</span> No ads</span><span><span class="tick">✓</span> Free</span>',
  '.art-caption-top':'CURIOSITY <span>→</span> AUTONOMY',
  '.center-core':'<span>I</span><strong>THINK</strong>',
  '.art-caption-bottom':'<span>01 / 03</span> THINKING IN MOTION',
  '#exercises .eyebrow':'START HERE',
  '#challenge-title':'One small challenge.<br><em>One big difference.</em>',
  '#exercises .section-heading>p':'Choose an exercise and go at your own pace. No public scores, no competition: just the pleasure of exploring.',
  '.age-check>span':'I confirm that I am 18 or older.',
  '.age-note':'This demo is for adults. We do not ask for your identity.',
  '#method .eyebrow':'THE HEART OF THE METHOD',
  '#method-title':'The answer is<br><em>not the starting point.</em>',
  '.method-grid article:nth-child(1) h3':'You try',
  '.method-grid article:nth-child(1) p':'Write down your ideas, even imperfect ones. You can also skip if you wish.',
  '.method-grid article:nth-child(2) h3':'We guide',
  '.method-grid article:nth-child(2) p':'Questions and clues help you without immediately giving away the answer.',
  '.method-grid article:nth-child(3) h3':'You check',
  '.method-grid article:nth-child(3) p':'Apply what you learned to a different problem, without help.',
  '#ethics .eyebrow':'OUR COMMITMENT',
  '#ethics-title':'Success is what you can do<br><em>after closing the app.</em>',
  '#ethics p:not(.eyebrow)':'No leaderboards, no streaks to maintain and no prompts to stay online. This prototype does not measure IQ, addiction or scientifically proven cognitive improvement.',
  '#quit-button':'← Leave the exercise',
  '#prompt-card .prompt-label':'THE CHALLENGE',
  '#training-view .field-label':'Your reasoning (even if incomplete)',
  '#training-view .field-hint':'There is no grade to earn. Trying is what matters.',
  '#attempt-button':'Submit my attempt <span aria-hidden="true">↗</span>',
  '#skip-button':'I don’t know / skip',
  '#explanation-button':'See explanation',
  '#direct-button':'Go directly to the explanation ↗',
  '#explanation-view .prompt-label':'REFERENCE EXPLANATION',
  '#explanation-view .compassion-note':'Read this explanation as often as you need. This is not a competition.',
  '#transfer-button':'Try a new problem without help <span aria-hidden="true">↗</span>',
  '#transfer-view .field-label':'Your independent answer',
  '#transfer-view .field-hint':'No clues at this stage. You can skip if you are stuck.',
  '#submit-transfer':'See my reflection <span aria-hidden="true">↗</span>',
  '#skip-transfer':'Skip without answering',
  '.result-intro':'Thank you for taking the time to think. Here are questions to review your reasoning, not an automatic grade.',
  '#finished-question-label':'INDEPENDENT PROBLEM',
  '#finished-own-label':'MY ANSWER',
  '#print-button':'Print my reflection sheet',
  '#finished-view>.review-box:nth-child(3) .prompt-label':'QUESTIONS TO REFLECT ON',
  '.answer-box .prompt-label':'EXAMPLE REASONING',
  '.offscreen-box strong':'And now, away from the screen?',
  '.offscreen-box p':'Grab a sheet of paper and think of a personal example where this idea might be useful.',
  '#done-button':'Finish my session <span aria-hidden="true">↗</span>',
  '.workspace-aside>.eyebrow':'A REMINDER',
  '.workspace-aside h3':'The right<br>to explore.',
  '.workspace-aside p:not(.eyebrow):not(.aside-small)':'An imperfect attempt is not a failure. It is often the beginning of understanding.',
  '.workspace-aside .aside-small':'This is a teaching demonstration, not a scientific assessment or data collection for research.',
  '.footer-brand span':'Learning to think for ourselves, together.',
  '.site-footer>p:nth-child(2)':'Experimental demo · 18+ · No account · No analytics tracking',
  '.footer-right':'Made for people, not for screen time. <span>© 2026 HUMAN FIRST</span>'
};
const englishAttributes = {
  '#brand-link': {'aria-label':'HUMAN FIRST, back to home'},
  '.hero-art': {'aria-label':'Abstract illustration of an idea surrounded by different paths of thought'},
  '.nav': {'aria-label':'Main navigation'},
  '.workspace-progress': {'aria-label':'Session progress'},
  '#attempt': {'placeholder':'My first thought is… because…'},
  '#transfer-answer': {'placeholder':'I conclude that… because…'}
};
const originals = new Map();
const attributeOriginals = new Map();
export function applyLocale(locale){
  const en=locale==='en'; document.documentElement.lang=en?'en':'fr';
  for (const [selector,translated] of Object.entries(englishSelectors)) {
    const el=document.querySelector(selector); if(!el)continue;
    if(!originals.has(selector))originals.set(selector,el.innerHTML);
    el.innerHTML=en?translated:originals.get(selector);
  }
  for(const [selector,attrs] of Object.entries(englishAttributes)) {
    const el=document.querySelector(selector);if(!el)continue;
    for(const [key,translated] of Object.entries(attrs)){
      const k=`${selector}|${key}`;if(!attributeOriginals.has(k))attributeOriginals.set(k,el.getAttribute(key));
      el.setAttribute(key,en?translated:attributeOriginals.get(k));
    }
  }
}
const words={
  fr:{challenge:'DÉFI',start:'Commencer',minutes:'min',loading:'Chargement des défis…',adult:'Confirme d’abord que tu as 18 ans ou plus pour accéder à la démonstration.',loadError:'Impossible de charger la démonstration',generalError:'Une erreur est survenue.',invalidResponse:'Réponse serveur indisponible.',
    phases:{training:'1 SUR 4 · J’ESSAIE',explanation:'2 SUR 4 · JE COMPRENDS',transfer:'3 SUR 4 · JE VÉRIFIE',finished:'4 SUR 4 · JE TERMINE'},
    headings:{training:'À toi de réfléchir.',explanation:'Comprendre, pas mémoriser.',transfer:'À toi, sans assistance.',finished:'Ce que tu emportes.'},
    leads:{training:'Observe, questionne et formule une première idée. Il n’y a aucune pression à réussir.',explanation:'Voici une explication rédigée à l’avance. Prends le temps d’en comprendre les raisons.',transfer:'Un problème différent pour vérifier ce que tu as compris. Aucune piste ni aide ne sera affichée.',finished:'L’important est ce que tu retiens, pas le temps que tu as passé ici.'},
    reasoning:'RAISONNEMENT',attemptPrefix:'Ta première idée : ',skippedIntro:'Tu as choisi de passer. Tu peux découvrir des indices à ton rythme.',guidance:'QUESTION DE GUIDAGE',hint:'INDICE',allHints:'Tous les indices ont été révélés',receiveHint:'Recevoir un indice ↗',summaryDone:'Ta réponse a été enregistrée uniquement pour cette session éphémère.',summarySkip:'Tu as choisi de passer le transfert.',noGrade:'Aucune note automatique n’est calculée.',hintCount:'indice(s) consulté(s).',networkLost:'Connexion interrompue : reconnecte-toi pour recevoir le prochain indice.'},
  en:{challenge:'CHALLENGE',start:'Start',minutes:'min',loading:'Loading challenges…',adult:'Please confirm that you are 18 or older to access this demo.',loadError:'Cannot load the demo',generalError:'Something went wrong.',invalidResponse:'Server response is unavailable.',
    phases:{training:'1 OF 4 · I TRY',explanation:'2 OF 4 · I UNDERSTAND',transfer:'3 OF 4 · I CHECK',finished:'4 OF 4 · I FINISH'},
    headings:{training:'Your turn to think.',explanation:'Understand, don’t just memorise.',transfer:'Your turn, without help.',finished:'What you take away.'},
    leads:{training:'Observe, question and share a first idea. There is no pressure to get it right.',explanation:'Here is an explanation prepared in advance. Take time to understand the reasoning.',transfer:'A different problem to check your understanding. No clues or help will be shown.',finished:'What matters is what you can do after leaving this app.'},
    reasoning:'REASONING',attemptPrefix:'Your first idea: ',skippedIntro:'You chose to skip. Explore clues at your own pace.',guidance:'GUIDING QUESTION',hint:'CLUE',allHints:'All clues have been revealed',receiveHint:'Get a clue ↗',summaryDone:'Your answer was kept only in this temporary session.',summarySkip:'You chose to skip the independent task.',noGrade:'No automatic score is calculated.',hintCount:'clue(s) used.',networkLost:'Connection lost: reconnect to request the next clue.'}
};
export function word(locale,key){return words[locale==='en'?'en':'fr'][key];}
