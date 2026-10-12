import { describe, expect, it } from 'vitest'
import { themes } from '../themes/catalog'
import { categories, lessons } from './catalog'
import { themedLessons } from './themed'

describe('keyboard curriculum', () => {
  it('offers three to four ordered lessons per skill category with distinct progress IDs', () => {
    expect(new Set(lessons.map(lesson => lesson.id)).size).toBe(lessons.length)
    const categoryOrder = categories.map(category => category.id)
    const lessonOrder = lessons.map(lesson => categoryOrder.indexOf(lesson.categoryId))
    expect(lessonOrder).toEqual([...lessonOrder].sort((a, b) => a - b))
    for (const category of categories) {
      const count = lessons.filter(lesson => lesson.categoryId === category.id).length
      expect(count).toBeGreaterThanOrEqual(3)
      expect(count).toBeLessThanOrEqual(4)
    }
  })

  it('never asks for untaught keys in a constrained skill, including themed exercises', () => {
    const skillKeys = {
      'home-row': 'asdfghjkl ',
      'bottom-row': 'asdfghjklzxcvbnm ',
      'left-hand': 'qwertasdfgzxcvb ',
      'right-hand': 'yuiophjklnm ',
      numbers: 'abcdefghijklmnopqrstuvwxyz 0123456789',
    }
    for (const theme of themes) {
      for (const lesson of themedLessons(theme.id)) {
        for (const character of lesson.text) {
          expect(lesson.allowedCharacters, `${theme.id}/${lesson.id}`).toContain(character)
          if (lesson.categoryId in skillKeys) {
            expect(skillKeys[lesson.categoryId as keyof typeof skillKeys], lesson.id).toContain(character)
          }
        }
      }
    }
  })

  it('keeps later animal exercises meaningful and distinct', () => {
    const capitalLessons = themes.map(theme =>
      themedLessons(theme.id).filter(lesson => lesson.categoryId === 'capitals'),
    )
    for (const index of capitalLessons[0].map((_, lessonIndex) => lessonIndex)) {
      const texts = capitalLessons.map(lessonsForTheme => lessonsForTheme[index].text)
      expect(new Set(texts).size).toBe(themes.length)
      for (const text of texts) expect(text).toMatch(/[A-Z]/)
    }

    const numberLessons = themes.map(theme =>
      themedLessons(theme.id).filter(lesson => lesson.categoryId === 'numbers'),
    )
    for (const index of numberLessons[0].map((_, lessonIndex) => lessonIndex)) {
      const texts = numberLessons.map(lessonsForTheme => lessonsForTheme[index].text)
      expect(new Set(texts).size).toBe(themes.length)
      for (const text of texts) expect(text).toMatch(/\d/)
    }
    for (const lessonsForTheme of numberLessons) {
      for (const lesson of lessonsForTheme) {
        expect(lesson.allowedCharacters).toContain('a')
        expect(lesson.allowedCharacters).toContain(' ')
        expect(lesson.allowedCharacters).toContain('0')
      }
    }
  })
})
