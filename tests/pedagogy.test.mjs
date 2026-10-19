import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalog, publicCatalog, publicTraining, getExercise, localizeExercise} from '../server/catalog.mjs';

test('V0.3 : neuf exercices avec identifiants uniques et quatre domaines',()=>{
  assert.equal(catalog.length,9);
  assert.equal(new Set(catalog.map(x=>x.id)).size,9);
  const domains=new Set(catalog.map(x=>x.category));
  for(const category of ['Esprit critique','Raisonnement logique','Résolution de problèmes','Apprentissage durable','Autonomie décisionnelle']) assert.ok(domains.has(category));
});

test('V0.3 : chaque exercice complet dispose de trois indices et transfert distinct FR/EN',()=>{
  for(const x of catalog){
    for(const locale of ['fr','en']){
      const localized=localizeExercise(x,locale);
      for(const field of ['id','title','category','level','introduction','prompt','guide','explanation','transfer','example']) {
        assert.ok(typeof localized[field]==='string' && localized[field].trim().length>8,`${x.id}:${locale}:${field}`);
      }
      assert.equal(localized.hints.length,2,`${x.id}:${locale}:hints`);
      assert.equal(localized.review.length,3,`${x.id}:${locale}:review`);
      assert.notEqual(localized.prompt,localized.transfer);
      assert.ok(localized.duration>=5 && localized.duration<=20);
      assert.equal(getExercise(x.id)?.id,x.id);
    }
    if(x.version==='demo-0.3') assert.notEqual(localizeExercise(x,'fr').prompt,localizeExercise(x,'en').prompt,`EN missing for ${x.id}`);
  }
});

test('V0.3 : endpoints catalogue et entraînement ne divulguent aucune correction',()=>{
  for(const locale of ['fr','en']){
    const exposed=publicCatalog(locale);
    assert.equal(exposed.length,9);
    for(const item of exposed){
      assert.deepEqual(Object.keys(item).sort(),['category','duration','id','introduction','level','title','version'].sort());
      const full=localizeExercise(getExercise(item.id),locale);
      const training=publicTraining(full);
      assert.ok(!('explanation' in training));
      assert.ok(!('transfer' in training));
      assert.ok(!('review' in training));
      assert.ok(!('example' in training));
      assert.ok(!('guide' in training));
      assert.ok(!('hints' in training));
      assert.ok(!JSON.stringify(exposed).includes(full.transfer));
    }
  }
});
