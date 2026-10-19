// English translations of DEMONSTRATION exercises, not independently validated study materials.
export const englishExercises = {
  causalite: {
    title:'Cause or coincidence?', category:'Critical thinking', level:'Introduction',
    introduction:'Does observing an event prove what caused it?',
    prompt:'In a town, students’ average grades improved after new study spaces were built. Can we conclude that the spaces caused the improvement? Explain your reasoning.',
    guide:'What information would help you tell correlation from causation?',
    hints:['Imagine that something else changed at the same time.','Which comparison group would be useful? What might have happened without the study spaces?'],
    explanation:'No. One event happening after another does not establish a causal relationship. Teaching methods, class composition or available resources may also have changed. We would need more data and a rigorous comparison.',
    transfer:'After a library opens, university enrolment increases in a town. Does that prove the library caused the increase? Explain and suggest a way to check.',
    review:['Did you distinguish correlation from causation?','Did you consider alternative explanations?','Did you propose a comparison or identify additional data?'],
    example:'We cannot conclude causality from this observation alone. Other factors may have changed at the same time. I would compare the trend with similar towns before and after the opening.'
  },
  deduction: {
    title:'Does it really follow?', category:'Logical reasoning', level:'Introduction',
    introduction:'Does a plausible conclusion necessarily follow from the premises?',
    prompt:'All bicycles are vehicles. Some vehicles are red. Can we conclude that some bicycles are red? Explain why.',
    guide:'What exactly does “some” mean in the second statement?',
    hints:['Could the red vehicles all be cars?','Build an example in which both statements are true but no bicycle is red.'],
    explanation:'No. Bicycles belong to the category of vehicles, but the red vehicles could be from a different category. The conclusion would require information linking bicycles specifically to the colour red.',
    transfer:'All cats are mammals. Some mammals live in water. Can we conclude that some cats live in water? Explain.',
    review:['Did you avoid conclusions that go beyond the premises?','Did you distinguish “all” from “some”?','Did you give a counterexample or describe the missing link?'],
    example:'No. The mammals that live in water could all be dolphins or whales. The premises never connect cats to that property.'
  },
  moyenne: {
    title:'What an average hides', category:'Data interpretation', level:'Introduction',
    introduction:'Does an average describe every person in a group?',
    prompt:'A class average increases from 12/20 to 14/20 between two tests. Can we say every student improved? Why or why not?',
    guide:'Does an average describe each student or the group as a whole?',
    hints:['Could some students improve substantially while others get worse?','What individual-level data would you need to establish that everyone improved?'],
    explanation:'No. An average can rise even if some students’ scores stay the same or fall. To see whether everyone improved, we would need to compare the scores of each student on both tests and consider differences between the tests.',
    transfer:'The average commute at a company drops from 40 to 30 minutes. Does that mean every employee saves time? Explain what data would help.',
    review:['Did you distinguish the group average from individual values?','Did you consider different patterns across people?','Did you identify the data needed to justify a conclusion?'],
    example:'No. A lower average does not mean everyone has a shorter commute. We would need paired before-and-after times for each employee and to check the groups were comparable.'
  }
};
