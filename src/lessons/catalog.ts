import type { Category, Lesson } from './types'


export const categories: readonly Category[] = [
  { id: 'home-row', title: 'Home row & basics', description: 'Build a steady rhythm with the home-row keys.', level: 1 },
  { id: 'bottom-row', title: 'Bottom row', description: 'Reach down for new letters while returning home.', level: 2 },
  { id: 'top-row', title: 'Top row', description: 'Reach up for the remaining letter keys.', level: 3 },
  { id: 'left-hand', title: 'Left hand', description: 'Practice left-hand reaches on their own.', level: 4 },
  { id: 'right-hand', title: 'Right hand', description: 'Practice right-hand reaches on their own.', level: 5 },
  { id: 'full-keyboard', title: 'Full keyboard', description: 'Use every letter for animal words and sentences.', level: 6 },
  { id: 'capitals', title: 'Capital letters', description: 'Use Shift for names and sentence starts.', level: 7 },
  { id: 'numbers', title: 'Number row', description: 'Learn the digit keys one small group at a time.', level: 8 },
  { id: 'punctuation', title: 'Punctuation', description: 'Finish thoughts with common punctuation keys.', level: 9 },
]

const HOME = 'asdfghjkl '
const BOTTOM = 'asdfghjklzxcvbnm '
const TOP = 'qwertyuiopasdfghjklzxcvbnm '
const LEFT = 'qwertasdfgzxcvb '
const RIGHT = 'yuiophjklnm '
const LETTERS = 'abcdefghijklmnopqrstuvwxyz '
const CAPITALS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ '
const NUMBERS = LETTERS + '0123456789'
const PUNCTUATION = "abcdefghijklmnopqrstuvwxyz .,!?'-"

