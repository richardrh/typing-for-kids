import { describe, expect, it } from 'vitest'
import { fingerForKey, keyTarget, physicalKeyId } from './keyMapping'

describe('keyTarget', () => {
  it('uses the opposite-hand Shift for uppercase letters', () => {
    expect(keyTarget('A')).toEqual({ key: 'a', shift: 'right' })
    expect(keyTarget('J')).toEqual({ key: 'j', shift: 'left' })
  })

  it('maps shifted digits and punctuation to their underlying keys', () => {
    expect(keyTarget('!')).toEqual({ key: '1', shift: 'right' })
    expect(keyTarget('?')).toEqual({ key: '/', shift: 'left' })
    expect(keyTarget(':')).toEqual({ key: ';', shift: 'left' })
    expect(keyTarget('_')).toEqual({ key: '-', shift: 'left' })
    expect(keyTarget('+')).toEqual({ key: '=', shift: 'left' })
  })

  it('maps space without Shift', () => {
    expect(keyTarget(' ')).toEqual({ key: 'space' })
  })

  it('returns undefined for unsupported characters', () => {
    expect(keyTarget('é')).toBeUndefined()
    expect(keyTarget('')).toBeUndefined()
  })
})

describe('physicalKeyId', () => {
  it('keeps physical Shift sides and printable key identities', () => {
    expect(physicalKeyId('ShiftLeft', 'Shift')).toBe('shift-left')
    expect(physicalKeyId('ShiftRight', 'Shift')).toBe('shift-right')
    expect(physicalKeyId('KeyA', 'A')).toBe('a')
    expect(physicalKeyId('Slash', '?')).toBe('/')
    expect(physicalKeyId('Minus', 'Dead')).toBe('-')
    expect(physicalKeyId('', '?')).toBe('/')
    expect(physicalKeyId('Space', ' ')).toBe('space')
    expect(physicalKeyId('', 'Backspace')).toBe('backspace')
  })
})

describe('next-key finger placement', () => {
  it.each([
    ['a', 'left', 'pinky'], ['s', 'left', 'ring'], ['d', 'left', 'middle'],
    ['f', 'left', 'index'], ['j', 'right', 'index'], ['k', 'right', 'middle'],
    ['l', 'right', 'ring'], [';', 'right', 'pinky'], ['c', 'left', 'middle'],
    ['b', 'left', 'index'], ['n', 'right', 'index'], [',', 'right', 'middle'],
    ['.', 'right', 'ring'], ['/', 'right', 'pinky'], ['5', 'left', 'index'],
    ['6', 'right', 'index'], ['8', 'right', 'middle'], ['9', 'right', 'ring'],
    ['0', 'right', 'pinky'], ['q', 'left', 'pinky'], ['e', 'left', 'middle'],
    ['i', 'right', 'middle'], ['o', 'right', 'ring'], ['p', 'right', 'pinky'],
  ] as const)('assigns %s to the %s %s finger', (key, hand, finger) => {
    expect(fingerForKey(key)).toEqual({ hand, finger })
  })

  it('uses thumbs for Space and opposite-hand pinkies for shifted targets', () => {
    expect(fingerForKey(keyTarget(' ')!.key)).toEqual({ hand: 'either', finger: 'thumb' })
    const percent = keyTarget('%')!
    expect(fingerForKey(percent.key)).toEqual({ hand: 'left', finger: 'index' })
    expect(fingerForKey(`shift-${percent.shift}`)).toEqual({ hand: 'right', finger: 'pinky' })
    const question = keyTarget('?')!
    expect(fingerForKey(question.key)).toEqual({ hand: 'right', finger: 'pinky' })
    expect(fingerForKey(`shift-${question.shift}`)).toEqual({ hand: 'left', finger: 'pinky' })
  })

  it('does not invent finger guidance for unknown physical keys', () => {
    expect(fingerForKey('Escape')).toBeUndefined()
    expect(fingerForKey('toString')).toBeUndefined()
    expect(fingerForKey('')).toBeUndefined()
  })
})
