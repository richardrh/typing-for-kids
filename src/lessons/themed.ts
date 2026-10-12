import type { ThemeId } from '../themes/catalog'
import { lessons } from './catalog'
import type { Lesson } from './types'

// Keep keyboard drills, then introduce short themed words before sentences.
const texts: Record<ThemeId, readonly string[]> = {
  dinosaur: ['fff jjj fjf jfj', 'asdf jkl asdf jkl', 'dig egg big', 'egg nest tail claw', 'a big egg can hatch', 'dig in the sand', 'a little dino can run', 'the big dino has a long tail'],
  unicorn: ['fj fj ff jj fj', 'asd jkl sad lad', 'sky sun gem', 'star moon pink wing', 'a pink gem can shine', 'hop on a soft cloud', 'a unicorn can fly high', 'the unicorn has a shiny horn'],
  turtle: ['jjj fff jfj fjf', 'jkl asdf lad sad', 'sea sun wet', 'pond sand swim shell', 'a turtle can swim', 'sit on a warm rock', 'the baby turtle is slow', 'a little turtle swims to the sea'],
  tiger: ['ff jj fj jf ff', 'sad lad asdf jkl', 'cat paw cub', 'cub tail roar paw', 'a cub can run fast', 'hide in the tall grass', 'the tiger has big paws', 'a tiger cub naps by the tree'],
  orca: ['jf jf jj ff jf', 'lad sad jkl asdf', 'sea fin ice', 'fin wave fish dive', 'an orca can dive', 'swim in the blue sea', 'the orca jumps up high', 'an orca swims with its family'],
}

export function themedLessons(theme: ThemeId): readonly Lesson[] {
  return lessons.map((lesson, index) => ({
    ...lesson,
    title: index === 2 ? 'Short words' : lesson.title,
    text: texts[theme][index],
    fingerHint: index < 2 ? lesson.fingerHint : 'Rest your fingers on a s d f and j k l. Return to the bumps on f and j after each reach.',
  }))
}
