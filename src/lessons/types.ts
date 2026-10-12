export type CategoryId =
  | 'home-row'
  | 'bottom-row'
  | 'top-row'
  | 'left-hand'
  | 'right-hand'
  | 'full-keyboard'
  | 'capitals'
  | 'numbers'
  | 'punctuation'

export interface Category {
  readonly id: CategoryId
  readonly title: string
  readonly description: string
  readonly level: number
}

export interface Lesson {
  readonly id: string
  readonly title: string
  readonly text: string
  readonly fingerHint: string
  readonly categoryId: CategoryId
  readonly allowedCharacters: string
}
