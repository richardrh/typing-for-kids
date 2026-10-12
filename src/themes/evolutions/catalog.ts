import type { AnimalStats } from '../../progress/progression'
import { getTheme, type ThemeId } from '../catalog'
import tigerGrowing from './assets/tiger-growing.svg'
import tigerBig from './assets/tiger-big.svg'
import tigerShiny from './assets/tiger-shiny.svg'
import dinosaurGrowing from './assets/dinosaur-growing.svg'
import dinosaurBig from './assets/dinosaur-big.svg'
import dinosaurShiny from './assets/dinosaur-shiny.svg'
import unicornGrowing from './assets/unicorn-growing.svg'
import unicornBig from './assets/unicorn-big.svg'
import unicornShiny from './assets/unicorn-shiny.svg'
import turtleGrowing from './assets/turtle-growing.svg'
import turtleBig from './assets/turtle-big.svg'
import turtleShiny from './assets/turtle-shiny.svg'
import orcaGrowing from './assets/orca-growing.svg'
import orcaBig from './assets/orca-big.svg'
import orcaShiny from './assets/orca-shiny.svg'
import tigerYoung from './assets/tiger-young.svg'
import dinosaurYoung from './assets/dinosaur-young.svg'
import unicornYoung from './assets/unicorn-young.svg'
import turtleYoung from './assets/turtle-young.svg'
import orcaYoung from './assets/orca-young.svg'
import sharkYoung from './assets/shark-young.svg'
import sharkGrowing from './assets/shark-growing.svg'
import sharkBig from './assets/shark-big.svg'
import sharkShiny from './assets/shark-shiny.svg'

type EvolutionStage = AnimalStats['stage']
export type PowerEffect = 'roar' | 'stomp' | 'magic' | 'shield' | 'splash' | 'dash'

export interface AnimalPower {
  readonly name: string
  readonly effect: PowerEffect
  readonly strength: 1 | 2 | 3
}

export interface AnimalEvolution {
  readonly name: string
  readonly minLevel: number
  readonly asset: string
  readonly features: readonly string[]
  readonly power: AnimalPower | null
}

