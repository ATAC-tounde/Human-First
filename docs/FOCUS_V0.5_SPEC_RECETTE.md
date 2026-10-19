# HUMAN FIRST · FOCUS V0.5 (alpha)

## Objective
Help an adult choose an intentional, simple, offline activity and return to a *voluntary* reflective dialogue with themselves. This is an **educational demonstration**, not treatment or a validated cognitive training programme.

## Functional scenarios
- `FC-01` A user sees six original activities with exactly three steps and three reflection prompts, in French or English.
- `FC-02` Choosing an activity opens the instructions and an *optional* intent textarea.
- `FC-03` A "leave the screen" action displays a departure prompt without a countdown, alarm, streak, or notification.
- `FC-04` A user may close the browser and never return, or voluntarily return to reflect without grading.
- `FC-05` Returning shows three reflection prompts and a private optional notes textarea.
- `FC-06` Finishing or cancelling clears both textareas and restores the original selection view; refresh also clears them.
- `FC-07` Language switch and keyboard access remain available throughout; the language choice appears in the URL, *not* browser storage.
- `FC-08` Only the instructions are printable. Neither intent nor reflection texts are included in printouts.
- `FC-09` The FOCUS route requires an adult declaration checkbox, but no user account, server-side age verification, session cookie, backend exercise state, or AI API.
- `FC-10` No network submission of notes, browser local/session storage, timers, notifications, app analytics, or engagement scores.

## Data protection
- No client-side calls to external providers. No data entered into FOCUS is persisted: textarea strings exist only in live browser DOM until refresh, navigation, exit, or explicit clearing.
- Requests for static page assets go to the host web server, which may receive conventional HTTP technical metadata (IP, user agent, access logs) from hosting infrastructure. Do not claim that no such server logs exist.
- All cards are deliberately public; unlike THINK's transfer evaluation, FOCUS has no hidden answers or grading.
- Do not use this feature as a diagnostic or claim that it increases concentration, cures dependence or improves IQ.

## Manual acceptance checklist
1. On local branch run `npm run check && npm start`; open `http://127.0.0.1:4173/focus` and `/focus?lang=en`.
2. Verify adult checkbox is required (declarative 18+), six buttons and instructions, language switch, task selection and back navigation.
3. Enter a sensitive **synthetic** string, start, return, finish; confirm both fields empty and not present after refresh/back.
4. Inspect browser Network: static GET assets only, no POST on the FOCUS page; verify that no notes appear in URL.
5. Check print preview excludes both note fields and includes only instructions.
6. Test keyboard Tab/Enter/Escape behavior, zoom 200%, mobile portrait, preferred reduced motion and a screen reader.
7. Test direct entry `/focus`, `/focus?lang=en` on Vercel Preview (may require Vercel Authentication).
8. No changes to `main` until local + preview checks accepted.

## Follow-up
Review all card texts for accessibility, cross-cultural clarity and age appropriateness. Later iterations may consider voluntary research protocols after ethics/legal review. Avoid adding digital attention timers or engagement rewards without a clear user benefit.

## Réintégration après la PR #12
Cette version est dérivée du `main` comportant **20 exercices THINK**, le moteur V0.4 de révision et les cartes V0.4.1. Elle **ne** reprend pas le serveur, l'interface THINK ou le catalogue de la branche intermédiaire historique. La route `/learn` n'est pas annoncée tant que LEARN V0.6 n'est pas réconcilié et fusionné.
