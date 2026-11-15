// The page entry: one stage in every [data-ld-stage]. Built to a single script and stylesheet.
import { createRoot } from 'react-dom/client'
import LeadishHero from './Hero'

document.querySelectorAll<HTMLElement>('[data-ld-stage]').forEach((el) => {
  createRoot(el).render(<LeadishHero />)
})
