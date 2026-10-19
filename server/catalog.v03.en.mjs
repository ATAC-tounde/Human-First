// Independent English adaptations of V0.3 training examples, not validated research instruments.
export const newCurriculumEn = {
  "alarme": {
    "title": "An alarm, several causes",
    "category": "Logical reasoning",
    "level": "Exploration",
    "introduction": "Does an outcome prove its cause?",
    "prompt": "If a smoke detector detects smoke, the alarm sounds. The alarm is sounding. Can we conclude that the detector found smoke? Explain.",
    "guide": "Does the first sentence say smoke is the only possible cause of an alarm?",
    "hints": [
      "Imagine the alarm was triggered manually.",
      "Distinguish “if A, then B” from “if B, then A”. Are both statements equivalent?"
    ],
    "explanation": "No. The rule “detecting smoke implies an alarm” does not justify the converse. Other events could set off the alarm. Inferring a specific cause from its outcome is the logical error called affirming the consequent.",
    "transfer": "If a server fails, a page becomes unavailable. A page is unavailable. Does that prove the server failed? Why?",
    "review": [
      "Did you identify the direction of the implication?",
      "Did you consider alternative causes?",
      "Did you explain why an outcome does not establish its cause?"
    ],
    "example": "No. The page may also be unavailable because of network trouble or a mistyped address. The outcome alone cannot establish one specific cause.",
    "offlineChallenge": "On paper, invent two different causes that could explain the same event."
  },
  "quantificateurs": {
    "title": "Some, all, or none?",
    "category": "Logical reasoning",
    "level": "Exploration",
    "introduction": "Small words that change a conclusion.",
    "prompt": "At a workshop, at least one participant finished an exercise. Does that mean most participants finished? What information is missing?",
    "guide": "Does “at least one” tell us a proportion of the group?",
    "hints": [
      "The group might have 2 people or 200.",
      "To establish a majority, we need the total group size and the number who finished."
    ],
    "explanation": "No. “At least one” means one or more, not necessarily more than half. We need both the group size and the number of people who completed the exercise.",
    "transfer": "A survey says “some students use a calculator”. Can we conclude “almost all students use one”? Explain.",
    "review": [
      "Did you identify what “at least one” guarantees?",
      "Did you avoid inventing a proportion?",
      "Did you ask for the relevant counts?"
    ],
    "example": "No. “Some” gives no precise proportion. We need to know the number surveyed and the number who use a calculator.",
    "offlineChallenge": "Write three sentences in which replacing “some” with “all” changes the meaning."
  },
  "contre_exemple": {
    "title": "One counterexample is enough",
    "category": "Logical reasoning",
    "level": "Advanced",
    "introduction": "How can we refute a universal claim?",
    "prompt": "Someone says: “All odd numbers greater than 1 are prime.” Find a counterexample and explain why it is enough.",
    "guide": "Do you need to test every odd number to invalidate a statement about “all” numbers?",
    "hints": [
      "Look for an odd number that has a divisor other than 1 and itself.",
      "Nine is odd: what is 3 × 3?"
    ],
    "explanation": "Nine is odd and greater than 1, but it is not prime because 9 = 3 × 3. A single case satisfying the condition but contradicting the conclusion refutes a universal claim.",
    "transfer": "Someone says: “All even numbers greater than 2 are divisible by 4.” Give a counterexample and explain.",
    "review": [
      "Does your example satisfy the stated condition?",
      "Does it contradict the conclusion?",
      "Did you explain why one case is enough?"
    ],
    "example": "Six is even and greater than 2, but 6 is not divisible by 4. So the universal claim is false.",
    "offlineChallenge": "Pick a sentence containing “always” and invent a possible counterexample."
  },
  "sources": {
    "title": "Who claims it, on what evidence?",
    "category": "Critical thinking",
    "level": "Exploration",
    "introduction": "A compelling story is not the same as evidence.",
    "prompt": "An anonymous post claims “This method doubles memory in three days” without sources or a protocol. What would you check before believing it?",
    "guide": "Can you distinguish a promise from a measured outcome?",
    "hints": [
      "Identify the author, how “memory” was defined and how it was measured.",
      "Look for an independent study, a comparison group and reproducible findings."
    ],
    "explanation": "A remarkable claim is not evidence by itself. Check authorship, methods, sample size and selection, comparisons and independent evaluation. A lack of evidence does not prove the method cannot work: it limits what we can conclude.",
    "transfer": "A post claims “An app completely eliminates digital distraction” but provides no data. How would you evaluate that claim?",
    "review": [
      "Did you separate the claim from supporting evidence?",
      "Did you request independent sources?",
      "Did you avoid jumping to certainty in either direction?"
    ],
    "example": "I would look for predetermined measures and an independent controlled comparison. Without checkable data, I cannot confirm the promise or claim it is impossible.",
    "offlineChallenge": "Write three questions to ask whenever an advertisement makes an extraordinary promise."
  },
  "echelle": {
    "title": "When a chart exaggerates",
    "category": "Critical thinking",
    "level": "Advanced",
    "introduction": "Axis choices change how differences look.",
    "prompt": "A bar chart shows 100 sales in one month and 102 the next. Its vertical axis starts at 99 rather than 0, making the second bar appear three times as tall. What can we actually conclude?",
    "guide": "Separate the absolute difference, the percentage change and the visual effect of the axis.",
    "hints": [
      "The increase is 2 sales from a starting point of 100.",
      "A 2% increase can look enormous when a chart truncates the vertical axis."
    ],
    "explanation": "Sales rose by 2 units, or 2% compared with the original 100. A truncated axis can amplify the visual impression without changing the underlying data. Check axis labels, time period and context.",
    "transfer": "A chart rises from 1,000 to 1,005 visits but its vertical axis begins at 995. What is the relative change, and what could mislead a reader?",
    "review": [
      "Did you calculate the change using the right baseline?",
      "Did you check the vertical axis?",
      "Did you separate visual impression from underlying data?"
    ],
    "example": "The increase is 5 visits, or 0.5%. A truncated axis can make that change appear much bigger than it really is.",
    "offlineChallenge": "Draw the same data in two charts, one with a zero baseline and another with a truncated axis. Compare how they look."
  },
  "billets": {
    "title": "Choose the better fare",
    "category": "Problem solving",
    "level": "Introduction",
    "introduction": "Compare options before choosing.",
    "prompt": "You plan to take 6 trips. One ticket costs €2.40, while a book of 10 tickets costs €18. Which choice is cheaper if unused tickets are not refunded? Explain your calculation.",
    "guide": "What is the total cost of each option?",
    "hints": [
      "Multiply 6 by €2.40 for single tickets.",
      "Compare that total with the fixed €18 price. A ticket book is not always cheaper."
    ],
    "explanation": "Six single tickets cost 6 × €2.40 = €14.40. The book costs €18, so buying single tickets saves €3.60 for exactly six trips. Different travel habits might change the choice.",
    "transfer": "Now you plan 9 trips with the same fares: €2.40 for one ticket and €18 for a book of 10. Which do you choose and why?",
    "review": [
      "Did you identify the number of trips?",
      "Did you compare total costs rather than unit prices?",
      "Did you justify the choice with numbers?"
    ],
    "example": "Nine single tickets cost €21.60. The book costs €18, saving €3.60.",
    "offlineChallenge": "Compare two transport or subscription offers on paper."
  },
  "dependances": {
    "title": "Plan without rushing",
    "category": "Problem solving",
    "level": "Exploration",
    "introduction": "Good plans respect dependencies.",
    "prompt": "To publish an information sheet, you must draft text (20 min), fact-check it (15 min, after drafting) and choose an illustration (10 min, independent). Plan the work so dependencies are respected and waiting is reduced.",
    "guide": "What can start immediately, and what must wait?",
    "hints": [
      "Fact-checking depends on writing; selecting the illustration does not.",
      "Two people can work in parallel. With only one person, tasks still require separate work time."
    ],
    "explanation": "Fact-checking must follow drafting. Illustration selection is independent and can run in parallel if another person is available. One person needs at least 45 minutes of work (20 + 15 + 10). With two people, elapsed time can be shorter.",
    "transfer": "A team must prepare a presentation (25 min), review it (10 min after preparation) and check equipment (5 min, independent). Plan the work with two people.",
    "review": [
      "Did you identify the required dependency?",
      "Did you find a task that can run independently?",
      "Did you distinguish work duration from elapsed time?"
    ],
    "example": "One person prepares the presentation for 25 minutes and reviews it for 10. The second checks equipment during the first 5 minutes. Minimum elapsed time is 35 minutes.",
    "offlineChallenge": "Write three real tasks for your day and connect their dependencies with arrows."
  },
  "temps": {
    "title": "Improve within a limit",
    "category": "Problem solving",
    "level": "Advanced",
    "introduction": "Optimise rather than guess.",
    "prompt": "You have 60 minutes to read separate reports. Type A: 12 pages in 45 minutes. Type B: 7 pages in 30 minutes. You may choose multiple whole reports of either type, without interruption. Which option maximises pages read?",
    "guide": "Which combinations of whole reports fit within 60 minutes?",
    "hints": [
      "45 + 30 minutes exceeds your time budget.",
      "Two type-B reports take exactly 60 minutes and give 14 pages."
    ],
    "explanation": "In 60 minutes, you could read one A report (12 pages) or two B reports (14 pages). A + B takes too long. Two B reports give the most pages at 14, assuming reports are comparable and available.",
    "transfer": "You have 60 minutes. One type-C report takes 40 minutes for 9 pages; type D takes 20 minutes for 5 pages. Enough reports are available. What option gives the most pages?",
    "review": [
      "Did you respect the time limit?",
      "Did you compare different combinations?",
      "Did you state important assumptions?"
    ],
    "example": "Three D reports take 60 minutes and give 15 pages. One C plus one D gives 14, and one C alone gives 9. Three D is best for this criterion.",
    "offlineChallenge": "Plan a 45-minute block between several small tasks on paper, explaining your priorities."
  },
  "diagnostic": {
    "title": "Investigate before acting",
    "category": "Problem solving",
    "level": "Exploration",
    "introduction": "Test one explanation at a time.",
    "prompt": "An app sometimes closes unexpectedly on a phone. How would you investigate the cause instead of reinstalling it immediately?",
    "guide": "How could you reproduce the issue while changing one factor at a time?",
    "hints": [
      "Record when it happens: action, time, network, app version and any error messages.",
      "Change one variable between attempts so you can compare outcomes."
    ],
    "explanation": "A careful investigation describes the symptoms, tries to reproduce the issue, examines available information and tests hypotheses one by one. This avoids attributing failure to an untested cause and limits unnecessary changes.",
    "transfer": "A printer sometimes produces blank pages. Propose three ordered checks that could distinguish a document, cartridge or configuration problem.",
    "review": [
      "Did you distinguish symptom from cause?",
      "Did you propose checks that could be tested?",
      "Did you avoid changing many settings at once?"
    ],
    "example": "I would first inspect the document preview, then print a test page, then check cartridge levels and settings. I would record each outcome.",
    "offlineChallenge": "Pick a non-urgent problem and write three different possible explanations."
  },
  "reformuler": {
    "title": "Explain without copying",
    "category": "Understanding and memory",
    "level": "Introduction",
    "introduction": "Understanding means being able to paraphrase.",
    "prompt": "Read this idea: “One example illustrates a rule but does not prove it in every case.” Without copying it word for word, explain what it means and give an example.",
    "guide": "Is one example sufficient to establish a claim about “all” cases?",
    "hints": [
      "Compare “I saw this happen once” with “this always happens”.",
      "Seeing one black cat does not prove all cats are black."
    ],
    "explanation": "An example may make a rule concrete but cannot establish a universal generalisation by itself. Explaining it in your own words and giving a fresh example helps explore what you understood.",
    "transfer": "Explain in your own words: “An average summarises a group but does not necessarily describe any individual.” Give a new example.",
    "review": [
      "Did you use your own words?",
      "Does your example illustrate the principle?",
      "Did you avoid an overly broad generalisation?"
    ],
    "example": "If three people walk 1, 2 and 9 km, the average is 4 km. Yet none of them actually walked exactly 4 km.",
    "offlineChallenge": "Read a paragraph from a book, close it and explain it aloud in one minute."
  },
  "rappel": {
    "title": "Recall without rereading",
    "category": "Understanding and memory",
    "level": "Exploration",
    "introduction": "Try recalling rather than only rereading.",
    "prompt": "Read once: “A hypothesis is an explanation to test. An observation is information gathered. A conclusion must reflect the results and their limits.” Then use “Hide challenge” and explain each role from memory without copying.",
    "guide": "What are the three steps: propose, observe, conclude?",
    "hints": [
      "A hypothesis is not already proof.",
      "An observation can contradict a hypothesis; a conclusion should acknowledge that."
    ],
    "explanation": "A hypothesis proposes a testable explanation. Observations supply evidence. Conclusions interpret that evidence while respecting its limits. This activity uses immediate recall, not a validated measure of long-term memory.",
    "transfer": "Without quoting definitions: explain the difference between a research question, an observed result and an interpretation.",
    "review": [
      "Did you distinguish proposal from proof?",
      "Did you describe what observations do?",
      "Did you mention limits on conclusions?"
    ],
    "example": "The question says what we want to know, observations describe what was found and the interpretation offers an explanation without going beyond the data.",
    "offlineChallenge": "After reading something, close it and write three things you remember before opening it again."
  },
  "principe": {
    "title": "One idea, a new context",
    "category": "Understanding and memory",
    "level": "Exploration",
    "introduction": "Transfer a principle to a different situation.",
    "prompt": "Rule: “In an ordinary queue, the first person to arrive is served first.” Explain the rule and describe a different context where it could apply.",
    "guide": "What does “first come, first served” mean?",
    "hints": [
      "Imagine requests waiting for their turn.",
      "For example, print jobs may be processed in order of arrival unless an explicit priority applies."
    ],
    "explanation": "The principle describes a queue, often called FIFO (“first in, first out”). It can apply to people, documents or tasks. Some situations justify different priorities, so the context matters.",
    "transfer": "At a library, reservation requests are handled in arrival order. Explain one advantage and one potential limit of that rule.",
    "review": [
      "Did you identify the shared principle?",
      "Did you choose a relevant new context?",
      "Did you consider limits to the principle?"
    ],
    "example": "Arrival order is transparent and predictable. But emergencies or accessibility needs may justify clearly defined exceptions.",
    "offlineChallenge": "Notice a rule used around you and explain another situation where it would help."
  },
  "incertitude": {
    "title": "Know what you do not know",
    "category": "Understanding and memory",
    "level": "Advanced",
    "introduction": "Reflect on how sure you really are.",
    "prompt": "You read an AI-generated answer and feel “almost certain” it is correct, but you cannot explain why. How could you check whether you really understand it?",
    "guide": "Does feeling confident mean you can justify an answer?",
    "hints": [
      "Try to reconstruct the reasoning without looking at the answer.",
      "Seek a new example, a possible objection and an independent source."
    ],
    "explanation": "Feeling confident is not enough to demonstrate understanding. You can explain from memory, solve a new case, identify limits and compare your reasoning with checkable sources. This exercise does not diagnose “AI dependence”.",
    "transfer": "A friend says they have mastered a topic because they recognise every answer in a multiple-choice quiz. Suggest a different, respectful way to check understanding.",
    "review": [
      "Did you distinguish confidence from justification?",
      "Did you suggest an independent check?",
      "Did you keep your approach respectful and non-judgemental?"
    ],
    "example": "I would invite them to explain without answer options, then solve a new problem. We could compare the reasoning without judging the person.",
    "offlineChallenge": "Before asking an AI a question, write what you know, what you assume and what needs checking."
  },
  "negation": {
    "title": "Reasoning backwards",
    "category": "Logical reasoning",
    "level": "Advanced",
    "introduction": "Recognise a valid deduction.",
    "prompt": "In a workshop, every approved card carries a blue symbol. The card in front of you has no blue symbol. Can you conclude it was not approved? Explain your assumptions.",
    "guide": "If every approved card must be blue, could a card without blue be approved without contradicting the rule?",
    "hints": [
      "Translate the rule as “if approved, then blue symbol”.",
      "This is not “blue symbol, therefore approved”: it is the absence of a required consequence."
    ],
    "explanation": "Yes, if the rule is universal and accurate: every approved card must have the symbol. Its absence rules out approval. This is reasoning with the contrapositive. The conclusion depends on the reliability of the rule.",
    "transfer": "All genuine tickets for an event carry a number. A ticket has no number. What follows if there are no exceptions to this rule?",
    "review": [
      "Did you identify the initial rule?",
      "Did you distinguish an absent consequence from a present consequence?",
      "Did you state that the rule must be reliable and exception-free?"
    ],
    "example": "If every genuine ticket must be numbered and the rule has no exceptions, an unnumbered ticket cannot be genuine under that rule.",
    "offlineChallenge": "Write an “if A then B” rule and investigate what the absence of B lets you conclude."
  },
  "alertes": {
    "title": "What do alerts measure?",
    "category": "Critical thinking",
    "level": "Exploration",
    "introduction": "Do not confuse precision with coverage.",
    "prompt": "Software flags 10 messages as suspicious. Independent review finds that 2 of them were actually fraudulent. Can you determine the fraction of all fraudulent messages the software detected? Explain.",
    "guide": "Do you know how many fraudulent messages were never flagged?",
    "hints": [
      "You know that 2 of the 10 alerts were justified.",
      "To measure how many frauds were detected, you also need the number of missed frauds."
    ],
    "explanation": "You can calculate the proportion of justified alerts in this sample: 2/10 = 20%. You cannot determine the fraction of all frauds detected without knowing the number of missed frauds. These are different metrics.",
    "transfer": "A tool flags 20 documents as erroneous, and 5 really contain errors. What can you calculate, and what else is needed to measure all errors detected?",
    "review": [
      "Did you calculate the proportion among flagged cases?",
      "Did you identify potentially missed cases?",
      "Did you avoid confusing two measures?"
    ],
    "example": "The proportion of justified alerts is 5/20 = 25%. We do not know the detection rate for all errors without counting unflagged errors too.",
    "offlineChallenge": "Whenever someone reports a metric, write down the denominator and what the metric does not measure."
  },
  "criteres": {
    "title": "Best according to whom?",
    "category": "Problem solving",
    "level": "Exploration",
    "introduction": "Decisions depend on the criteria.",
    "prompt": "Two services deliver the same parcel: A costs €8 and takes 5 days; B costs €15 and takes 1 day. Without more information, can you say which is better? Suggest two decision criteria.",
    "guide": "Which service would you choose if the parcel is urgent? What if it is not?",
    "hints": [
      "Define the priority: reducing cost or reducing delay.",
      "The same option need not be best for everyone."
    ],
    "explanation": "There is no universally best option without context. A minimises cost, while B minimises delivery time. A reasoned choice states the criteria, their importance and the actual constraints.",
    "transfer": "Two computers can handle a job: one costs €400 and weighs 2.5 kg; the other costs €550 and weighs 1.2 kg. How would you choose if you travel often?",
    "review": [
      "Did you state the decision criteria?",
      "Did you distinguish constraints from preferences?",
      "Did you avoid assuming one option is best in every situation?"
    ],
    "example": "If I travel a lot, I might choose the lighter computer if €550 fits my budget. If the budget limit is €450, the first computer is the only feasible option.",
    "offlineChallenge": "Compare two real options using three criteria that matter to you."
  },
  "espacement": {
    "title": "Review without staying online",
    "category": "Understanding and memory",
    "level": "Exploration",
    "introduction": "Plan off-screen recall without chasing streaks.",
    "prompt": "You just learned a new idea. Instead of rereading it ten times today, suggest a short plan to check your recall without help over several days. How would you identify what is still difficult?",
    "guide": "How can you check recall after some time without looking at the answer?",
    "hints": [
      "Plan one attempt today and another after one or more days.",
      "After each attempt, compare with reliable material, identify gaps and adjust your next check."
    ],
    "explanation": "You can plan brief, spaced attempts to retrieve information without help, then compare with a reliable source. Timing depends on context and personal needs. This activity suggests a method; it does not measure delayed memory.",
    "transfer": "You are learning two similar concepts and sometimes confuse them. Design a paper schedule for two later recall checks and a way to tell them apart.",
    "review": [
      "Did you plan unaided recall attempts?",
      "Did you plan to check your answers after each attempt?",
      "Can the schedule be adjusted without penalty?"
    ],
    "example": "I write two distinct questions on paper. I answer without notes in two days and again a few days later. I check against definitions and revisit only what I mixed up.",
    "offlineChallenge": "Plan two future paper-based checks, with no mandatory digital reminder or penalty if your plans change."
  }
};