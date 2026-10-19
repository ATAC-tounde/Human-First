// V0.3 bilingual demonstration copy; pedagogical review is pending.
export const englishPedagogicalExercises = {
 source:{
  title:'A viral claim',category:'Critical thinking',level:'Exploration',
  introduction:'Check an eye-catching claim before sharing it.',
  prompt:'A post says “9 out of 10 people learn better by watching short videos.” It names no study, date or method. What would you check before believing or sharing it?',
  guide:'Who produced this claim, and how might the data have been gathered?',
  hints:['Look for sample size, selection and the definition of “learn better”.','What independent evidence would compare immediate performance with delayed learning?'],
  explanation:'An isolated percentage is not proof. Seek the primary source, methodology, population and learning measures. Enjoyment and viewing time are not the same as durable recall. Withhold judgment when this information is missing.',
  transfer:'A poster says “80% of users become more focused with our app.” With no further details, what would you ask to evaluate the promise?',
  review:['Did you ask for the source and method?','Did you distinguish testimonials from measured evidence?','Did you refrain from overclaiming?'],
  example:'I would ask who was tested, for how long, with which focus measure and comparison group, and whether the result was independently checked.'
 },
 planification:{
  title:'Choose a strategy',category:'Problem solving',level:'Exploration',
  introduction:'Plan thoughtfully with a deadline and several competing demands.',
  prompt:'You have 90 minutes to prepare for a test. You need to review three chapters, practise problem solving and rest. Describe a realistic plan and explain your priorities.',
  guide:'Which activities show what you can actually do, rather than creating a feeling of familiarity?',
  hints:['Identify your weakest topics first and estimate the time needed.','Include an exercise without notes and time to inspect errors or take a break.'],
  explanation:'There is no universally optimal schedule. A defensible strategy combines identifying gaps, actively retrieving ideas and targeted practice, with time to correct errors. The key is aligning the plan with the goal and checking the result.',
  transfer:'You have 45 minutes to prepare a five-minute talk on a new topic. How would you allocate the time without having AI write the whole talk?',
  review:['Did you set a checkable goal?','Did you justify priorities within the deadline?','Did you leave time to test your result independently?'],
  example:'I would learn the topic, identify three main points, draft a simple structure and rehearse aloud without notes to find gaps.'
 },
 contreexemple:{
  title:'One counterexample',category:'Logical reasoning',level:'Introduction',
  introduction:'Challenge an absolute statement instead of repeating it.',
  prompt:'A classmate says “Every student who uses AI gets better grades.” How could you logically challenge this sentence without claiming to know everyone’s results?',
  guide:'What observation would be enough to refute the word “every”?',
  hints:['Compare “every” with “some”: one claim is much stronger.','Imagine a student who uses AI but does not improve. What could that example establish?'],
  explanation:'One well-established real counterexample refutes a universal statement. An imagined counterexample can show that a conclusion is not logically necessary, but does not prove that the example exists in real life. Separate logical possibility from observation.',
  transfer:'Someone says “All online courses are less effective than classroom courses.” What observation would challenge that? What qualification would you keep?',
  review:['Did you identify the universal quantifier?','Did you separate hypothetical cases from observations?','Did you avoid replacing one sweeping generalisation with another?'],
  example:'One online course outperforming an equivalent classroom course on a comparable measure would challenge “all”. It would not show that all online courses are better.'
 },
 probabilites:{
  title:'The percentage trap',category:'Data interpretation',level:'Exploration',
  introduction:'Learn how a dramatic-looking metric can mislead.',
  prompt:'A tool detects 90% of fraudulent messages but also wrongly flags 10% of legitimate messages. Only 10 in 1,000 messages are truly fraudulent. Should most alerts be trusted? Explain with simple counts.',
  guide:'Out of 1,000 messages, how many are fraudulent and how many are legitimate?',
  hints:['Of 10 fraudulent messages, about 9 are flagged. Of 990 legitimate messages, about 99 are wrongly flagged.','Compare the 9 true alerts with the 99 false ones. What share of alerts is correct?'],
  explanation:'Using these approximate figures, 9 true alerts and 99 false alerts give 108 alerts in total. Only 9 of the 108 (about 8%) correspond to fraud. The initial prevalence, or base rate, matters when interpreting a test.',
  transfer:'A check finds 80% of faulty objects but also flags 20% of good ones. In a batch of 100 with 5 faulty objects, estimate true and false alerts and explain why totals matter.',
  review:['Did you calculate the size of each initial group?','Did you distinguish false alarms from true detections?','Did you account for the base rate?'],
  example:'Of 5 faulty items, about 4 are true alerts; of 95 good items, about 19 are false alerts. Of about 23 alerts, only 4 indicate a fault.'
 },
 rappel:{
  title:'Understand without rereading',category:'Durable learning',level:'Introduction',
  introduction:'Practise recalling an idea instead of repeatedly looking at it.',
  prompt:'You have just learned the difference between correlation and causation. Without looking at notes, explain that difference and invent an original example.',
  guide:'What can we observe without yet knowing why it happened?',
  hints:['Correlation describes variables changing together; causation proposes that one factor affects another.','Look for a third variable that could explain both phenomena in your example.'],
  explanation:'Putting an idea into your own words can reveal what you understand and where uncertainty remains. Correlation does not necessarily imply causation: a hidden variable, chance or reverse causality can explain an association. One exercise does not prove long-term memory gains.',
  transfer:'Without rereading the explanation, give a fresh example of two things changing together without necessarily having a direct causal link.',
  review:['Did you explain the distinction in your own words?','Is your example genuinely different from the first?','Did you mention another possible explanation?'],
  example:'Ice-cream sales and swimming both increase during hot weather. Heat may explain both patterns; buying ice cream does not itself cause swimming.'
 },
 decision:{
  title:'Decide, do not blindly follow',category:'Independent judgment',level:'Exploration',
  introduction:'Identify your own criteria before listening to algorithmic advice.',
  prompt:'You are choosing between two revision apps. App A sends frequent notifications and offers many exercises. App B has fewer features, works offline and does not collect your answers. How would you choose without delegating the decision to an AI ranking?',
  guide:'Which criteria matter to you, and why: attention, privacy, access or learning outcomes?',
  hints:['Rank your top three priorities; note what you know and what you still need to check.','Consider short trials with an independent check: what can you recall unaided afterward?'],
  explanation:'Independent decisions start with explicit goals, weighted criteria and an assessment of missing information. Recommendations may help but do not replace personal preferences or evidence checking. Different users may reasonably choose different apps.',
  transfer:'AI recommends a free service that retains your data. Another service is paid and minimises collection. What questions and criteria would inform your choice?',
  review:['Did you use your own criteria rather than accept the recommendation?','Did you consider uncertainty and trade-offs?','Did you plan how to check the outcome afterward?'],
  example:'I would compare real cost, collected data, export options and service quality, check the privacy policy and trial the service for a limited period.'
 }
};
