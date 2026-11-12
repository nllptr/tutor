import type { TutorDesktop } from '../shared/desktop'

declare global {
  interface Window { tutor: TutorDesktop }
}