// IDs are persistent progress keys: change titles freely, but keep existing IDs.
export const lessons: readonly Lesson[] = [
  // Home row: a gentle drill, short words, then a phrase.
  { id: 'f-j-bumps', title: 'Find F and J', text: 'fff jjj fjf jfj', fingerHint: 'Left pointer on f. Right pointer on j.', categoryId: 'home-row', allowedCharacters: HOME },
  { id: 'home-row-hello', title: 'Home row', text: 'asdf jkl asdf jkl', fingerHint: 'Left fingers rest on a s d f. Right fingers rest on j k l.', categoryId: 'home-row', allowedCharacters: HOME },
  { id: 'home-row-garden', title: 'Home row words', text: 'a glad lad had a salad', fingerHint: 'Let the pointer fingers reach to g and h.', categoryId: 'home-row', allowedCharacters: HOME },
  { id: 'home-row-finger-flow', title: 'Home row flow', text: 'fall has a flag', fingerHint: 'Keep both hands resting on the home row as you type.', categoryId: 'home-row', allowedCharacters: HOME },

  // Bottom row adds only z, x, c, v, b, n, and m.
  { id: 'bottom-row-zigzag', title: 'Bottom row reaches', text: 'zxcv bnm zxcv', fingerHint: 'Reach down and return to the home row after each group.', categoryId: 'bottom-row', allowedCharacters: BOTTOM },
  { id: 'bottom-row-short-words', title: 'Bottom row words', text: 'bad cab dab fan', fingerHint: 'Use the bottom row in short words, then return home.', categoryId: 'bottom-row', allowedCharacters: BOTTOM },
  { id: 'bottom-row-van', title: 'A little van', text: 'a van can', fingerHint: 'Keep your thumbs on the space bar and find c, v, and n.', categoryId: 'bottom-row', allowedCharacters: BOTTOM },
  { id: 'bottom-row-black-van', title: 'A black van', text: 'a black van can dash', fingerHint: 'Reach down for b, c, and n without lifting your wrists.', categoryId: 'bottom-row', allowedCharacters: BOTTOM },

  // Top row completes the lowercase letter keys.
  { id: 'top-row-reaches', title: 'Top row reaches', text: 'qwer tyui op', fingerHint: 'Reach up and return to the home row after each group.', categoryId: 'top-row', allowedCharacters: TOP },
  { id: 'top-row-words', title: 'Top row words', text: 'type write quiet', fingerHint: 'Use light reaches to q, w, e, r, t, and y.', categoryId: 'top-row', allowedCharacters: TOP },
  { id: 'top-row-puppy', title: 'Animal phrases', text: 'pretty puppy', fingerHint: 'Reach up for the top-row letters, then return home.', categoryId: 'top-row', allowedCharacters: TOP },
  { id: 'top-row-quiet-puppy', title: 'Animal sentences', text: 'a quiet puppy will play', fingerHint: 'Return your fingers to the home row between each reach.', categoryId: 'top-row', allowedCharacters: TOP },

  // Left hand is intentionally restricted to its physical letter keys.
  { id: 'left-hand-reaches', title: 'Left-hand reaches', text: 'qwer asdf zxcv', fingerHint: 'Use only your left hand. Keep the right hand relaxed.', categoryId: 'left-hand', allowedCharacters: LEFT },
  { id: 'left-hand-cage', title: 'A vast cage', text: 'a vast cage', fingerHint: 'Reach from the left home keys to q, w, e, r, and t.', categoryId: 'left-hand', allowedCharacters: LEFT },
  { id: 'left-hand-brave-bear', title: 'A brave bear', text: 'a brave bear', fingerHint: 'Use your left hand for every letter and your thumb for spaces.', categoryId: 'left-hand', allowedCharacters: LEFT },
  { id: 'left-hand-safe-cat', title: 'A safe cat', text: 'a brave cat was safe', fingerHint: 'Keep your right hand still while the left hand works.', categoryId: 'left-hand', allowedCharacters: LEFT },

  // Right hand is intentionally restricted to its physical letter keys.
  { id: 'right-hand-reaches', title: 'Right-hand reaches', text: 'yui o phjkl n m', fingerHint: 'Use only your right hand. Keep the left hand relaxed.', categoryId: 'right-hand', allowedCharacters: RIGHT },
  { id: 'right-hand-words', title: 'Right-hand words', text: 'hop you jump', fingerHint: 'Reach up and down from the right home keys.', categoryId: 'right-hand', allowedCharacters: RIGHT },
  { id: 'right-hand-pony', title: 'A pony puppy', text: 'pony puppy', fingerHint: 'Use your right hand for every letter and your thumb for spaces.', categoryId: 'right-hand', allowedCharacters: RIGHT },
  { id: 'right-hand-sentence', title: 'My pink pony', text: 'my pink pony', fingerHint: 'Keep your left hand still while the right hand works.', categoryId: 'right-hand', allowedCharacters: RIGHT },

  // Full keyboard introduces animal words before sentences.
  { id: 'easy-animal-words', title: 'Animal words', text: 'cat dog calf fish', fingerHint: 'Use the right finger for each reach and return home often.', categoryId: 'full-keyboard', allowedCharacters: LETTERS },
  { id: 'animal-actions', title: 'Animal actions', text: 'a cat can hop a dog can jog', fingerHint: 'Use the right pointer for h and n, and return to the bumps.', categoryId: 'full-keyboard', allowedCharacters: LETTERS },
  { id: 'playground-words', title: 'Playground words', text: 'we play tag and hop', fingerHint: 'Reach to the top row, then return to the home row.', categoryId: 'full-keyboard', allowedCharacters: LETTERS },
  { id: 'full-keyboard-adventure', title: 'An animal adventure', text: 'the fox jumps and plays', fingerHint: 'Keep a smooth rhythm as you move across the whole keyboard.', categoryId: 'full-keyboard', allowedCharacters: LETTERS },

  // Capitals introduce Shift pairs before names and sentences.
  { id: 'silly-sentence', title: 'Capital word pairs', text: 'cat Cat dog Dog', fingerHint: 'Hold Shift with the opposite hand for each capital letter.', categoryId: 'capitals', allowedCharacters: CAPITALS },
  { id: 'tiny-adventure', title: 'Animal names', text: 'Cat Dog', fingerHint: 'Hold Shift for the first letter of each animal name.', categoryId: 'capitals', allowedCharacters: CAPITALS },
  { id: 'capitals-shift-pairs', title: 'More capital words', text: 'fish Fish fin Fin', fingerHint: 'Use the opposite Shift key from the letter you type.', categoryId: 'capitals', allowedCharacters: CAPITALS },
  { id: 'capitals-animal-sentence', title: 'A capital sentence', text: 'A fox can run', fingerHint: 'Use Shift for the first letter and keep spaces between words.', categoryId: 'capitals', allowedCharacters: CAPITALS },

  { id: 'numbers-groups', title: 'Number groups', text: '2 eggs 4 eggs 6 eggs', fingerHint: 'Reach up to the number row and return to the home row.', categoryId: 'numbers', allowedCharacters: NUMBERS },
  { id: 'numbers-pairs', title: 'Number pairs', text: '11 eggs 22 eggs 33 eggs 44 eggs', fingerHint: 'Keep a steady rhythm as you repeat each digit.', categoryId: 'numbers', allowedCharacters: NUMBERS },
  { id: 'numbers-row', title: 'The number row', text: '5 tracks 6 tracks 7 tracks 8 tracks 9 tracks', fingerHint: 'Move across the whole number row in two groups.', categoryId: 'numbers', allowedCharacters: NUMBERS },
  { id: 'numbers-counting', title: 'Counting by tens', text: '10 eggs 20 tracks 30 nests', fingerHint: 'Reach for each digit and use your thumb for spaces.', categoryId: 'numbers', allowedCharacters: NUMBERS },

  { id: 'punctuation-pause', title: 'A short pause', text: 'cat, dog.', fingerHint: 'Find comma after the first word and period at the end.', categoryId: 'punctuation', allowedCharacters: PUNCTUATION },
  { id: 'punctuation-question', title: 'Ask a question', text: 'who? what?', fingerHint: 'Use Shift with the slash key to type a question mark.', categoryId: 'punctuation', allowedCharacters: PUNCTUATION },
  { id: 'punctuation-exclaim', title: 'An exclamation', text: 'run! jump!', fingerHint: 'Use Shift with the number key to type an exclamation mark.', categoryId: 'punctuation', allowedCharacters: PUNCTUATION },
  { id: 'punctuation-apostrophe', title: 'An animal sentence', text: "it's a fox.", fingerHint: 'Use the apostrophe key inside a contraction, then finish with a period.', categoryId: 'punctuation', allowedCharacters: PUNCTUATION },
]

export function getLesson(id: string): Lesson | undefined {
  return lessons.find(lesson => lesson.id === id)
}