// These are visual rewards only. Earned lesson progress remains the sole source
// of levels and scores; using a power never changes either.
const evolutions: Record<ThemeId, Record<EvolutionStage, AnimalEvolution>> = {
  tiger: {
    baby: { name: 'Tiger cub', minLevel: 1, asset: getTheme('tiger').asset, features: ['Round ears', 'Little paws'], power: null },
    young: { name: 'Bold cub', minLevel: 2, asset: tigerYoung, features: ['First little fangs', 'Alert brow', 'Fuller cheeks'], power: null },
    growing: { name: 'Young hunter', minLevel: 3, asset: tigerGrowing, features: ['Small fangs', 'Fierce eyebrows'], power: { name: 'Roar', effect: 'roar', strength: 1 } },
    big: { name: 'Jungle tiger', minLevel: 5, asset: tigerBig, features: ['Long fangs', 'Clawed paws', 'Thick stripes'], power: { name: 'Thunder roar', effect: 'roar', strength: 2 } },
    shiny: { name: 'Sunfire tiger', minLevel: 8, asset: tigerShiny, features: ['Saber fangs', 'Flame mane', 'Golden markings'], power: { name: 'Solar roar', effect: 'roar', strength: 3 } },
  },
  dinosaur: {
    baby: { name: 'T-Rex hatchling', minLevel: 1, asset: getTheme('dinosaur').asset, features: ['Friendly face', 'Little tail'], power: null },
    young: { name: 'Young T-Rex', minLevel: 2, asset: dinosaurYoung, features: ['First sharp teeth', 'Stronger hind legs'], power: null },
    growing: { name: 'Trail T-Rex', minLevel: 3, asset: dinosaurGrowing, features: ['Heavy toothed jaw', 'Long balancing tail', 'Short forearms'], power: { name: 'Stomp', effect: 'stomp', strength: 1 } },
    big: { name: 'Mighty T-Rex', minLevel: 5, asset: dinosaurBig, features: ['Powerful skull', 'Large teeth', 'Muscular hind legs'], power: { name: 'Quake stomp', effect: 'stomp', strength: 2 } },
    shiny: { name: 'Volcano T-Rex', minLevel: 8, asset: dinosaurShiny, features: ['Glowing scale armor', 'Mighty jaws', 'Golden claws'], power: { name: 'Meteor stomp', effect: 'stomp', strength: 3 } },
  },
  unicorn: {
    baby: { name: 'Little unicorn', minLevel: 1, asset: getTheme('unicorn').asset, features: ['Small golden horn', 'Soft mane'], power: null },
    young: { name: 'Bright unicorn', minLevel: 2, asset: unicornYoung, features: ['Longer spiral horn', 'Bright curled mane'], power: null },
    growing: { name: 'Sparkle unicorn', minLevel: 3, asset: unicornGrowing, features: ['Long spiral horn', 'Flowing mane'], power: { name: 'Sparkle', effect: 'magic', strength: 1 } },
    big: { name: 'Winged unicorn', minLevel: 5, asset: unicornBig, features: ['Feathered wings', 'Long magical horn'], power: { name: 'Rainbow magic', effect: 'magic', strength: 2 } },
    shiny: { name: 'Starlight unicorn', minLevel: 8, asset: unicornShiny, features: ['Rainbow wings', 'Glowing horn', 'Star markings'], power: { name: 'Star magic', effect: 'magic', strength: 3 } },
  },
  turtle: {
    baby: { name: 'Turtle hatchling', minLevel: 1, asset: getTheme('turtle').asset, features: ['Little shell', 'Small feet'], power: null },
    young: { name: 'Pond explorer', minLevel: 2, asset: turtleYoung, features: ['Raised shell ridges', 'Sturdy flippers'], power: null },
    growing: { name: 'Shell explorer', minLevel: 3, asset: turtleGrowing, features: ['Sturdy patterned shell', 'Strong flippers'], power: { name: 'Bubble shield', effect: 'shield', strength: 1 } },
    big: { name: 'Crystal turtle', minLevel: 5, asset: turtleBig, features: ['Crystal shell plates', 'Protective brow'], power: { name: 'Crystal shield', effect: 'shield', strength: 2 } },
    shiny: { name: 'Ocean guardian', minLevel: 8, asset: turtleShiny, features: ['Gemstone shell', 'Coral crown', 'Ocean glow'], power: { name: 'Ocean shield', effect: 'shield', strength: 3 } },
  },
  orca: {
    baby: { name: 'Orca calf', minLevel: 1, asset: getTheme('orca').asset, features: ['Little dorsal fin', 'Small tail'], power: null },
    young: { name: 'Young orca', minLevel: 2, asset: orcaYoung, features: ['Stronger dorsal fin', 'First visible teeth'], power: null },
    growing: { name: 'Reef hunter', minLevel: 3, asset: orcaGrowing, features: ['Stocky body', 'Wide toothy mouth', 'Powerful fins'], power: { name: 'Splash', effect: 'splash', strength: 1 } },
    big: { name: 'Deep hunter', minLevel: 5, asset: orcaBig, features: ['Heavy head and jaw', 'Large conical teeth', 'Broad tail flukes'], power: { name: 'Wave leap', effect: 'splash', strength: 2 } },
    shiny: { name: 'Ocean titan', minLevel: 8, asset: orcaShiny, features: ['Armored jaw', 'Huge tooth rows', 'Reinforced dorsal crest'], power: { name: 'Tidal surge', effect: 'splash', strength: 3 } },
  },
  shark: {
    baby: { name: 'Shark pup', minLevel: 1, asset: getTheme('shark').asset, features: ['Pointed snout', 'Little reef fins'], power: null },
    young: { name: 'Reef scout', minLevel: 2, asset: sharkYoung, features: ['Sharper dorsal fin', 'First triangular teeth'], power: null },
    growing: { name: 'Reef hunter', minLevel: 3, asset: sharkGrowing, features: ['Strong jaw', 'Alert eye', 'Sharp teeth'], power: { name: 'Fin dash', effect: 'dash', strength: 1 } },
    big: { name: 'Great shark', minLevel: 5, asset: sharkBig, features: ['Broad powerful body', 'Massive toothed mouth'], power: { name: 'Reef rush', effect: 'dash', strength: 2 } },
    shiny: { name: 'Megalodon', minLevel: 8, asset: sharkShiny, features: ['Enormous jaw', 'Huge triangular teeth', 'Massive body'], power: { name: 'Titan dash', effect: 'dash', strength: 3 } },
  },
}

export function getEvolution(theme: ThemeId, stage: EvolutionStage): AnimalEvolution {
  return evolutions[theme][stage]
}

const nextStage: Record<EvolutionStage, EvolutionStage | null> = {
  baby: 'young', young: 'growing', growing: 'big', big: 'shiny', shiny: null,
}

export function getNextEvolution(theme: ThemeId, stage: EvolutionStage): AnimalEvolution | null {
  const next = nextStage[stage]
  return next ? evolutions[theme][next] : null
}

export function getNextPowerEvolution(theme: ThemeId, stage: EvolutionStage): AnimalEvolution | null {
  let next = nextStage[stage]
  while (next) {
    const evolution = evolutions[theme][next]
    if (evolution.power) return evolution
    next = nextStage[next]
  }
  return null
}
