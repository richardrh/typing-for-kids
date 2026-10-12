import { onBeforeUnmount, ref, type Ref } from 'vue'
import { loadSoundPreference, saveSoundPreference } from '../progress/storage'

type AudioContextConstructor = new () => AudioContext

export interface KeySoundController {
  enabled: Ref<boolean>
  toggle(): void
  playKey(key: string, trustedGesture: boolean): void
}


export function useKeySound(): KeySoundController {
  const enabled = ref(loadSoundPreference())
  let context: AudioContext | undefined
  onBeforeUnmount(() => {
    if (context && context.state !== 'closed') void context.close().catch(() => undefined)
  })

  function toggle(): void {
    enabled.value = !enabled.value
    saveSoundPreference(enabled.value)
  }

  function playKey(key: string, trustedGesture: boolean): void {
    if (!enabled.value || !trustedGesture || !(key === 'Backspace' || key.length === 1)) return
    try {
      const browser = globalThis as typeof globalThis & {
        webkitAudioContext?: AudioContextConstructor
      }
      const Constructor = browser.AudioContext ?? browser.webkitAudioContext
      if (!Constructor) return
      context ??= new Constructor()
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const frequency = key === 'Backspace' ? 180 : 250 + (key.toLowerCase().charCodeAt(0) % 8) * 35
      const start = context.currentTime
      oscillator.frequency.setValueAtTime(frequency, start)
      oscillator.type = 'sine'
      gain.gain.setValueAtTime(0.035, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.06)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.onended = () => {
        oscillator.disconnect()
        gain.disconnect()
      }
      oscillator.start(start)
      oscillator.stop(start + 0.06)
      if (context.state === 'suspended') void context.resume().catch(() => undefined)
    } catch {
      // Audio is an enhancement and can be blocked by browser policy or tests.
    }
  }

  return { enabled, toggle, playKey }
}
