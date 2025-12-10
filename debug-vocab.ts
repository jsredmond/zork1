import { Vocabulary } from './src/parser/vocabulary.js';

const vocabulary = new Vocabulary();
console.log('POT word type:', vocabulary.lookupWord('POT'));
console.log('pot word type:', vocabulary.lookupWord('pot'));
console.log('GOLD word type:', vocabulary.lookupWord('GOLD'));
console.log('gold word type:', vocabulary.lookupWord('gold'));
