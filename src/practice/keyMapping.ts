export type ShiftHand = 'left' | 'right'

export interface KeyTarget {
  /** The physical key that produces the character without Shift. */
  readonly key: string
  /** Shift is required, and this is the side that should be pressed. */
  readonly shift?: ShiftHand
}

export type Finger = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb'
export interface FingerPlacement {
  readonly hand: ShiftHand | 'either'
  readonly finger: Finger
}

const FINGER_KEYS = [
  { hand: 'left', finger: 'pinky', keys: '`1qaz' },
  { hand: 'left', finger: 'ring', keys: '2wsx' },
  { hand: 'left', finger: 'middle', keys: '3edc' },
  { hand: 'left', finger: 'index', keys: '45rtfgvb' },
  { hand: 'right', finger: 'index', keys: '67yuhjnm' },
  { hand: 'right', finger: 'middle', keys: '8ik,' },
  { hand: 'right', finger: 'ring', keys: '9ol.' },
  { hand: 'right', finger: 'pinky', keys: "0-=p[]\\;'/" },
] as const

const KEY_FINGERS: Record<string, FingerPlacement> = Object.create(null)
for (const group of FINGER_KEYS) {
  const placement: FingerPlacement = { hand: group.hand, finger: group.finger }
  for (const key of group.keys) KEY_FINGERS[key] = placement
}
KEY_FINGERS.space = { hand: 'either', finger: 'thumb' }
KEY_FINGERS.backspace = KEY_FINGERS['p']
KEY_FINGERS['shift-left'] = KEY_FINGERS['a']
KEY_FINGERS['shift-right'] = KEY_FINGERS['p']

export function fingerForKey(key: string): FingerPlacement | undefined {
  return KEY_FINGERS[key]
}

const SHIFTED_SYMBOLS: Readonly<Record<string, string>> = {
  '~': '`',
  '!': '1',
  '@': '2',
  '#': '3',
  '$': '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
  '_': '-',
  '+': '=',
  '{': '[',
  '}': ']',
  '|': '\\',
  ':': ';',
  '"': "'",
  '<': ',',
  '>': '.',
  '?': '/',
}

const CODE_KEYS: Readonly<Record<string, string>> = {
  Backquote: '`',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
}

/** Return the keyboard target for a lesson's next character. */
export function keyTarget(character: string): KeyTarget | undefined {
  if (character === ' ') return { key: 'space' }
  if (character === 'Backspace') return { key: 'backspace' }
  if (character.length !== 1) return undefined

  if (character >= 'a' && character <= 'z') return { key: character }
  if (character >= 'A' && character <= 'Z') {
    const key = character.toLowerCase()
    return { key, shift: fingerForKey(key)?.hand === 'left' ? 'right' : 'left' }
  }
  if (character >= '0' && character <= '9') return { key: character }
  const unshifted = SHIFTED_SYMBOLS[character]
  if (unshifted) return { key: unshifted, shift: fingerForKey(unshifted)?.hand === 'left' ? 'right' : 'left' }
  if ("`-=[]\\;',./".includes(character)) return { key: character }
  return undefined
}

/** Convert a KeyboardEvent's physical code to a key-cap identifier. */
export function physicalKeyId(code: string, key = ''): string {
  if (code === 'Space' || key === ' ') return 'space'
  if (code === 'Backspace' || key === 'Backspace') return 'backspace'
  if (code === 'ShiftLeft') return 'shift-left'
  if (code === 'ShiftRight') return 'shift-right'
  if (/^(?:Key|Digit)/.test(code)) return code.slice(code.startsWith('Digit') ? 5 : 3).toLowerCase()
  const target = keyTarget(key)
  return CODE_KEYS[code] ?? target?.key ?? (key.length === 1 ? key.toLowerCase() : key)
}

export function shiftKeyId(hand: ShiftHand): string {
  return hand === 'left' ? 'shift-left' : 'shift-right'
}

