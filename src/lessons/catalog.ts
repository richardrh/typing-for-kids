import type { Lesson } from './types'

// IDs are persistent progress keys: change titles freely, but keep existing IDs.
export const lessons: readonly Lesson[] = [
  { id: 'f-j-bumps', title: 'Find F and J', text: 'fff jjj fjf jfj', fingerHint: 'Left pointer on f. Right pointer on j.' },
  { id: 'home-row-hello', title: 'Home row', text: 'asdf jkl asdf jkl', fingerHint: 'Left fingers rest on a s d f. Right pointer, middle, and ring fingers rest on j k l.' },
  { id: 'home-row-garden', title: 'Home row words', text: 'a glad lad had a salad', fingerHint: 'Let the pointer fingers reach to g and h.' },
  { id: 'easy-animal-words', title: 'Animal words', text: 'cat dog calf fish', fingerHint: 'Left middle finger for c, left pointer for t, right middle for i, and right ring for o.' },
  { id: 'animal-actions', title: 'Animal actions', text: 'a cat can hop a dog can jog', fingerHint: 'Use the right pointer for h and n, left middle for d, and right middle for k.' },
  { id: 'playground-words', title: 'Playground words', text: 'we play tag and hop', fingerHint: 'Left ring finger for w, left middle for e, and right pointer for y.' },
  { id: 'silly-sentence', title: 'A silly sentence', text: 'a frog can jog fast', fingerHint: 'Return your fingers to the home row between reaches.' },
  { id: 'tiny-adventure', title: 'One more sentence', text: 'we can play and laugh', fingerHint: 'Reach your right pointer up to u, then return to the bump on j.' },
]

export function getLesson(id: string): Lesson | undefined {
  return lessons.find(lesson => lesson.id === id)
}
